package com.finwise.dto.budget;

import com.finwise.entity.Budget.BudgetPeriod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateBudgetRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Budget name is required")
    private String name;

    @NotNull(message = "Budget period is required")
    @Builder.Default
    private BudgetPeriod period = BudgetPeriod.MONTHLY;

    @NotNull(message = "Amount limit is required")
    @DecimalMin(value = "1.00", message = "Budget limit must be at least 1.00")
    private BigDecimal amountLimit;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Builder.Default
    private boolean rolloverEnabled = false;

    @Min(value = 50, message = "Alert threshold cannot be less than 50%")
    @Max(value = 100, message = "Alert threshold cannot exceed 100%")
    @Builder.Default
    private int alertThresholdPct = 80;
}
