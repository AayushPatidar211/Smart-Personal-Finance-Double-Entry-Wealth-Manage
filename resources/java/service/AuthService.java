package com.finwise.service;

import com.finwise.dto.auth.AuthResponse;
import com.finwise.dto.auth.LoginRequest;
import com.finwise.dto.auth.RegisterRequest;
import com.finwise.dto.auth.TotpSetupResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    TotpSetupResponse setup2FA(Long userId);

    void verifyAndEnable2FA(Long userId, int code);

    AuthResponse refreshToken(String refreshToken);

    void logout(String refreshToken);
}
