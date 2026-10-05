package com.finwise.dto.budget;

import com.finwise.entity.Budget.BudgetPeriod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetProgressResponse {

    private Long budgetId;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String name;
    private BudgetPeriod period;
    private BigDecimal amountLimit;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal consumptionPercentage;
    private BigDecimal dailyRecommendedSpend;
    private int alertThresholdPct;
    private BudgetStatus status;
    private boolean isRolloverEnabled;
    private BigDecimal rolloverAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private long daysRemaining;

    public enum BudgetStatus {
        SAFE,         // < 80%
        WARNING_80,   // >= 80% and < 100%
        EXCEEDED_100  // >= 100%
    }
}
