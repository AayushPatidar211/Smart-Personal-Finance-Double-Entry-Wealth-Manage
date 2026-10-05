package com.finwise.dto.importer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportSummaryResponse {

    private Long batchId;
    private String bankName;
    private String fileName;
    private String fileHash;
    private int totalRecords;
    private int importedCount;
    private int duplicateCount;
    private int failedCount;
    private BigDecimal totalDebitAmount;
    private BigDecimal totalCreditAmount;
    private String status;
    private Instant createdAt;

    @Builder.Default
    private List<SkippedDuplicateDto> skippedDuplicates = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkippedDuplicateDto {
        private int lineNumber;
        private String date;
        private String description;
        private BigDecimal amount;
        private String sha256Checksum;
        private String reason;
    }
}
