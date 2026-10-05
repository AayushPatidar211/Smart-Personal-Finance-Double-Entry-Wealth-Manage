package com.finwise.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialHealthReportDto {

    private String periodMonth;
    private int healthScore; // 0 to 100
    private BigDecimal savingsRatePct;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netSavings;
    private List<AnomalyItemDto> anomalies;
    private List<SubscriptionItemDto> subscriptionAudit;
    private GoalProjectionDto goalProjection;
    private String executiveSummaryMarkdown;
    private int promptTokens;
    private int completionTokens;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyItemDto {
        private String category;
        private String severity; // HIGH, MEDIUM, LOW
        private BigDecimal percentageChange;
        private BigDecimal dollarImpact;
        private String explanation;
        private String actionableAdvice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionItemDto {
        private String merchantName;
        private BigDecimal monthlyCost;
        private String status; // ACTIVE, UNUSED_POTENTIAL, PRICE_INCREASED
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalProjectionDto {
        private String goalName;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private double projectedMonthsToTarget;
        private BigDecimal recommendedMonthlySavings;
    }
}
