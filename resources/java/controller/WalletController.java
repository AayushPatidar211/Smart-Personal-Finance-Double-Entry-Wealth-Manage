package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.account.AccountResponse;
import com.finwise.dto.account.TransferRequest;
import com.finwise.dto.account.TransferResponse;
import com.finwise.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet & Transfers", description = "High-concurrency inter-account fund transfers and balance reconciliation")
public class WalletController {

    private final AccountService accountService;

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds between accounts", description = "Executes atomic double-entry transfer with pessimistic lock ordering and optimistic version increments.")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            Principal principal) {
        Long userId = 1L;
        TransferResponse response = accountService.transferFunds(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", response));
    }

    @GetMapping("/net-worth")
    @Operation(summary = "Calculate aggregated net worth across all active accounts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNetWorth(Principal principal) {
        Long userId = 1L;
        BigDecimal netWorth = accountService.getNetWorth(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "userId", userId,
                "totalNetWorth", netWorth,
                "currency", "USD"
        )));
    }

    @PostMapping("/reconcile/{accountId}")
    @Operation(summary = "Reconcile account balance against transaction ledger")
    public ResponseEntity<ApiResponse<AccountResponse>> reconcile(
            @PathVariable Long accountId,
            Principal principal) {
        Long userId = 1L;
        AccountResponse response = accountService.reconcileBalance(userId, accountId);
        return ResponseEntity.ok(ApiResponse.success("Account balance reconciled", response));
    }
}
