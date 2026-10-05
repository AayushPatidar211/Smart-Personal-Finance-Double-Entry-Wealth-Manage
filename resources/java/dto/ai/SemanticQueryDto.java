package com.finwise.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemanticQueryDto {

    @NotBlank(message = "Natural language query cannot be blank")
    private String query;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemanticQueryResponse {
        private String query;
        private String answerMarkdown;
        private BigDecimal calculatedAmount;
        private Map<String, BigDecimal> categoryBreakdown;
        private String sqlFilterEquivalence;
        private int tokensUsed;
    }
}
