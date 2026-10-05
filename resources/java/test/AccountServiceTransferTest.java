package com.finwise.service;

import com.finwise.dto.account.TransferRequest;
import com.finwise.dto.account.TransferResponse;
import com.finwise.entity.Account;
import com.finwise.entity.Category;
import com.finwise.entity.Transaction;
import com.finwise.entity.User;
import com.finwise.exception.BusinessException;
import com.finwise.repository.*;
import com.finwise.service.impl.AccountServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTransferTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AccountServiceImpl accountService;

    private User testUser;
    private Account sourceAccount;
    private Account destAccount;
    private Category transferCategory;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("alex@example.com").build();

        sourceAccount = Account.builder()
                .id(101L)
                .user(testUser)
                .accountName("Chase Checking")
                .accountType(Account.AccountType.CHECKING)
                .balance(new BigDecimal("1000.00"))
                .currencyCode("USD")
                .isActive(true)
                .version(1L)
                .build();

        destAccount = Account.builder()
                .id(102L)
                .user(testUser)
                .accountName("Marcus Savings")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("500.00"))
                .currencyCode("USD")
                .isActive(true)
                .version(1L)
                .build();

        transferCategory = Category.builder()
                .id(10L)
                .name("Internal Transfer")
                .slug("internal-transfer")
                .build();

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("Should successfully transfer funds between two accounts with optimistic lock check")
    void testSuccessfulTransfer() {
        TransferRequest request = TransferRequest.builder()
                .sourceAccountId(101L)
                .destinationAccountId(102L)
                .amount(new BigDecimal("250.00"))
                .description("Savings allocation")
                .idempotencyKey("idemp-unit-1")
                .build();

        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);
        when(accountRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByIdForUpdate(102L)).thenReturn(Optional.of(destAccount));
        when(categoryRepository.findBySlug("internal-transfer")).thenReturn(Optional.of(transferCategory));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            tx.setId(999L);
            return tx;
        });

        TransferResponse response = accountService.transferFunds(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getAmount()).isEqualByComparingTo("250.00");
        assertThat(response.getSourceNewBalance()).isEqualByComparingTo("750.00");
        assertThat(response.getDestinationNewBalance()).isEqualByComparingTo("750.00");

        // Verify account mutations and saves
        verify(accountRepository).save(sourceAccount);
        verify(accountRepository).save(destAccount);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw BusinessException when source account has insufficient funds")
    void testInsufficientBalanceThrowsException() {
        TransferRequest request = TransferRequest.builder()
                .sourceAccountId(101L)
                .destinationAccountId(102L)
                .amount(new BigDecimal("1500.00")) // Exceeds $1000 balance
                .description("Excessive transfer")
                .idempotencyKey("idemp-insufficient")
                .build();

        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);
        when(accountRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByIdForUpdate(102L)).thenReturn(Optional.of(destAccount));

        assertThatThrownBy(() -> accountService.transferFunds(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient funds");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject transfer when duplicate idempotency key is submitted")
    void testDuplicateIdempotencyKeyRejected() {
        TransferRequest request = TransferRequest.builder()
                .sourceAccountId(101L)
                .destinationAccountId(102L)
                .amount(new BigDecimal("100.00"))
                .description("Duplicate request")
                .idempotencyKey("idemp-existing-key")
                .build();

        // Simulate Redis returning false (already exists)
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);

        assertThatThrownBy(() -> accountService.transferFunds(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Duplicate transfer request detected");

        verify(accountRepository, never()).findByIdForUpdate(anyLong());
    }
}
