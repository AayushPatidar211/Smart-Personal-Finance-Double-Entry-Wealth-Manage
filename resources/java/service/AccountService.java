package com.finwise.service;

import com.finwise.dto.account.*;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {

    AccountResponse createAccount(Long userId, CreateAccountRequest request);

    AccountResponse getAccountById(Long userId, Long accountId);

    List<AccountResponse> getUserAccounts(Long userId);

    TransferResponse transferFunds(Long userId, TransferRequest request);

    BigDecimal getNetWorth(Long userId);

    void deactivateAccount(Long userId, Long accountId);

    AccountResponse reconcileBalance(Long userId, Long accountId);
}
