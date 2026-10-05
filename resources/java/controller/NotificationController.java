package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.notification.NotificationEvent;
import com.finwise.entity.Notification;
import com.finwise.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications & Alerts", description = "RabbitMQ event notifications, in-app alert badges, and unread counts")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user in-app notifications", description = "Paginated list of user alerts (budget warnings, recurring events, security notices).")
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        Long userId = 1L;
        Page<Notification> result = notificationService.getUserNotifications(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count badge")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(Principal principal) {
        Long userId = 1L;
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long notificationId,
            Principal principal) {
        Long userId = 1L;
        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PostMapping("/simulate-event")
    @Operation(summary = "Publish test notification to RabbitMQ exchange")
    public ResponseEntity<ApiResponse<Void>> simulateEvent(@RequestBody NotificationEvent event) {
        notificationService.dispatchEvent(event);
        return ResponseEntity.ok(ApiResponse.success("Event dispatched to RabbitMQ topic exchange", null));
    }
}
