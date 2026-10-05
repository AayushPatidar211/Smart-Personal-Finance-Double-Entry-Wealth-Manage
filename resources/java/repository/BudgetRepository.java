package com.finwise.repository;

import com.finwise.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndIsActiveTrueAndIsDeletedFalse(Long userId);

    Optional<Budget> findByUserIdAndCategoryIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndIsDeletedFalse(
            Long userId, Long categoryId, LocalDate currentDateStart, LocalDate currentDateEnd);

    /**
     * Used by Quartz BudgetBreachJob to identify budgets exceeding threshold percentage.
     */
    @Query("SELECT b FROM Budget b " +
           "WHERE b.isActive = true AND b.isDeleted = false " +
           "AND (b.spentAmount * 100 / b.amountLimit) >= b.alertThresholdPct")
    List<Budget> findBudgetsExceedingAlertThreshold();
}
