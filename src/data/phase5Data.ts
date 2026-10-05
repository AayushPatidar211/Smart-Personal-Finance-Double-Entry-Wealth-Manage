export const ACCOUNT_SERVICE_JAVA = `package com.finwise.service;

import com.finwise.dto.account.*;
import java.math.BigDecimal;
import java.util.List;

public interface AccountService {
    AccountResponse createAccount(Long userId, CreateAccountRequest request);
    AccountResponse getAccountById(Long userId, Long accountId);
    List<AccountResponse> getUserAccounts(Long userId);
    TransferResponse transferFunds(Long userId, TransferRequest request);
    BigDecimal getNetWorth(Long userId);
    void deactivateAccount(Long userId, Long accountId);
    AccountResponse reconcileBalance(Long userId, Long accountId);
}`;

export const ACCOUNT_SERVICE_IMPL_JAVA = `package com.finwise.service.impl;

import com.finwise.dto.account.*;
import com.finwise.entity.*;
import com.finwise.exception.*;
import com.finwise.repository.*;
import com.finwise.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public TransferResponse transferFunds(Long userId, TransferRequest request) {
        if (request.getSourceAccountId().equals(request.getDestinationAccountId())) {
            throw new BusinessException("Source and destination accounts must be different", HttpStatus.BAD_REQUEST);
        }

        // 1. Idempotency Check via Redis
        String idempKey = "transfer:idempotency:" + request.getIdempotencyKey();
        Boolean isFirst = redisTemplate.opsForValue().setIfAbsent(idempKey, "PROCESSING", Duration.ofHours(24));
        if (Boolean.FALSE.equals(isFirst)) {
            throw new BusinessException("Duplicate transfer request: " + request.getIdempotencyKey(), HttpStatus.CONFLICT);
        }

        // 2. Deadlock-Free Row Lock Order (min ID first)
        Long firstId = Math.min(request.getSourceAccountId(), request.getDestinationAccountId());
        Long secondId = Math.max(request.getSourceAccountId(), request.getDestinationAccountId());

        Account first = accountRepository.findByIdForUpdate(firstId).orElseThrow();
        Account second = accountRepository.findByIdForUpdate(secondId).orElseThrow();

        Account src = request.getSourceAccountId().equals(firstId) ? first : second;
        Account dest = request.getDestinationAccountId().equals(firstId) ? first : second;

        BigDecimal amount = request.getAmount().setScale(2, RoundingMode.HALF_EVEN);

        // 3. Invariant Checks & Balance Mutators (Triggers JPA @Version increment)
        src.debit(amount);
        dest.credit(amount);

        accountRepository.save(src);
        accountRepository.save(dest);

        // 4. Save Double-Entry Ledger Transaction
        Transaction tx = Transaction.builder()
                .user(src.getUser())
                .account(src)
                .destinationAccount(dest)
                .transactionType(Transaction.TransactionType.TRANSFER)
                .amount(amount)
                .transactionDate(LocalDate.now())
                .description(request.getDescription())
                .checksumHash("idemp-" + request.getIdempotencyKey())
                .build();
        transactionRepository.save(tx);

        return TransferResponse.builder()
                .transactionId(tx.getId())
                .sourceAccountId(src.getId())
                .destinationAccountId(dest.getId())
                .amount(amount)
                .sourceNewBalance(src.getBalance())
                .destinationNewBalance(dest.getBalance())
                .build();
    }
}`;

export const WALLET_CONTROLLER_JAVA = `package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.account.TransferRequest;
import com.finwise.dto.account.TransferResponse;
import com.finwise.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final AccountService accountService;

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            Principal principal) {
        Long userId = 1L;
        TransferResponse response = accountService.transferFunds(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", response));
    }
}`;
