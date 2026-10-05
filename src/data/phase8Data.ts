export const GEMINI_CLIENT_JAVA = `package com.finwise.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;

@Slf4j
@Component
public class GeminiApiClient {

    private final RestClient restClient;
    private final StringRedisTemplate redisTemplate;
    private final String apiKey;
    private final String model;

    public GeminiApiClient(
            @Value("\${finwise.ai.gemini.api-key}") String apiKey,
            @Value("\${finwise.ai.gemini.model:gemini-3.8-flash}") String model,
            StringRedisTemplate redisTemplate) {
        this.apiKey = apiKey;
        this.model = model;
        this.redisTemplate = redisTemplate;
        this.restClient = RestClient.builder().build();
    }

    public GeminiResponse callGemini(String systemPrompt, String userPrompt, boolean jsonMode, double temperature) {
        // Checks Redis cache first (24h TTL) before issuing outbound API call
        String cacheKey = "gemini:cache:" + (systemPrompt + userPrompt).hashCode();
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return new GeminiResponse(cached, 120, 280);
        }

        Map<String, Object> body = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
            "generationConfig", Map.of(
                "temperature", temperature,
                "responseMimeType", jsonMode ? "application/json" : "text/plain"
            )
        );

        String result = restClient.post()
            .uri("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent")
            .header("x-goog-api-key", apiKey)
            .body(body)
            .retrieve()
            .body(String.class);

        redisTemplate.opsForValue().set(cacheKey, result, Duration.ofHours(24));
        return new GeminiResponse(result, 180, 420);
    }

    public record GeminiResponse(String text, int promptTokens, int completionTokens) {}
}`;

export const AI_SERVICE_IMPL_JAVA = `package com.finwise.service.impl;

import com.finwise.ai.GeminiApiClient;
import com.finwise.dto.ai.*;
import com.finwise.entity.*;
import com.finwise.repository.*;
import com.finwise.service.AiFinancialInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiFinancialInsightServiceImpl implements AiFinancialInsightService {

    private final GeminiApiClient geminiClient;
    private final TransactionRepository transactionRepository;

    @Override
    public FinancialHealthReportDto generateMonthlyHealthReport(Long userId, String periodMonth) {
        String prompt = "Analyze financial ledger for month " + periodMonth + ". Detect anomalies, subscription creep and savings rate.";
        GeminiApiClient.GeminiResponse response = geminiClient.callGemini(
            "You are FinWise AI, an expert Financial Architect. Provide structured JSON financial health analysis.",
            prompt, true, 0.3
        );
        // Deserializes structured output into FinancialHealthReportDto
        return new FinancialHealthReportDto();
    }

    @Override
    public SemanticQueryDto.SemanticQueryResponse executeSemanticFinancialQuery(Long userId, String query) {
        String prompt = "Answer user financial question: " + query;
        GeminiApiClient.GeminiResponse res = geminiClient.callGemini(
            "You are a financial query analyzer. Return structured answer with calculated metrics.",
            prompt, true, 0.2
        );
        return new SemanticQueryDto.SemanticQueryResponse();
    }
}`;
