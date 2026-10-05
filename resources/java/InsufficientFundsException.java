package com.finwise.exception;

import org.springframework.http.HttpStatus;

import java.math.BigDecimal;

public class InsufficientFundsException extends BusinessException {

    public InsufficientFundsException(Long accountId, BigDecimal balance, BigDecimal requestedAmount) {
        super(String.format("Account ID %d has insufficient funds. Available: %s, Requested: %s",
                accountId, balance.toPlainString(), requestedAmount.toPlainString()), HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public InsufficientFundsException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
