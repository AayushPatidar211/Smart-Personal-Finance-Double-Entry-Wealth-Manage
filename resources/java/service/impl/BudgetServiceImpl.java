package com.finwise.service.impl;

import com.finwise.dto.budget.BudgetProgressResponse;
import com.finwise.dto.budget.BudgetProgressResponse.BudgetStatus;
import com.finwise.dto.budget.CreateBudgetRequest;
import com.finwise.entity.Budget;
import com.finwise.entity.Category;
import com.finwise.entity.User;
import com.finwise.exception.BusinessException;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.repository.BudgetRepository;
import com.finwise.repository.CategoryRepository;
import com.finwise.repository.UserRepository;
import com.finwise.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public BudgetProgressResponse createBudget(Long userId, CreateBudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("Budget end date cannot precede start date", HttpStatus.BAD_REQUEST);
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .name(request.getName().trim())
                .period(request.getPeriod())
                .amountLimit(request.getAmountLimit().setScale(2, RoundingMode.HALF_EVEN))
                .spentAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .rolloverEnabled(request.isRolloverEnabled())
                .rolloverAmount(BigDecimal.ZERO)
                .alertThresholdPct(request.getAlertThresholdPct())
                .isActive(true)
                .build();

        Budget saved = budgetRepository.save(budget);
        return mapToProgressResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetProgressResponse> getUserBudgetsProgress(Long userId) {
        return budgetRepository.findByUserIdAndIsActiveTrueAndIsDeletedFalse(userId).stream()
                .map(this::mapToProgressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetProgressResponse getBudgetProgressById(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUser().getId().equals(userId) && !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));
        return mapToProgressResponse(budget);
    }

    @Override
    @Transactional
    public void recordExpenseAgainstBudget(Long userId, Long categoryId, BigDecimal amount) {
        LocalDate today = LocalDate.now();
        budgetRepository.findByUserIdAndCategoryIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndIsDeletedFalse(
                userId, categoryId, today, today).ifPresent(budget -> {
            budget.setSpentAmount(budget.getSpentAmount().add(amount).setScale(2, RoundingMode.HALF_EVEN));
            budgetRepository.save(budget);

            BigDecimal consumption = budget.getConsumptionPercentage();
            if (consumption.compareTo(BigDecimal.valueOf(100)) >= 0) {
                emitAlertEvent(budget, "EXCEEDED_100", "Critical: Budget exceeded 100% of allocation limit!");
            } else if (consumption.compareTo(BigDecimal.valueOf(budget.getAlertThresholdPct())) >= 0) {
                emitAlertEvent(budget, "WARNING_80", String.format("Alert: Budget reached %s%% of limit.", consumption));
            }
        });
    }

    @Override
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));
        budget.softDelete();
        budgetRepository.save(budget);
    }

    private void emitAlertEvent(Budget b, String alertLevel, String message) {
        log.warn("Budget {} alert: {} (Spent: {} / Limit: {})", b.getName(), message, b.getSpentAmount(), b.getAmountLimit());
        try {
            rabbitTemplate.convertAndSend("finwise.notifications.exchange", "budget.alert", Map.of(
                    "userId", b.getUser().getId(),
                    "budgetId", b.getId(),
                    "category", b.getCategory().getName(),
                    "level", alertLevel,
                    "message", message
            ));
        } catch (Exception e) {
            log.warn("RabbitMQ notification dispatch skipped: {}", e.getMessage());
        }
    }

    private BudgetProgressResponse mapToProgressResponse(Budget b) {
        BigDecimal effectiveLimit = b.getAmountLimit().add(b.getRolloverAmount());
        BigDecimal remaining = effectiveLimit.subtract(b.getSpentAmount());
        BigDecimal pct = effectiveLimit.compareTo(BigDecimal.ZERO) > 0
                ? b.getSpentAmount().multiply(BigDecimal.valueOf(100)).divide(effectiveLimit, 2, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO;

        BudgetStatus status = BudgetStatus.SAFE;
        if (pct.compareTo(BigDecimal.valueOf(100)) >= 0) {
            status = BudgetStatus.EXCEEDED_100;
        } else if (pct.compareTo(BigDecimal.valueOf(b.getAlertThresholdPct())) >= 0) {
            status = BudgetStatus.WARNING_80;
        }

        LocalDate today = LocalDate.now();
        long daysLeft = Math.max(1, ChronoUnit.DAYS.between(today, b.getEndDate()));
        BigDecimal dailyRecommended = remaining.compareTo(BigDecimal.ZERO) > 0
                ? remaining.divide(BigDecimal.valueOf(daysLeft), 2, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO;

        return BudgetProgressResponse.builder()
                .budgetId(b.getId())
                .categoryId(b.getCategory().getId())
                .categoryName(b.getCategory().getName())
                .categoryColor(b.getCategory().getColorHex())
                .name(b.getName())
                .period(b.getPeriod())
                .amountLimit(b.getAmountLimit())
                .spentAmount(b.getSpentAmount())
                .remainingAmount(remaining)
                .consumptionPercentage(pct)
                .dailyRecommendedSpend(dailyRecommended)
                .alertThresholdPct(b.getAlertThresholdPct())
                .status(status)
                .isRolloverEnabled(b.isRolloverEnabled())
                .rolloverAmount(b.getRolloverAmount())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .daysRemaining(daysLeft)
                .build();
    }
}
