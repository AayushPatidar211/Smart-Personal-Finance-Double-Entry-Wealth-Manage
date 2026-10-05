package com.finwise.dto.importer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Standardized intermediate transaction representation parsed from raw bank statements.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedTransactionDto {

    private LocalDate transactionDate;
    private LocalDate valueDate;
    private String description;
    private String referenceNumber;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private BigDecimal balanceAfter;
    private int lineNumber;
    private String rawData;

    public boolean isExpense() {
        return debitAmount != null && debitAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public BigDecimal getAmount() {
        if (isExpense()) return debitAmount;
        return creditAmount != null ? creditAmount : BigDecimal.ZERO;
    }
}
