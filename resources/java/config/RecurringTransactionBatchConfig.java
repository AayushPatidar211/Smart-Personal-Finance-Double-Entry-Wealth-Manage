package com.finwise.config;

import com.finwise.batch.recurring.RecurringBatchPayload;
import com.finwise.batch.recurring.RecurringRuleItemProcessor;
import com.finwise.batch.recurring.RecurringRuleItemWriter;
import com.finwise.entity.RecurringRule;
import com.finwise.repository.RecurringRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RecurringTransactionBatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final RecurringRuleRepository recurringRuleRepository;
    private final RecurringRuleItemProcessor processor;
    private final RecurringRuleItemWriter writer;

    private static final int CHUNK_SIZE = 50;

    @Bean
    public RepositoryItemReader<RecurringRule> recurringRuleReader() {
        return new RepositoryItemReaderBuilder<RecurringRule>()
                .name("recurringRuleReader")
                .repository(recurringRuleRepository)
                .methodName("findDueRulesForExecution")
                .arguments(List.of(LocalDate.now()))
                .pageSize(CHUNK_SIZE)
                .sorts(Collections.singletonMap("id", Sort.Direction.ASC))
                .build();
    }

    @Bean
    public Step recurringTransactionStep() {
        return new StepBuilder("recurringTransactionStep", jobRepository)
                .<RecurringRule, RecurringBatchPayload>chunk(CHUNK_SIZE, transactionManager)
                .reader(recurringRuleReader())
                .processor(processor)
                .writer(writer)
                .faultTolerant()
                .retry(ObjectOptimisticLockingFailureException.class)
                .retryLimit(3)
                .skip(IllegalArgumentException.class)
                .skipLimit(10)
                .build();
    }

    @Bean
    public Job recurringTransactionJob() {
        return new JobBuilder("recurringTransactionJob", jobRepository)
                .start(recurringTransactionStep())
                .build();
    }
}
