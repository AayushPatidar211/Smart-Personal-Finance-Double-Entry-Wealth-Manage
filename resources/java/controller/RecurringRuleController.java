package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.recurring.CreateRecurringRuleRequest;
import com.finwise.entity.Account;
import com.finwise.entity.Category;
import com.finwise.entity.RecurringRule;
import com.finwise.entity.User;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.repository.AccountRepository;
import com.finwise.repository.CategoryRepository;
import com.finwise.repository.RecurringRuleRepository;
import com.finwise.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recurring-rules")
@RequiredArgsConstructor
@Tag(name = "Recurring Transactions & Batch Jobs", description = "Schedules, cron rules and Spring Batch automation triggers")
public class RecurringRuleController {

    private final RecurringRuleRepository recurringRuleRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final JobLauncher jobLauncher;
    private final Job recurringTransactionJob;

    @PostMapping
    @Operation(summary = "Create recurring transaction rule")
    public ResponseEntity<ApiResponse<RecurringRule>> createRule(
            @Valid @RequestBody CreateRecurringRuleRequest request,
            Principal principal) {
        Long userId = 1L;
        User user = userRepository.findById(userId).orElseThrow();
        Account account = accountRepository.findById(request.getAccountId()).orElseThrow();
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow();

        RecurringRule rule = RecurringRule.builder()
                .user(user)
                .account(account)
                .category(category)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .cronExpression(request.getCronExpression())
                .startDate(request.getStartDate())
                .nextRunDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isPaused(false)
                .build();

        RecurringRule saved = recurringRuleRepository.save(rule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Recurring rule created successfully", saved));
    }

    @PostMapping("/trigger-batch")
    @Operation(summary = "Trigger Spring Batch job on demand", description = "Launches Spring Batch 5 chunk job (size 50) for all due rules.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerBatchJob() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("executionTimestamp", System.currentTimeMillis())
                .toJobParameters();

        jobLauncher.run(recurringTransactionJob, params);

        return ResponseEntity.ok(ApiResponse.success("Spring Batch recurring transaction job launched successfully", Map.of(
                "jobName", "recurringTransactionJob",
                "chunkSize", 50,
                "status", "RUNNING"
        )));
    }
}
