package com.finwise.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresInMs;
    private boolean requires2FA;

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String currencyCode;
    private boolean twoFactorEnabled;
}
