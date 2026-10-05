package com.finwise.repository;

import com.finwise.entity.ImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImportBatchRepository extends JpaRepository<ImportBatch, Long> {

    List<ImportBatch> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ImportBatch> findByUserIdAndFileHash(Long userId, String fileHash);
}
