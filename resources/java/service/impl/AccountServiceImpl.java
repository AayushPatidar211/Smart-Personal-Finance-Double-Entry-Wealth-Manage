package com.finwise.service.impl;

import com.finwise.dto.account.*;
import com.finwise.entity.Account;
import com.finwise.entity.Category;
import com.finwise.entity.Transaction;
import com.finwise.entity.User;
import com.finwise.exception.BusinessException;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.repository.AccountRepository;
import com.finwise.repository.CategoryRepository;
import com.finwise.repository.TransactionRepository;
import com.finwise.repository.UserRepository;
import com.finwise.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String IDEMPOTENCY_PREFIX = "transfer:idempotency:";
    private static final String BALANCE_CACHE_PREFIX = "account:balance:";

    @Override
    @Transactional
    public AccountResponse createAccount(Long userId, CreateAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        BigDecimal initialBal = request.getOpeningBalance() != null ?
                request.getOpeningBalance().setScale(2, RoundingMode.HALF_EVEN) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

        Account account = Account.builder()
                .user(user)
                .accountName(request.getAccountName().trim())
                .accountType(request.getAccountType())
                .currencyCode(request.getCurrencyCode().toUpperCase())
                .openingBalance(initialBal)
                .balance(initialBal)
                .institutionName(request.getInstitutionName())
                .accountNumberMasked(request.getAccountNumberMasked())
                .isActive(true)
                .build();

        Account saved = accountRepository.save(account);
        cacheBalance(saved.getId(), saved.getBalance());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long userId, Long accountId) {
        Account account = accountRepository.findByIdAndUserIdAndIsDeletedFalse(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        return mapToResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(Long userId) {
        return accountRepository.findByUserIdAndIsActiveTrueAndIsDeletedFalse(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Atomically executes inter-account transfer:
     * 1. Idempotency guard via Redis (blocks double-click submissions)
     * 2. Deterministic lock ordering (min ID then max ID) to prevent deadlock
     * 3. Pessimistic read + Optimistic version increment
     * 4. Double-entry ledger audit generation
     */
    @Override
    @Transactional
    public TransferResponse transferFunds(Long userId, TransferRequest request) {
        if (request.getSourceAccountId().equals(request.getDestinationAccountId())) {
            throw new BusinessException("Source and destination accounts must be different", HttpStatus.BAD_REQUEST);
        }

        // 1. Idempotency Check
        String idempKey = IDEMPOTENCY_PREFIX + request.getIdempotencyKey();
        Boolean isFirstRequest = redisTemplate.opsForValue().setIfAbsent(idempKey, "PROCESSING", Duration.ofHours(24));
        if (Boolean.FALSE.equals(isFirstRequest)) {
            throw new BusinessException("Duplicate transfer request detected with idempotency key: " + request.getIdempotencyKey(), HttpStatus.CONFLICT);
        }

        // 2. Deadlock Prevention: Always acquire row locks in ascending ID order
        Long firstLockId = Math.min(request.getSourceAccountId(), request.getDestinationAccountId());
        Long secondLockId = Math.max(request.getSourceAccountId(), request.getDestinationAccountId());

        Account firstLocked = accountRepository.findByIdForUpdate(firstLockId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", firstLockId));
        Account secondLocked = accountRepository.findByIdForUpdate(secondLockId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", secondLockId));

        Account source = request.getSourceAccountId().equals(firstLockId) ? firstLocked : secondLocked;
        Account destination = request.getDestinationAccountId().equals(firstLockId) ? firstLocked : secondLocked;

        // Verify Ownership
        if (!source.getUser().getId().equals(userId)) {
            throw new BusinessException("User does not own the source account", HttpStatus.FORBIDDEN);
        }

        BigDecimal transferAmount = request.getAmount().setScale(2, RoundingMode.HALF_EVEN);

        // 3. Balance Adjustments (Debit & Credit with business rule checks)
        source.debit(transferAmount);
        destination.credit(transferAmount);

        accountRepository.save(source);
        accountRepository.save(destination);

        // 4. Record Double-Entry Transfer Transaction
        Category transferCategory = categoryRepository.findBySlug("internal-transfer")
                .orElseGet(() -> categoryRepository.findAll().get(0));

        String checksum = computeTransferChecksum(userId, source.getId(), destination.getId(), transferAmount, LocalDate.now());

        Transaction transferTx = Transaction.builder()
                .user(source.getUser())
                .account(source)
                .destinationAccount(destination)
                .category(transferCategory)
                .transactionType(Transaction.TransactionType.TRANSFER)
                .amount(transferAmount)
                .currencyCode(source.getCurrencyCode())
                .transactionDate(LocalDate.now())
                .description(request.getDescription())
                .checksumHash(checksum)
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();

        Transaction savedTx = transactionRepository.save(transferTx);

        // 5. Invalidate / Update Redis Caches
        evictBalanceCache(source.getId());
        evictBalanceCache(destination.getId());

        log.info("Transferred {} {} from account {} to account {} (Tx ID: {})",
                transferAmount, source.getCurrencyCode(), source.getId(), destination.getId(), savedTx.getId());

        return TransferResponse.builder()
                .transactionId(savedTx.getId())
                .sourceAccountId(source.getId())
                .destinationAccountId(destination.getId())
                .amount(transferAmount)
                .sourceNewBalance(source.getBalance())
                .destinationNewBalance(destination.getBalance())
                .idempotencyKey(request.getIdempotencyKey())
                .timestamp(Instant.now())
                .status("COMPLETED")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getNetWorth(Long userId) {
        return accountRepository.sumTotalNetWorthByUserId(userId);
    }

    @Override
    @Transactional
    public void deactivateAccount(Long userId, Long accountId) {
        Account account = accountRepository.findByIdAndUserIdAndIsDeletedFalse(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessException("Cannot close account with non-zero balance. Please transfer funds first.", HttpStatus.BAD_REQUEST);
        }
        account.setActive(false);
        accountRepository.save(account);
        evictBalanceCache(accountId);
    }

    @Override
    @Transactional
    public AccountResponse reconcileBalance(Long userId, Long accountId) {
        Account account = accountRepository.findByIdAndUserIdAndIsDeletedFalse(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        cacheBalance(accountId, account.getBalance());
        return mapToResponse(account);
    }

    private void cacheBalance(Long accountId, BigDecimal balance) {
        try {
            redisTemplate.opsForValue().set(BALANCE_CACHE_PREFIX + accountId, balance.toPlainString(), Duration.ofMinutes(10));
        } catch (Exception e) {
            log.warn("Redis balance cache write failed: {}", e.getMessage());
        }
    }

    private void evictBalanceCache(Long accountId) {
        try {
            redisTemplate.delete(BALANCE_CACHE_PREFIX + accountId);
        } catch (Exception e) {
            log.warn("Redis balance cache eviction failed: {}", e.getMessage());
        }
    }

    private String computeTransferChecksum(Long userId, Long src, Long dest, BigDecimal amount, LocalDate date) {
        try {
            String raw = String.format("%d|%d|%d|%s|%s", userId, src, dest, amount.toPlainString(), date.toString());
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(raw.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Hash error", e);
        }
    }

    private AccountResponse mapToResponse(Account a) {
        return AccountResponse.builder()
                .id(a.getId())
                .userId(a.getUser().getId())
                .accountName(a.getAccountName())
                .accountType(a.getAccountType())
                .currencyCode(a.getCurrencyCode())
                .balance(a.getBalance())
                .openingBalance(a.getOpeningBalance())
                .institutionName(a.getInstitutionName())
                .accountNumberMasked(a.getAccountNumberMasked())
                .isActive(a.isActive())
                .version(a.getVersion())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
