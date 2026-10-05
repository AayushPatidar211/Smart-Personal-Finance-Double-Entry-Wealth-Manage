package com.finwise.service.impl;

import com.finwise.config.RabbitMqConfig;
import com.finwise.dto.notification.NotificationEvent;
import com.finwise.entity.Notification;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.repository.NotificationRepository;
import com.finwise.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final RabbitTemplate rabbitTemplate;
    private final NotificationRepository notificationRepository;

    @Override
    public void dispatchEvent(NotificationEvent event) {
        log.info("Dispatching notification event: {} to RabbitMQ topic exchange", event.getEventId());

        if (event.getChannel() == NotificationEvent.NotificationChannel.EMAIL || event.getChannel() == NotificationEvent.NotificationChannel.BOTH) {
            rabbitTemplate.convertAndSend(RabbitMqConfig.TOPIC_EXCHANGE, "notification.email." + event.getType().name().toLowerCase(), event);
        }

        if (event.getChannel() == NotificationEvent.NotificationChannel.IN_APP || event.getChannel() == NotificationEvent.NotificationChannel.BOTH) {
            rabbitTemplate.convertAndSend(RabbitMqConfig.TOPIC_EXCHANGE, "notification.inapp." + event.getType().name().toLowerCase(), event);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
