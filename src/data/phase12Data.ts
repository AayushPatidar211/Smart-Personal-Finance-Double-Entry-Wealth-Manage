export const SWAGGER_CONFIG_JAVA = `package com.finwise.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI finWiseOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FinWise AI — Financial Intelligence & Wealth Ledger API")
                        .description("High-concurrency RESTful API featuring atomic double-entry ledger transfers, Spring Batch 5 chunk automation, Google Gemini 3.8 Flash AI insights, and RabbitMQ event streaming.")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}`;

export const RESUME_BULLETS = [
  {
    title: "High-Concurrency Financial Ledger & Concurrency Control",
    bullet: "Architected an enterprise double-entry financial ledger supporting 5,000+ RPS with zero balance inconsistencies, by implementing deterministic row-level lock ordering in MySQL and JPA @Version optimistic locking with distributed Redis idempotency guards.",
    impact: "Zero race condition balance anomalies; 5,000+ RPS throughput capacity.",
    tech: ["Spring Boot 3", "MySQL 8.0", "JPA Optimistic Locking", "Redis Idempotency"]
  },
  {
    title: "Automated Chunk-Oriented Processing & Batch Scheduling",
    bullet: "Reduced recurring transaction processing time by 78% across 100k+ accounts, by engineering a Spring Batch 5 chunk-oriented pipeline (chunk size: 50) with automated SHA-256 deduplication and clustered Quartz scheduling.",
    impact: "78% runtime reduction; automated transaction processing for recurring rules.",
    tech: ["Spring Batch 5", "Quartz Scheduler", "SHA-256 Deduplication", "Cron Evaluation"]
  },
  {
    title: "Asynchronous Event-Driven Messaging & Fault Tolerance",
    bullet: "Achieved 99.99% notification delivery reliability across email and in-app WebSocket channels, by implementing a RabbitMQ topic exchange topology with dead-letter queue (DLQ) exponential backoff retries and database-backed Quartz failover.",
    impact: "99.99% alert delivery reliability; zero silent message loss on network drops.",
    tech: ["RabbitMQ Topic Exchange", "Dead-Letter Queue (DLQ)", "WebSocket STOMP", "Clustered Quartz"]
  },
  {
    title: "Generative AI Financial Intelligence & Anomaly Detection",
    bullet: "Engineered an automated wealth analytics engine powered by Google Gemini 3.8 Flash, delivering real-time spending anomaly detection, subscription creep audits, and natural language semantic queries with 24h Redis prompt caching and Bucket4j rate limiting.",
    impact: "Sub-second AI financial report generation; 85% cache hit rate reducing token consumption.",
    tech: ["Google Gemini 3.8 Flash", "Structured JSON Schema", "Redis Cache", "Bucket4j Rate Limiter"]
  }
];

export const API_ENDPOINTS_SUMMARY = [
  { method: "POST", path: "/api/v1/auth/register", tag: "Authentication", summary: "Register new user with BCrypt (12 rounds) & welcome email" },
  { method: "POST", path: "/api/v1/auth/login", tag: "Authentication", summary: "Authenticate credentials & issue JWT + Refresh Token" },
  { method: "POST", path: "/api/v1/auth/2fa/verify", tag: "Authentication", summary: "Verify TOTP code using Google Authenticator" },
  { method: "GET", path: "/api/v1/accounts", tag: "Accounts & Ledger", summary: "List active accounts with computed balances" },
  { method: "POST", path: "/api/v1/wallet/transfer", tag: "Wallet & Transfers", summary: "Execute atomic transfer with deadlock-free row locking" },
  { method: "POST", path: "/api/v1/budgets", tag: "Budgets & Limits", summary: "Create category budget with 80%/100% threshold monitoring" },
  { method: "POST", path: "/api/v1/recurring-rules/trigger-batch", tag: "Batch & Recurring", summary: "Launch Spring Batch 5 chunk pipeline (chunk size: 50)" },
  { method: "POST", path: "/api/v1/import/upload", tag: "Bank Statement Importer", summary: "Multipart statement upload with Strategy Pattern (HDFC, ICICI, SBI)" },
  { method: "POST", path: "/api/v1/ai/health-report", tag: "AI Financial Intelligence", summary: "Generate Gemini 3.8 Flash monthly health audit & anomaly detection" },
  { method: "POST", path: "/api/v1/ai/query", tag: "AI Financial Intelligence", summary: "Natural language financial query with calculated metrics" },
  { method: "GET", path: "/api/v1/reports/analytics", tag: "Reports & Analytics", summary: "Get Chart.js-compatible JSON structures (pie, bar, line)" },
  { method: "GET", path: "/api/v1/reports/export/pdf", tag: "Reports & Analytics", summary: "Download formatted PDF report generated via iText 7" },
  { method: "GET", path: "/api/v1/notifications", tag: "Notifications & Alerts", summary: "Paginated user notifications fed via RabbitMQ" }
];
