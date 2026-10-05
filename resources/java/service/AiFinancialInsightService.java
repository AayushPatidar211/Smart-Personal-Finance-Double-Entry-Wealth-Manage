package com.finwise.service;

import com.finwise.dto.ai.AiCategorizationRequest;
import com.finwise.dto.ai.AiCategorizationRequest.CategorizationResultDto;
import com.finwise.dto.ai.FinancialHealthReportDto;
import com.finwise.dto.ai.SemanticQueryDto.SemanticQueryResponse;

import java.util.List;

public interface AiFinancialInsightService {

    FinancialHealthReportDto generateMonthlyHealthReport(Long userId, String periodMonth);

    List<CategorizationResultDto> batchCategorizeTransactions(Long userId, List<String> descriptions);

    SemanticQueryResponse executeSemanticFinancialQuery(Long userId, String query);
}
