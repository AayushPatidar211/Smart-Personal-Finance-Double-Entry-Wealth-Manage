package com.finwise.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

/**
 * Enterprise client for Google Gemini 3.8 Flash API with Redis caching and token tracking.
 */
@Slf4j
@Component
public class GeminiApiClient {

    private final RestClient restClient;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
    private static final String CACHE_PREFIX = "gemini:cache:";

    public GeminiApiClient(
            @Value("${finwise.ai.gemini.api-key:dummy-key}") String apiKey,
            @Value("${finwise.ai.gemini.model:gemini-3.8-flash}") String model,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public GeminiResponse callGemini(String systemPrompt, String userPrompt, boolean jsonMode, double temperature) {
        String cacheKey = CACHE_PREFIX + hashPrompt(systemPrompt + "|" + userPrompt + "|" + jsonMode);

        // 1. Check Redis Cache
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Gemini prompt cache hit (Redis Key: {})", cacheKey);
                return objectMapper.readValue(cached, GeminiResponse.class);
            }
        } catch (Exception e) {
            log.warn("Redis prompt cache lookup failed: {}", e.getMessage());
        }

        // 2. Prepare Payload
        Map<String, Object> generationConfig = Map.of(
                "temperature", temperature,
                "topP", 0.95,
                "topK", 40,
                "responseMimeType", jsonMode ? "application/json" : "text/plain"
        );

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
                "generationConfig", generationConfig
        );

        try {
            String rawResponse = restClient.post()
                    .uri(GEMINI_API_URL, model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(rawResponse);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            int promptTokens = root.path("usageMetadata").path("promptTokenCount").asInt(150);
            int candidatesTokens = root.path("usageMetadata").path("candidatesTokenCount").asInt(320);

            GeminiResponse response = new GeminiResponse(text, promptTokens, candidatesTokens);

            // 3. Cache Result (24h TTL)
            try {
                redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(response), Duration.ofHours(24));
            } catch (Exception e) {
                log.warn("Redis prompt cache write failed: {}", e.getMessage());
            }

            return response;
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new RuntimeException("Gemini AI API failure: " + e.getMessage(), e);
        }
    }

    private String hashPrompt(String str) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(str.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return String.valueOf(str.hashCode());
        }
    }

    public record GeminiResponse(String text, int promptTokens, int completionTokens) {}
}
