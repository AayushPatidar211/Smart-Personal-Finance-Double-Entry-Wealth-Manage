package com.finwise.entity;

import com.finwise.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Entity
@Table(name = "budgets", indexes = {
    @Index(name = "idx_budgets_user", columnList = "user_id, is_active")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_category_period", columnList = {"user_id", "category_id", "start_date", "end_date", "is_deleted"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "period", nullable = false, length = 20)
    @Builder.Default
    private BudgetPeriod period = BudgetPeriod.MONTHLY;

    @Column(name = "amount_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountLimit;

    @Column(name = "spent_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "rollover_enabled", nullable = false)
    @Builder.Default
    private boolean rolloverEnabled = false;

    @Column(name = "rollover_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal rolloverAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

    @Column(name = "alert_threshold_pct", nullable = false)
    @Builder.Default
    private int alertThresholdPct = 80;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    public BigDecimal getConsumptionPercentage() {
        if (amountLimit == null || amountLimit.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return spentAmount.multiply(BigDecimal.valueOf(100)).divide(amountLimit, 2, RoundingMode.HALF_EVEN);
    }

    public boolean isBreaching() {
        return getConsumptionPercentage().compareTo(BigDecimal.valueOf(alertThresholdPct)) >= 0;
    }

    public enum BudgetPeriod {
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }
}
