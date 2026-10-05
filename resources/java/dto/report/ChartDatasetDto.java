package com.finwise.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Standardized Chart.js JSON format directly consumable by frontend Chart.js / ChartJS-React components.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartDatasetDto {

    @Builder.Default
    private List<String> labels = new ArrayList<>();

    @Builder.Default
    private List<DatasetItem> datasets = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatasetItem {
        private String label;
        private List<BigDecimal> data;
        private Object backgroundColor; // String or List<String>
        private Object borderColor;     // String or List<String>
        @Builder.Default
        private boolean fill = false;
        @Builder.Default
        private double tension = 0.3;
    }
}
