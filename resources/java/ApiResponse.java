package com.finwise.common;

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
 *
 * @param <T> Payload data type
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
}
