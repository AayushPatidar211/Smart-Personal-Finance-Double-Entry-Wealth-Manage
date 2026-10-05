package com.finwise.scheduler;

import com.finwise.config.RabbitMqConfig;
import com.finwise.dto.notification.NotificationEvent;
import com.finwise.dto.notification.NotificationEvent.NotificationChannel;
import com.finwise.dto.notification.NotificationEvent.NotificationType;
import com.finwise.entity.Budget;
import com.finwise.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@DisallowConcurrentExecution
@RequiredArgsConstructor
public class BudgetMonitoringJob extends QuartzJobBean {

    private final BudgetRepository budgetRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        log.info("Executing clustered Quartz job: BudgetMonitoringJob");

        List<Budget> activeBudgets = budgetRepository.findAll().stream()
                .filter(b -> b.isActive() && !b.isDeleted())
                .toList();

        for (Budget budget : activeBudgets) {
            BigDecimal consumptionPct = budget.getConsumptionPercentage();
            int threshold = budget.getAlertThresholdPct();

            if (consumptionPct.compareTo(BigDecimal.valueOf(100)) >= 0) {
                publishBudgetAlert(budget, NotificationType.BUDGET_EXCEEDED_100,
                        "🚨 Budget Breached: " + budget.getName(),
                        String.format("You have exceeded 100%% of your %s budget! Spent: $%s of $%s allocation.",
                                budget.getCategory().getName(), budget.getSpentAmount(), budget.getAmountLimit()));
            } else if (consumptionPct.compareTo(BigDecimal.valueOf(threshold)) >= 0) {
                publishBudgetAlert(budget, NotificationType.BUDGET_WARNING_80,
                        "⚠️ Budget Alert: " + budget.getName() + " reached " + consumptionPct + "%",
                        String.format("You have reached %s%% of your %s budget threshold. Remaining: $%s.",
                                consumptionPct, budget.getCategory().getName(), budget.getAmountLimit().subtract(budget.getSpentAmount())));
            }
        }
    }

    private void publishBudgetAlert(Budget budget, NotificationType type, String title, String msg) {
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .userId(budget.getUser().getId())
                .type(type)
                .channel(NotificationChannel.BOTH)
                .title(title)
                .message(msg)
                .build();

        // Publish to RabbitMQ topic exchange
        rabbitTemplate.convertAndSend(RabbitMqConfig.TOPIC_EXCHANGE, "notification.email.budget", event);
        rabbitTemplate.convertAndSend(RabbitMqConfig.TOPIC_EXCHANGE, "notification.inapp.budget", event);
    }
}
