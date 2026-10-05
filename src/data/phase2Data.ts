export const POM_XML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>

    <groupId>com.finwise</groupId>
    <artifactId>finwise-ai</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>finwise-ai</name>
    <description>FinWise AI — Smart Personal Finance &amp; Expense Tracker Platform</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
        <springdoc.version>2.5.0</springdoc.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
        <bucket4j.version>8.10.1</bucket4j.version>
        <googleauth.version>1.5.0</googleauth.version>
        <zxing.version>3.5.3</zxing.version>
        <opencsv.version>5.9</opencsv.version>
        <commons-csv.version>1.10.0</commons-csv.version>
        <itext7.version>7.2.5</itext7.version>
        <testcontainers.version>1.19.7</testcontainers.version>
    </properties>

    <dependencies>
        <!-- Core Web, Validation, Security & Persistence -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>

        <!-- In-Memory Caching (Redis) & Rate Limiting (Bucket4j) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-pool2</artifactId>
        </dependency>
        <dependency>
            <groupId>com.bucket4j</groupId>
            <artifactId>bucket4j-core</artifactId>
            <version>\${bucket4j.version}</version>
        </dependency>
        <dependency>
            <groupId>com.bucket4j</groupId>
            <artifactId>bucket4j-redis</artifactId>
            <version>\${bucket4j.version}</version>
        </dependency>

        <!-- Batch & Scheduling (Spring Batch 5 + Quartz) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-batch</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-quartz</artifactId>
        </dependency>

        <!-- JWT & 2FA TOTP (RFC 6238) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.warrenstrange</groupId>
            <artifactId>googleauth</artifactId>
            <version>\${googleauth.version}</version>
        </dependency>
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>core</artifactId>
            <version>\${zxing.version}</version>
        </dependency>
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>javase</artifactId>
            <version>\${zxing.version}</version>
        </dependency>

        <!-- Messaging & Notifications (RabbitMQ + JavaMail) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>

        <!-- CSV / PDF Parsing & Exporting -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-csv</artifactId>
            <version>\${commons-csv.version}</version>
        </dependency>
        <dependency>
            <groupId>com.opencsv</groupId>
            <artifactId>opencsv</artifactId>
            <version>\${opencsv.version}</version>
        </dependency>
        <dependency>
            <groupId>com.itextpdf</groupId>
            <artifactId>itext7-core</artifactId>
            <version>\${itext7.version}</version>
            <type>pom</type>
        </dependency>

        <!-- OpenAPI 3 Documentation & Actuator Metrics -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-registry-prometheus</artifactId>
        </dependency>

        <!-- Code Generation: Lombok & MapStruct -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>\${mapstruct.version}</version>
        </dependency>

        <!-- Testing & Testcontainers -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>mysql</artifactId>
            <version>\${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`;

export const APPLICATION_YML_CONTENT = `# ==============================================================================
# FinWise AI — Multi-Profile Application Configuration (Common / Base)
# ==============================================================================
spring:
  application:
    name: finwise-ai
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}

  # JPA & Hibernate Defaults
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 25
          order_inserts: true
          order_updates: true

  # Flyway Migration Automation
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

  # Spring Batch Configuration
  batch:
    job:
      enabled: false # Do not auto-run all jobs on application boot
    jdbc:
      initialize-schema: always

  # Quartz Scheduler Configuration
  quartz:
    job-store-type: jdbc
    jdbc:
      initialize-schema: never
    properties:
      org.quartz.threadPool.threadCount: 10
      org.quartz.jobStore.isClustered: true

# Security & JWT Configuration
finwise:
  security:
    jwt:
      secret: \${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
      access-token-expiration-ms: 900000       # 15 minutes
      refresh-token-expiration-ms: 604800000   # 7 days
      cookie-domain: \${COOKIE_DOMAIN:localhost}
      secure-cookie: \${SECURE_COOKIE:false}
    totp:
      issuer: "FinWise AI"
    rate-limit:
      login-capacity: 5
      login-refill-tokens: 5
      login-refill-duration-seconds: 60
      api-capacity: 100
      api-refill-tokens: 100
      api-refill-duration-seconds: 60

  # AI Engine Settings (Google Gemini 3.8 Flash)
  ai:
    gemini:
      api-key: \${GEMINI_API_KEY:}
      model: \${GEMINI_MODEL:gemini-3.8-flash}
      temperature: 0.2
      max-output-tokens: 2048
      timeout-seconds: 25
      cache-ttl-hours: 24

# Actuator & Observability
management:
  endpoints:
    web:
      exposure:
        include: "health,info,metrics,prometheus"
  endpoint:
    health:
      show-details: when_authorized
  metrics:
    tags:
      application: \${spring.application.name}

# Springdoc OpenAPI 3 / Swagger UI
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha`;

export const APPLICATION_DEV_YML_CONTENT = `# ==============================================================================
# FinWise AI — Development Environment Profile (dev)
# ==============================================================================
spring:
  config:
    activate:
      on-profile: dev

  datasource:
    url: jdbc:mysql://\${DB_HOST:localhost}:\${DB_PORT:3306}/\${DB_NAME:finwise_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
    username: \${DB_USER:root}
    password: \${DB_PASS:rootpassword}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      pool-name: FinWise-Dev-HikariCP
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 30000
      connection-timeout: 20000

  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true

  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: \${REDIS_PORT:6379}
      timeout: 2000ms

logging:
  level:
    root: INFO
    com.finwise: DEBUG
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG`;

export const APPLICATION_PROD_YML_CONTENT = `# ==============================================================================
# FinWise AI — Production Environment Profile (prod)
# ==============================================================================
spring:
  config:
    activate:
      on-profile: prod

  datasource:
    url: jdbc:mysql://\${DB_HOST}:\${DB_PORT:3306}/\${DB_NAME:finwise_prod}?useSSL=true&requireSSL=true&verifyServerCertificate=true&serverTimezone=UTC&characterEncoding=UTF-8
    username: \${DB_USER}
    password: \${DB_PASS}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      pool-name: FinWise-Prod-HikariCP
      maximum-pool-size: 30
      minimum-idle: 10
      idle-timeout: 600000
      max-lifetime: 1800000
      connection-timeout: 30000
      leak-detection-threshold: 20000

  jpa:
    show-sql: false
    properties:
      hibernate:
        generate_statistics: false

  data:
    redis:
      host: \${REDIS_HOST}
      port: \${REDIS_PORT:6379}
      password: \${REDIS_PASSWORD}
      ssl:
        enabled: \${REDIS_SSL:true}
      timeout: 3000ms

finwise:
  security:
    jwt:
      secure-cookie: true
      cookie-domain: \${PROD_DOMAIN:finwise.ai}

logging:
  level:
    root: WARN
    com.finwise: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{correlationId}] %-5level %logger{36} - %msg%n"`;

export const BASE_ENTITY_JAVA = `package com.finwise.common;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.Instant;

/**
 * Base abstract entity providing:
 * - Surrogate primary key (BIGINT)
 * - Regulatory temporal audit columns (createdAt, updatedAt)
 * - Actor tracking (createdBy, updatedBy)
 * - Optimistic concurrency control (@Version)
 * - Soft deletion flags (isDeleted, deletedAt)
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy = "SYSTEM";

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy = "SYSTEM";

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = Instant.now();
    }
}`;

export const API_RESPONSE_JAVA = `package com.finwise.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;

import java.time.Instant;

/**
 * Standardized API response envelope for all REST endpoints across FinWise AI.
 * Adheres to fintech API contracts: { timestamp, status, message, data, path, correlationId }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private Instant timestamp = Instant.now();

    private int status;

    private String message;

    private T data;

    private String path;

    private String correlationId;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .message("Operation completed successfully")
                .data(data)
                .correlationId(MDC.get("correlationId"))
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .message(message)
                .data(data)
                .correlationId(MDC.get("correlationId"))
                .build();
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.CREATED.value())
                .message(message)
                .data(data)
                .correlationId(MDC.get("correlationId"))
                .build();
    }

    public static <T> ApiResponse<T> error(HttpStatus status, String message, String path) {
        return ApiResponse.<T>builder()
                .status(status.value())
                .message(message)
                .path(path)
                .correlationId(MDC.get("correlationId"))
                .build();
    }

    public static <T> ApiResponse<T> error(HttpStatus status, String message, T errorDetails, String path) {
        return ApiResponse.<T>builder()
                .status(status.value())
                .message(message)
                .data(errorDetails)
                .path(path)
                .correlationId(MDC.get("correlationId"))
                .build();
    }
}`;

export const GLOBAL_EXCEPTION_HANDLER_JAVA = `package com.finwise.exception;

import com.finwise.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler translating all domain, validation, concurrency,
 * and security exceptions into standardized ApiResponse envelopes.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        log.warn("Business rule violation at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(ApiResponse.error(ex.getStatus(), ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation failed for request to {}: {}", request.getRequestURI(), fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST, "Validation failed for request payload", fieldErrors, request.getRequestURI()));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLockingFailure(
            ObjectOptimisticLockingFailureException ex, HttpServletRequest request) {
        log.error("Concurrent modification detected at {}: {}", request.getRequestURI(), ex.getMessage());
        String msg = "The resource was modified concurrently by another transaction. Please refresh and retry.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(HttpStatus.CONFLICT, msg, request.getRequestURI()));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleRateLimitExceeded(
            RateLimitExceededException ex, HttpServletRequest request) {
        log.warn("Rate limit breached at {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), request.getRequestURI()));
    }
}`;
