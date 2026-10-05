package com.finwise.repository;

import com.finwise.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserIdAndIsActiveTrueAndIsDeletedFalse(Long userId);

    Optional<Account> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    /**
     * Critical Fintech Method: Acquires a database-level PESSIMISTIC_WRITE (SELECT ... FOR UPDATE) lock.
     * Prevents race conditions, concurrent overdrafts, and phantom reads during intra-account fund transfers.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id AND a.isDeleted = false")
    Optional<Account> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a WHERE a.user.id = :userId AND a.isActive = true AND a.isDeleted = false")
    BigDecimal sumTotalNetWorthByUserId(@Param("userId") Long userId);
}
