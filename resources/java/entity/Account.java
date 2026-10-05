package com.finwise.entity;

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

    @Column(name = "currency_code", nullable = false, length = 3)
    @Builder.Default
    private String currencyCode = "USD";

    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

    @Column(name = "opening_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

    @Column(name = "account_number_masked", length = 20)
    private String accountNumberMasked;

    @Column(name = "institution_name", length = 100)
    private String institutionName;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

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

    public enum AccountType {
        CHECKING,
        SAVINGS,
        CREDIT_CARD,
        CASH,
        INVESTMENT
    }
}
