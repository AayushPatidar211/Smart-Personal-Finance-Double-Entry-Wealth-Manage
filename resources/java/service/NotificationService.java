package com.finwise.service;

import com.finwise.dto.notification.NotificationEvent;
import com.finwise.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    void dispatchEvent(NotificationEvent event);

    Page<Notification> getUserNotifications(Long userId, Pageable pageable);

    void markAsRead(Long userId, Long notificationId);

    long getUnreadCount(Long userId);
}
