package com.finwise.notification.listener;

import com.finwise.config.RabbitMqConfig;
import com.finwise.dto.notification.NotificationEvent;
import com.finwise.entity.Notification;
import com.finwise.entity.User;
import com.finwise.repository.NotificationRepository;
import com.finwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMqConfig.EMAIL_QUEUE)
    public void handleEmailNotification(NotificationEvent event) {
        log.info("Processing asynchronous EMAIL notification: {} (EventId: {})", event.getTitle(), event.getEventId());

        userRepository.findById(event.getUserId()).ifPresent(user -> {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(user.getEmail());
                mail.setSubject("[FinWise AI] " + event.getTitle());
                mail.setText(event.getMessage() + "\n\n— FinWise Automated Security & Wealth Engine");
                mailSender.send(mail);
                log.info("Email notification successfully dispatched to {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to deliver email notification to {}. Message will route to DLQ if unhandled.", user.getEmail(), e);
                throw new RuntimeException("Email delivery failed", e);
            }
        });
    }

    @RabbitListener(queues = RabbitMqConfig.INAPP_QUEUE)
    public void handleInAppNotification(NotificationEvent event) {
        log.info("Processing asynchronous IN-APP notification: {} for userId: {}", event.getTitle(), event.getUserId());

        userRepository.findById(event.getUserId()).ifPresent(user -> {
            Notification entity = Notification.builder()
                    .user(user)
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .type(event.getType().name())
                    .isRead(false)
                    .build();

            Notification saved = notificationRepository.save(entity);

            // Push in real-time over WebSocket STOMP topic
            try {
                messagingTemplate.convertAndSend("/topic/user." + user.getId() + ".notifications", saved);
            } catch (Exception e) {
                log.warn("WebSocket push notification failed: {}", e.getMessage());
            }
        });
    }
}
