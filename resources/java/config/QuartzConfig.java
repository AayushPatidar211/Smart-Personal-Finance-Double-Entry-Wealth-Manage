package com.finwise.config;

import com.finwise.scheduler.BudgetMonitoringJob;
import com.finwise.scheduler.DailyDigestJob;
import org.quartz.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzConfig {

    @Bean
    public JobDetail budgetMonitoringJobDetail() {
        return JobBuilder.newJob(BudgetMonitoringJob.class)
                .withIdentity("budgetMonitoringJob", "FINANCIAL_JOBS")
                .withDescription("Evaluates spending against active category budget thresholds every 6 hours")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger budgetMonitoringTrigger(JobDetail budgetMonitoringJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(budgetMonitoringJobDetail)
                .withIdentity("budgetMonitoringTrigger", "FINANCIAL_TRIGGERS")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 */6 * * ?")) // Every 6 hours
                .build();
    }

    @Bean
    public JobDetail dailyDigestJobDetail() {
        return JobBuilder.newJob(DailyDigestJob.class)
                .withIdentity("dailyDigestJob", "FINANCIAL_JOBS")
                .withDescription("Dispatches daily financial summary digest at 20:00")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger dailyDigestTrigger(JobDetail dailyDigestJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(dailyDigestJobDetail)
                .withIdentity("dailyDigestTrigger", "FINANCIAL_TRIGGERS")
                .withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(20, 0)) // Daily at 8:00 PM
                .build();
    }
}
