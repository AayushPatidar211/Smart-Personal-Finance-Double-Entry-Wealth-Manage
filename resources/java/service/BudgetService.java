package com.finwise.service;

import com.finwise.dto.budget.BudgetProgressResponse;
import com.finwise.dto.budget.CreateBudgetRequest;

import java.math.BigDecimal;
import java.util.List;

public interface BudgetService {

    BudgetProgressResponse createBudget(Long userId, CreateBudgetRequest request);

    List<BudgetProgressResponse> getUserBudgetsProgress(Long userId);

    BudgetProgressResponse getBudgetProgressById(Long userId, Long budgetId);

    void recordExpenseAgainstBudget(Long userId, Long categoryId, BigDecimal amount);

    void deleteBudget(Long userId, Long budgetId);
}
