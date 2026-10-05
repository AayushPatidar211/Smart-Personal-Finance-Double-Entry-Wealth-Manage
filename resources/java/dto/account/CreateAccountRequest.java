package com.finwise.dto.account;

import com.finwise.entity.Account.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 100, message = "Account name must not exceed 100 characters")
    private String accountName;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    @Builder.Default
    private String currencyCode = "USD";

    @DecimalMin(value = "0.00", message = "Opening balance cannot be negative")
    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Size(max = 100)
    private String institutionName;

    @Size(max = 20)
    private String accountNumberMasked;
}
