package com.finwise.dto.ai;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCategorizationRequest {

    @NotEmpty(message = "Descriptions list cannot be empty")
    private List<String> rawDescriptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorizationResultDto {
        private String rawDescription;
        private String predictedCategory;
        private double confidenceScore;
        private String reason;
    }
}
