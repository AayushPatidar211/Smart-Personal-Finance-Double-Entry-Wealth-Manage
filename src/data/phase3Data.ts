export const USER_JAVA = `package com.finwise.entity;

import com.finwise.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "uk_users_email", columnList = "email", unique = true),
    @Index(name = "idx_users_role_status", columnList = "role, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 80)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "currency_code", nullable = false, length = 3)
    @Builder.Default
    private String currencyCode = "USD";

    @Column(name = "timezone", nullable = false, length = 50)
    @Builder.Default
    private String timezone = "UTC";

    @Column(name = "failed_attempt_count", nullable = false)
    @Builder.Default
    private int failedAttemptCount = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private User2FA twoFactorAuth;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Account> accounts = new ArrayList<>();

    public enum Role { ROLE_USER, ROLE_PREMIUM_USER, ROLE_ADMIN }
    public enum UserStatus { ACTIVE, PENDING_VERIFICATION, LOCKED, SUSPENDED }
}`;

export const ACCOUNT_JAVA = `package com.finwise.entity;

import com.finwise.common.BaseEntity;
import com.finwise.exception.InsufficientFundsException;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "accounts", indexes = {
    @Index(name = "idx_accounts_user_active", columnList = "user_id, is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_name", nullable = false, length = 100)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 30)
    private AccountType accountType;

    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

    public void credit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        this.balance = this.balance.add(amount).setScale(2, RoundingMode.HALF_EVEN);
    }

    public void debit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (this.accountType != AccountType.CREDIT_CARD && this.balance.compareTo(amount) < 0) {
            throw new InsufficientFundsException(this.getId(), this.balance, amount);
        }
        this.balance = this.balance.subtract(amount).setScale(2, RoundingMode.HALF_EVEN);
    }

    public enum AccountType { CHECKING, SAVINGS, CREDIT_CARD, CASH, INVESTMENT }
}`;

export const TRANSACTION_JAVA = `package com.finwise.entity;

import com.finwise.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_tx_user_date", columnList = "user_id, transaction_date DESC"),
    @Index(name = "idx_tx_user_category", columnList = "user_id, category_id"),
    @Index(name = "idx_tx_checksum", columnList = "user_id, checksum_hash")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_account_id")
    private Account destinationAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "checksum_hash", nullable = false, length = 64)
    private String checksumHash;

    public enum TransactionType { INCOME, EXPENSE, TRANSFER }
    public enum TransactionStatus { PENDING, COMPLETED, VOID, RECONCILED }
}`;

export const ACCOUNT_REPOSITORY_JAVA = `package com.finwise.repository;

import com.finwise.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserIdAndIsActiveTrueAndIsDeletedFalse(Long userId);

    /**
     * CRITICAL FINTECH METHOD: Acquires database-level PESSIMISTIC_WRITE (SELECT ... FOR UPDATE).
     * Prevents race conditions, double-spending and deadlock on transfers.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id AND a.isDeleted = false")
    Optional<Account> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a WHERE a.user.id = :userId AND a.isActive = true AND a.isDeleted = false")
    BigDecimal sumTotalNetWorthByUserId(@Param("userId") Long userId);
}`;

export const TRANSACTION_REPOSITORY_JAVA = `package com.finwise.repository;

import com.finwise.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserIdAndTransactionDateBetweenAndIsDeletedFalse(
            Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * Idempotency Check: Fast index-scan on (user_id, checksum_hash) to reject duplicates.
     */
    boolean existsByUserIdAndChecksumHashAndIsDeletedFalse(Long userId, String checksumHash);

    /**
     * Aggregate expenses by category for Chart.js compatible JSON.
     */
    @Query("SELECT t.category.id AS categoryId, t.category.name AS categoryName, t.category.colorHex AS colorHex, " +
           "SUM(t.amount) AS totalAmount " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionType = 'EXPENSE' AND t.isDeleted = false " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category.id, t.category.name, t.category.colorHex " +
           "ORDER BY totalAmount DESC")
    List<CategoryExpenseProjection> aggregateExpensesByCategory(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    interface CategoryExpenseProjection {
        Long getCategoryId();
        String getCategoryName();
        String getColorHex();
        BigDecimal getTotalAmount();
    }
}`;
