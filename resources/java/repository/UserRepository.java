package com.finwise.repository;

import com.finwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    boolean existsByEmailAndIsDeletedFalse(String email);

    @Modifying
    @Query("UPDATE User u SET u.failedAttemptCount = u.failedAttemptCount + 1 WHERE u.email = :email")
    void incrementFailedAttempts(@Param("email") String email);

    @Modifying
    @Query("UPDATE User u SET u.failedAttemptCount = 0, u.lockedUntil = NULL WHERE u.email = :email")
    void resetFailedAttempts(@Param("email") String email);

    @Modifying
    @Query("UPDATE User u SET u.lockedUntil = :lockUntil WHERE u.email = :email")
    void lockUserAccount(@Param("email") String email, @Param("lockUntil") Instant lockUntil);
}
