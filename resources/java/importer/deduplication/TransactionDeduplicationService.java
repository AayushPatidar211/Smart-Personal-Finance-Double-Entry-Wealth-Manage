package com.finwise.importer.deduplication;

import com.finwise.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionDeduplicationService {

    private final TransactionRepository transactionRepository;

    /**
     * Generates a deterministic SHA-256 checksum from key financial immutable attributes:
     * (accountId + "|" + date + "|" + amount + "|" + normalizedDescription + "|" + referenceNumber)
     */
    public String calculateChecksum(Long accountId, LocalDate date, BigDecimal amount, String description, String refNumber) {
        try {
            String normDesc = description != null ? description.trim().replaceAll("\\s+", " ").toLowerCase() : "";
            String normRef = refNumber != null ? refNumber.trim().toLowerCase() : "";
            String amtStr = amount != null ? amount.toPlainString() : "0.00";

            String raw = String.format("%d|%s|%s|%s|%s", accountId, date.toString(), amtStr, normDesc, normRef);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm missing", e);
        }
    }

    /**
     * Checks if this transaction was already ingested for the specified user and account.
     */
    public boolean isDuplicate(Long userId, String checksumHash) {
        return transactionRepository.existsByUserIdAndChecksumHashAndIsDeletedFalse(userId, checksumHash);
    }
}
