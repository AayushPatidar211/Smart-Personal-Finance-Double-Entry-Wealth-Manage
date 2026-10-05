package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.ai.AiCategorizationRequest;
import com.finwise.dto.ai.AiCategorizationRequest.CategorizationResultDto;
import com.finwise.dto.ai.FinancialHealthReportDto;
import com.finwise.dto.ai.SemanticQueryDto;
import com.finwise.dto.ai.SemanticQueryDto.SemanticQueryResponse;
import com.finwise.service.AiFinancialInsightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Financial Intelligence", description = "Gemini 3.8 Flash automated health audits, subscription creep detection, and semantic queries")
public class AiInsightController {

    private final AiFinancialInsightService aiService;

    @PostMapping("/health-report")
    @Operation(summary = "Generate monthly financial health report", description = "Analyzes ledgers with Gemini 3.8 Flash for savings rates, anomalies, and goal trajectories.")
    public ResponseEntity<ApiResponse<FinancialHealthReportDto>> generateReport(
            @RequestParam(defaultValue = "2026-10") String periodMonth,
            Principal principal) {
        Long userId = 1L;
        FinancialHealthReportDto report = aiService.generateMonthlyHealthReport(userId, periodMonth);
        return ResponseEntity.ok(ApiResponse.success("Financial health report generated successfully", report));
    }

    @PostMapping("/categorize")
    @Operation(summary = "Batch categorize unknown transaction descriptions", description = "AI fallback when rule-based matchers cannot classify raw merchant strings.")
    public ResponseEntity<ApiResponse<List<CategorizationResultDto>>> categorize(
            @Valid @RequestBody AiCategorizationRequest request,
            Principal principal) {
        Long userId = 1L;
        List<CategorizationResultDto> results = aiService.batchCategorizeTransactions(userId, request.getRawDescriptions());
        return ResponseEntity.ok(ApiResponse.success("Transactions categorized", results));
    }

    @PostMapping("/query")
    @Operation(summary = "Natural language financial query", description = "Executes natural language queries like 'How much did I spend on food delivery in Q3?'")
    public ResponseEntity<ApiResponse<SemanticQueryResponse>> query(
            @Valid @RequestBody SemanticQueryDto request,
            Principal principal) {
        Long userId = 1L;
        SemanticQueryResponse response = aiService.executeSemanticFinancialQuery(userId, request.getQuery());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
