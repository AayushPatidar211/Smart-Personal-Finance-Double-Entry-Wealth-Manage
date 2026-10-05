package com.finwise.repository;

import com.finwise.entity.RecurringRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface RecurringRuleRepository extends JpaRepository<RecurringRule, Long> {

    /**
     * Chunk Reader Query for Spring Batch recurring transaction generation job.
     */
    @Query("SELECT r FROM RecurringRule r " +
           "WHERE r.isPaused = false AND r.isDeleted = false " +
           "AND r.nextRunDate <= :executionDate")
    Page<RecurringRule> findDueRulesForExecution(
            @Param("executionDate") LocalDate executionDate,
            Pageable pageable);
}
