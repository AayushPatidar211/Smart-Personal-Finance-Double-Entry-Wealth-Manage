package com.finwise.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finwise.ai.GeminiApiClient;
import com.finwise.dto.ai.AiCategorizationRequest.CategorizationResultDto;
import com.finwise.dto.ai.FinancialHealthReportDto;
import com.finwise.dto.ai.SemanticQueryDto.SemanticQueryResponse;
import com.finwise.entity.AiInsight;
import com.finwise.entity.Category;
import com.finwise.entity.Transaction;
import com.finwise.entity.User;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.repository.*;
import com.finwise.service.AiFinancialInsightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiFinancialInsightServiceImpl implements AiFinancialInsightService {

    private final GeminiApiClient geminiApiClient;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final AiInsightRepository aiInsightRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_FINANCIAL_ANALYST =
            "You are FinWise AI, an expert Chief Financial Officer and Personal Wealth Architect. " +
            "You analyze consumer banking ledgers, detect spending anomalies, identify recurring subscription creep, " +
            "and compute savings velocities. Always provide mathematically grounded, non-hallucinatory guidance.";

    @Override
    @Transactional
    public FinancialHealthReportDto generateMonthlyHealthReport(Long userId, String periodMonth) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate startDate = LocalDate.of(2026, 10, 1);
        LocalDate endDate = LocalDate.of(2026, 10, 31);

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenAndIsDeletedFalse(userId, startDate, endDate, PageRequest.of(0, 200))
                .getContent();

        BigDecimal netWorth = accountRepository.sumTotalNetWorthByUserId(userId);

        String prompt = String.format("""
            Analyze financial ledger for month %s:
            Net Worth: $%s
            Transaction Count: %d
            Transactions Data: %s

            Generate a comprehensive JSON financial health report with:
            - healthScore (0-100)
            - savingsRatePct (e.g. 24.5)
            - totalIncome, totalExpenses, netSavings
            - anomalies: list of {category, severity, percentageChange, dollarImpact, explanation, actionableAdvice}
            - subscriptionAudit: list of active services {merchantName, monthlyCost, status, recommendation}
            - goalProjection: {goalName, targetAmount, currentAmount, projectedMonthsToTarget, recommendedMonthlySavings}
            - executiveSummaryMarkdown: formatted markdown overview with bullet points
            """, periodMonth, netWorth.toPlainString(), transactions.size(), serializeTransactionsSummary(transactions));

        GeminiApiClient.GeminiResponse response = geminiApiClient.callGemini(SYSTEM_FINANCIAL_ANALYST, prompt, true, 0.4);

        try {
            FinancialHealthReportDto report = objectMapper.readValue(response.text(), FinancialHealthReportDto.class);
            report.setPeriodMonth(periodMonth);
            report.setPromptTokens(response.promptTokens());
            report.setCompletionTokens(response.completionTokens());

            // Persist insight audit log
            AiInsight insight = AiInsight.builder()
                    .user(user)
                    .insightType(AiInsight.InsightType.MONTHLY_HEALTH)
                    .periodMonth(periodMonth)
                    .title("Monthly Financial Health Report - " + periodMonth)
                    .summary(report.getExecutiveSummaryMarkdown())
                    .fullAnalysisJson(response.text())
                    .promptTokens(response.promptTokens())
                    .completionTokens(response.completionTokens())
                    .isRead(false)
                    .build();
            aiInsightRepository.save(insight);

            return report;
        } catch (Exception e) {
            log.error("Failed to parse Gemini financial health report JSON", e);
            throw new RuntimeException("Error processing AI financial analysis: " + e.getMessage(), e);
        }
    }

    @Override
    public List<CategorizationResultDto> batchCategorizeTransactions(Long userId, List<String> descriptions) {
        List<Category> categories = categoryRepository.findAll();
        String catNames = categories.stream().map(Category::getName).collect(Collectors.joining(", "));

        String prompt = String.format("""
            Categorize the following bank transaction merchant descriptions:
            Available Categories: [%s]
            Transactions: %s

            Return a JSON array of objects:
            [
              { "rawDescription": "string", "predictedCategory": "string", "confidenceScore": 0.0-1.0, "reason": "string" }
            ]
            """, catNames, descriptions.toString());

        GeminiApiClient.GeminiResponse response = geminiApiClient.callGemini(
                "You are an automated transaction categorization model. Assign the closest semantic category.",
                prompt, true, 0.1);

        try {
            return objectMapper.readerForListOf(CategorizationResultDto.class).readValue(response.text());
        } catch (Exception e) {
            log.error("Failed to parse categorization JSON", e);
            return new ArrayList<>();
        }
    }

    @Override
    public SemanticQueryResponse executeSemanticFinancialQuery(Long userId, String query) {
        String prompt = String.format("""
            The user asks this natural language query about their finances:
            "%s"

            Provide:
            1. answerMarkdown: direct answer with clear explanations
            2. calculatedAmount: total numeric answer if applicable (e.g. 542.50)
            3. categoryBreakdown: key-value map of categories and spent amounts
            4. sqlFilterEquivalence: equivalent SQL query representation
            """, query);

        GeminiApiClient.GeminiResponse response = geminiApiClient.callGemini(SYSTEM_FINANCIAL_ANALYST, prompt, true, 0.2);

        try {
            SemanticQueryResponse res = objectMapper.readValue(response.text(), SemanticQueryResponse.class);
            res.setQuery(query);
            res.setTokensUsed(response.promptTokens() + response.completionTokens());
            return res;
        } catch (Exception e) {
            return SemanticQueryResponse.builder()
                    .query(query)
                    .answerMarkdown(response.text())
                    .tokensUsed(response.promptTokens() + response.completionTokens())
                    .build();
        }
    }

    private String serializeTransactionsSummary(List<Transaction> txs) {
        return txs.stream()
                .limit(40)
                .map(t -> String.format("{date: '%s', desc: '%s', amount: %s, type: '%s', category: '%s'}",
                        t.getTransactionDate(), t.getDescription(), t.getAmount(), t.getTransactionType(), t.getCategory().getName()))
                .collect(Collectors.joining(", "));
    }
}
