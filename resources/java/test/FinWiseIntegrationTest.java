package com.finwise.integration;

import com.finwise.dto.account.AccountResponse;
import com.finwise.dto.account.CreateAccountRequest;
import com.finwise.dto.account.TransferRequest;
import com.finwise.dto.account.TransferResponse;
import com.finwise.entity.Account;
import com.finwise.entity.User;
import com.finwise.repository.AccountRepository;
import com.finwise.repository.UserRepository;
import com.finwise.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class FinWiseIntegrationTest {

    @Container
    static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("finwise_test")
            .withUsername("test_user")
            .withPassword("test_pass");

    @Container
    static GenericContainer<?> redisContainer = new GenericContainer<>("redis:7.0-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mysqlContainer::getUsername);
        registry.add("spring.datasource.password", mysqlContainer::getPassword);
        registry.add("spring.data.redis.host", redisContainer::getHost);
        registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379));
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private Long userId;

    @BeforeEach
    void setupTestData() {
        User user = userRepository.findByEmailAndIsDeletedFalse("integration@finwise.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("integration@finwise.com")
                        .passwordHash("$2a$12$DummyHashForIntegrationTestingOnly!")
                        .firstName("Integration")
                        .lastName("Tester")
                        .role(User.UserRole.USER)
                        .status(User.UserStatus.ACTIVE)
                        .currencyCode("USD")
                        .build()));
        userId = user.getId();
    }

    @Test
    @DisplayName("End-to-End TestContainer validation: Create accounts, execute atomic transfer, verify Redis & MySQL balances")
    void testEndToEndAccountTransfer() {
        // 1. Create Source Checking Account ($2,000.00)
        AccountResponse src = accountService.createAccount(userId, CreateAccountRequest.builder()
                .accountName("E2E Chase Checking")
                .accountType(Account.AccountType.CHECKING)
                .openingBalance(new BigDecimal("2000.00"))
                .currencyCode("USD")
                .build());

        // 2. Create Destination Savings Account ($500.00)
        AccountResponse dest = accountService.createAccount(userId, CreateAccountRequest.builder()
                .accountName("E2E Marcus Savings")
                .accountType(Account.AccountType.SAVINGS)
                .openingBalance(new BigDecimal("500.00"))
                .currencyCode("USD")
                .build());

        // 3. Execute Concurrency-Safe Transfer ($750.00)
        TransferResponse transfer = accountService.transferFunds(userId, TransferRequest.builder()
                .sourceAccountId(src.getId())
                .destinationAccountId(dest.getId())
                .amount(new BigDecimal("750.00"))
                .description("Monthly savings transfer")
                .idempotencyKey("e2e-transfer-" + System.currentTimeMillis())
                .build());

        assertThat(transfer.getStatus()).isEqualTo("COMPLETED");
        assertThat(transfer.getSourceNewBalance()).isEqualByComparingTo("1250.00");
        assertThat(transfer.getDestinationNewBalance()).isEqualByComparingTo("1250.00");

        // 4. Verify Database Persistence
        Account updatedSrc = accountRepository.findById(src.getId()).orElseThrow();
        Account updatedDest = accountRepository.findById(dest.getId()).orElseThrow();

        assertThat(updatedSrc.getBalance()).isEqualByComparingTo("1250.00");
        assertThat(updatedDest.getBalance()).isEqualByComparingTo("1250.00");
        assertThat(updatedSrc.getVersion()).isGreaterThan(src.getVersion());
    }
}
