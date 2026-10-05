package com.finwise.repository;

import com.finwise.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    Page<Transaction> findByUserIdAndTransactionDateBetweenAndIsDeletedFalse(
            Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * Idempotency Check: Fast index-scan on (user_id, checksum_hash) to block duplicate imports.
     */
    boolean existsByUserIdAndChecksumHashAndIsDeletedFalse(Long userId, String checksumHash);

    /**
     * Computes category-wise expense breakdown for Chart.js compatible responses.
     */
    @Query("SELECT t.category.id AS categoryId, t.category.name AS categoryName, t.category.colorHex AS colorHex, " +
           "SUM(t.amount) AS totalAmount " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionType = 'EXPENSE' AND t.isDeleted = false " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category.id, t.category.name, t.category.colorHex " +
           "ORDER BY totalAmount DESC")
    List<CategoryExpenseProjection> aggregateExpensesByCategory(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionType = :type AND t.isDeleted = false " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    interface CategoryExpenseProjection {
        Long getCategoryId();
        String getCategoryName();
        String getColorHex();
        BigDecimal getTotalAmount();
    }
}
