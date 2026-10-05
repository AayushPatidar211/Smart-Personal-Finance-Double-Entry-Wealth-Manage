package com.finwise.repository;

import com.finwise.entity.AiInsight;
import com.finwise.entity.AiInsight.InsightType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {

    List<AiInsight> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<AiInsight> findFirstByUserIdAndPeriodMonthAndInsightTypeOrderByCreatedAtDesc(
            Long userId, String periodMonth, InsightType insightType);
}
