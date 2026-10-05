package com.finwise.entity;

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
    @Index(name = "idx_tx_account", columnList = "account_id"),
    @Index(name = "idx_tx_dest_account", columnList = "destination_account_id"),
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
    @JoinColumn(name = "destination_account_id") // Only non-null for transfers
    private Account destinationAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "fee_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal feeAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

    @Column(name = "currency_code", nullable = false, length = 3)
    @Builder.Default
    private String currencyCode = "USD";

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "value_date", nullable = false)
    @Builder.Default
    private Instant valueDate = Instant.now();

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "merchant_name", length = 120)
    private String merchantName;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "tags")
    private String tags;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @Column(name = "is_recurring", nullable = false)
    @Builder.Default
    private boolean isRecurring = false;

    @Column(name = "checksum_hash", nullable = false, length = 64)
    private String checksumHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.COMPLETED;

    public enum TransactionType {
        INCOME,
        EXPENSE,
        TRANSFER
    }

    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        VOID,
        RECONCILED
    }
}
