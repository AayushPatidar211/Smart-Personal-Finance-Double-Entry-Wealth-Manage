package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.account.AccountResponse;
import com.finwise.dto.account.CreateAccountRequest;
import com.finwise.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts & Wallets", description = "Endpoints for managing bank accounts, credit cards, cash wallets")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Create new account/wallet", description = "Initializes an account with opening balance and optimistic locking version.")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            Principal principal) {
        Long userId = 1L; // In production, resolved from JWT Principal / SecurityContext
        AccountResponse response = accountService.createAccount(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Account created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all active user accounts", description = "Retrieves accounts with current computed balances.")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts(Principal principal) {
        Long userId = 1L;
        List<AccountResponse> accounts = accountService.getUserAccounts(userId);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account details by ID")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable Long accountId,
            Principal principal) {
        Long userId = 1L;
        AccountResponse account = accountService.getAccountById(userId, accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @DeleteMapping("/{accountId}")
    @Operation(summary = "Deactivate account", description = "Soft deactivates an account once balance reaches zero.")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount(
            @PathVariable Long accountId,
            Principal principal) {
        Long userId = 1L;
        accountService.deactivateAccount(userId, accountId);
        return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully", null));
    }
}
