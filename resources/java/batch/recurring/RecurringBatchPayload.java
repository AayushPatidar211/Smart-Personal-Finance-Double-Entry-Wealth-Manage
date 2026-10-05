package com.finwise.batch.recurring;

import com.finwise.entity.Account;
import com.finwise.entity.RecurringRule;
import com.finwise.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringBatchPayload {
    private RecurringRule rule;
    private Transaction transaction;
    private Account account;
}
