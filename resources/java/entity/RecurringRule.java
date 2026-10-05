package com.finwise.entity;

import com.finwise.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.scheduling.support.CronExpression;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_rules", indexes = {
    @Index(name = "idx_recurring_batch_eval", columnList = "is_paused, is_deleted, next_run_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private Transaction.TransactionType transactionType;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 20)
    private RecurringFrequency frequency;

    @Column(name = "cron_expression", length = 60)
    private String cronExpression;

    @Column(name = "next_run_date", nullable = false)
    private LocalDate nextRunDate;

    @Column(name = "last_run_date")
    private LocalDate lastRunDate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_paused", nullable = false)
    @Builder.Default
    private boolean isPaused = false;

    @Column(name = "total_executions", nullable = false)
    @Builder.Default
    private int totalExecutions = 0;

    @Column(name = "failure_count", nullable = false)
    @Builder.Default
    private int failureCount = 0;

    public void advanceNextRunDate() {
        this.lastRunDate = this.nextRunDate;
        this.totalExecutions++;

        if (this.frequency == RecurringFrequency.CUSTOM_CRON && this.cronExpression != null) {
            CronExpression cron = CronExpression.parse(this.cronExpression);
            LocalDateTime next = cron.next(this.nextRunDate.atStartOfDay().plusDays(1));
            this.nextRunDate = next != null ? next.toLocalDate() : null;
        } else {
            this.nextRunDate = switch (this.frequency) {
                case DAILY -> this.nextRunDate.plusDays(1);
                case WEEKLY -> this.nextRunDate.plusWeeks(1);
                case BI_WEEKLY -> this.nextRunDate.plusWeeks(2);
                case MONTHLY -> this.nextRunDate.plusMonths(1);
                case YEARLY -> this.nextRunDate.plusYears(1);
                default -> this.nextRunDate.plusMonths(1);
            };
        }

        if (this.endDate != null && this.nextRunDate != null && this.nextRunDate.isAfter(this.endDate)) {
            this.isPaused = true;
        }
    }

    public enum RecurringFrequency {
        DAILY,
        WEEKLY,
        BI_WEEKLY,
        MONTHLY,
        YEARLY,
        CUSTOM_CRON
    }
}
