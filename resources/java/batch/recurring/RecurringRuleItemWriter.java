package com.finwise.batch.recurring;

import com.finwise.entity.Account;
import com.finwise.entity.RecurringRule;
import com.finwise.entity.Transaction;
import com.finwise.repository.AccountRepository;
import com.finwise.repository.RecurringRuleRepository;
import com.finwise.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringRuleItemWriter implements ItemWriter<RecurringBatchPayload> {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final RecurringRuleRepository recurringRuleRepository;

    @Override
    @Transactional
    public void write(Chunk<? extends RecurringBatchPayload> chunk) throws Exception {
        List<Transaction> transactionsToSave = new ArrayList<>();
        List<Account> accountsToSave = new ArrayList<>();
        List<RecurringRule> rulesToSave = new ArrayList<>();

        for (RecurringBatchPayload payload : chunk) {
            transactionsToSave.add(payload.getTransaction());
            accountsToSave.add(payload.getAccount());
            rulesToSave.add(payload.getRule());
        }

        transactionRepository.saveAll(transactionsToSave);
        accountRepository.saveAll(accountsToSave);
        recurringRuleRepository.saveAll(rulesToSave);

        log.info("Batch writer successfully committed chunk of {} recurring transactions.", chunk.size());
    }
}
