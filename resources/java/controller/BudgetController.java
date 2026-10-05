package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.budget.BudgetProgressResponse;
import com.finwise.dto.budget.CreateBudgetRequest;
import com.finwise.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets & Spending Limits", description = "Endpoints for category budgets and 80%/100% threshold monitoring")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @Operation(summary = "Create new budget limit", description = "Initializes budget with rollover settings and alert threshold percentage.")
    public ResponseEntity<ApiResponse<BudgetProgressResponse>> createBudget(
            @Valid @RequestBody CreateBudgetRequest request,
            Principal principal) {
        Long userId = 1L;
        BudgetProgressResponse response = budgetService.createBudget(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Budget created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all active budget progress monitors", description = "Returns spent amounts, percentage consumption, remaining balances and alert statuses.")
    public ResponseEntity<ApiResponse<List<BudgetProgressResponse>>> getBudgets(Principal principal) {
        Long userId = 1L;
        List<BudgetProgressResponse> budgets = budgetService.getUserBudgetsProgress(userId);
        return ResponseEntity.ok(ApiResponse.success(budgets));
    }

    @GetMapping("/{budgetId}")
    @Operation(summary = "Get single budget status by ID")
    public ResponseEntity<ApiResponse<BudgetProgressResponse>> getBudgetById(
            @PathVariable Long budgetId,
            Principal principal) {
        Long userId = 1L;
        BudgetProgressResponse response = budgetService.getBudgetProgressById(userId, budgetId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{budgetId}")
    @Operation(summary = "Soft delete budget")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long budgetId,
            Principal principal) {
        Long userId = 1L;
        budgetService.deleteBudget(userId, budgetId);
        return ResponseEntity.ok(ApiResponse.success("Budget removed successfully", null));
    }
}
