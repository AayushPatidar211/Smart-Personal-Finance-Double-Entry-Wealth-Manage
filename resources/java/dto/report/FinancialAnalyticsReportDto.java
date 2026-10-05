package com.finwise.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialAnalyticsReportDto {

    private String periodType; // MONTHLY, QUARTERLY, YEARLY, CUSTOM
    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private BigDecimal savingsRatePct;

    // Chart.js JSON structures
    private ChartDatasetDto categoryExpensePieChart;
    private ChartDatasetDto cashFlowTrendBarChart;
    private ChartDatasetDto netWorthTrendLineChart;

    @Builder.Default
    private List<TopMerchantDto> topMerchants = new ArrayList<>();

    @Builder.Default
    private List<BudgetVsActualDto> budgetVsActual = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMerchantDto {
        private String merchantName;
        private BigDecimal totalAmount;
        private int transactionCount;
        private String categoryName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetVsActualDto {
        private String categoryName;
        private String categoryColor;
        private BigDecimal budgetLimit;
        private BigDecimal actualSpent;
        private BigDecimal variance; // limit - spent
        private BigDecimal percentUsed;
        private boolean isOverBudget;
    }
}
