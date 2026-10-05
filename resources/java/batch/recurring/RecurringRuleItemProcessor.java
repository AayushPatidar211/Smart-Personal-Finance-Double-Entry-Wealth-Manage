package com.finwise.batch.recurring;

import com.finwise.entity.Account;
import com.finwise.entity.RecurringRule;
import com.finwise.entity.Transaction;
import com.finwise.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringRuleItemProcessor implements ItemProcessor<RecurringRule, RecurringBatchPayload> {

    private final TransactionRepository transactionRepository;

    @Override
    public RecurringBatchPayload process(RecurringRule rule) throws Exception {
        LocalDate executionDate = rule.getNextRunDate();
        Long userId = rule.getUser().getId();

        // 1. Idempotency Check: compute determinist SHA-256 hash for rule execution on this date
        String checksum = computeRecurringChecksum(rule.getId(), executionDate, rule.getAmount().toPlainString());

        if (transactionRepository.existsByUserIdAndChecksumHashAndIsDeletedFalse(userId, checksum)) {
            log.warn("Skipping recurring rule #{} - already processed for date {}", rule.getId(), executionDate);
            return null; // Spring Batch ItemProcessor returning null filters/skips item
        }

        Account account = rule.getAccount();

        // 2. Adjust Balance according to Transaction Type
        if (rule.getTransactionType() == Transaction.TransactionType.EXPENSE) {
            account.debit(rule.getAmount());
        } else if (rule.getTransactionType() == Transaction.TransactionType.INCOME) {
            account.credit(rule.getAmount());
        }

        // 3. Create Transaction Ledger Entry
        Transaction tx = Transaction.builder()
                .user(rule.getUser())
                .account(account)
                .category(rule.getCategory())
                .transactionType(rule.getTransactionType())
                .amount(rule.getAmount())
                .currencyCode(account.getCurrencyCode())
                .transactionDate(executionDate)
                .description("[Recurring] " + rule.getDescription())
                .isRecurring(true)
                .checksumHash(checksum)
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();

        // 4. Advance Next Run Date for Recurring Rule
        rule.advanceNextRunDate();

        log.debug("Processed recurring rule #{} for {}. Next run set to: {}", rule.getId(), executionDate, rule.getNextRunDate());

        return RecurringBatchPayload.builder()
                .rule(rule)
                .transaction(tx)
                .account(account)
                .build();
    }

    private String computeRecurringChecksum(Long ruleId, LocalDate date, String amount) {
        try {
            String raw = String.format("RECURRING|%d|%s|%s", ruleId, date.toString(), amount);
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(raw.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 generation error", e);
        }
    }
}
