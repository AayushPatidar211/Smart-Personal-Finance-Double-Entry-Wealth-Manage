export const RABBITMQ_CONFIG_JAVA = `package com.finwise.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class RabbitMqConfig {

    public static final String TOPIC_EXCHANGE = "finwise.events";
    public static final String DEAD_LETTER_EXCHANGE = "finwise.dlx";
    public static final String EMAIL_QUEUE = "notification.email.queue";
    public static final String INAPP_QUEUE = "notification.inapp.queue";
    public static final String DEAD_LETTER_QUEUE = "notification.dlq";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(TOPIC_EXCHANGE, true, false);
    }

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE)
                .withArguments(Map.of(
                        "x-dead-letter-exchange", DEAD_LETTER_EXCHANGE,
                        "x-dead-letter-routing-key", DEAD_LETTER_QUEUE
                ))
                .build();
    }

    @Bean
    public Queue inAppQueue() {
        return QueueBuilder.durable(INAPP_QUEUE).build();
    }

    @Bean
    public Binding emailBinding() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with("notification.email.#");
    }

    @Bean
    public Binding inAppBinding() {
        return BindingBuilder.bind(inAppQueue()).to(eventsExchange()).with("notification.inapp.#");
    }
}`;

export const NOTIFICATION_LISTENER_JAVA = `package com.finwise.notification.listener;

import com.finwise.config.RabbitMqConfig;
import com.finwise.dto.notification.NotificationEvent;
import com.finwise.entity.Notification;
import com.finwise.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMqConfig.EMAIL_QUEUE)
    public void handleEmail(NotificationEvent event) {
        log.info("Sending email for event: {}", event.getTitle());
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setSubject("[FinWise] " + event.getTitle());
        mail.setText(event.getMessage());
        mailSender.send(mail);
    }

    @RabbitListener(queues = RabbitMqConfig.INAPP_QUEUE)
    public void handleInApp(NotificationEvent event) {
        log.info("Storing in-app alert for user #{}: {}", event.getUserId(), event.getTitle());
        notificationRepository.save(Notification.builder()
                .title(event.getTitle())
                .message(event.getMessage())
                .type(event.getType().name())
                .isRead(false)
                .build());
    }
}`;

export const QUARTZ_JOB_JAVA = `package com.finwise.scheduler;

import com.finwise.config.RabbitMqConfig;
import com.finwise.dto.notification.NotificationEvent;
import com.finwise.entity.Budget;
import com.finwise.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.quartz.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@DisallowConcurrentExecution
@RequiredArgsConstructor
public class BudgetMonitoringJob extends QuartzJobBean {

    private final BudgetRepository budgetRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        List<Budget> budgets = budgetRepository.findAll();
        for (Budget b : budgets) {
            BigDecimal pct = b.getConsumptionPercentage();
            if (pct.compareTo(BigDecimal.valueOf(100)) >= 0) {
                publishAlert(b, "BUDGET_EXCEEDED_100", "🚨 Budget Exceeded for " + b.getCategory().getName());
            } else if (pct.compareTo(BigDecimal.valueOf(b.getAlertThresholdPct())) >= 0) {
                publishAlert(b, "BUDGET_WARNING_80", "⚠️ Budget Alert: " + pct + "% reached for " + b.getName());
            }
        }
    }

    private void publishAlert(Budget b, String type, String title) {
        NotificationEvent event = NotificationEvent.builder()
                .userId(b.getUser().getId())
                .title(title)
                .message("Review current spending in " + b.getCategory().getName())
                .build();
        rabbitTemplate.convertAndSend(RabbitMqConfig.TOPIC_EXCHANGE, "notification.email.budget", event);
        rabbitTemplate.convertAndSend(RabbitMqConfig.TOPIC_EXCHANGE, "notification.inapp.budget", event);
    }
}`;
