package com.finwise.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {

    private String eventId;
    private Long userId;
    private NotificationType type;
    private NotificationChannel channel;
    private String title;
    private String message;
    private Map<String, Object> metadata;
    @Builder.Default
    private Instant timestamp = Instant.now();

    public enum NotificationType {
        BUDGET_WARNING_80,
        BUDGET_EXCEEDED_100,
        RECURRING_PROCESSED,
        LARGE_TRANSACTION_ALERT,
        SECURITY_ALERT,
        MONTHLY_DIGEST
    }

    public enum NotificationChannel {
        EMAIL,
        IN_APP,
        BOTH
    }
}
