package com.finwise.dto.account;

import com.finwise.entity.Account.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private Long id;
    private Long userId;
    private String accountName;
    private AccountType accountType;
    private String currencyCode;
    private BigDecimal balance;
    private BigDecimal openingBalance;
    private String institutionName;
    private String accountNumberMasked;
    private boolean isActive;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
}
