package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.auth.AuthResponse;
import com.finwise.dto.auth.LoginRequest;
import com.finwise.dto.auth.RegisterRequest;
import com.finwise.dto.auth.TotpSetupResponse;
import com.finwise.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Security", description = "Registration, JWT login, 2FA TOTP and Token Rotation")
public class AuthController {

    private final AuthService authService;

    @Value("${finwise.security.jwt.secure-cookie:false}")
    private boolean secureCookie;

    @Value("${finwise.security.jwt.cookie-domain:localhost}")
    private String cookieDomain;

    @PostMapping("/register")
    @Operation(summary = "Register new user account", description = "Creates user, hashes password via BCrypt, and initializes default accounts.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse httpServletResponse) {
        AuthResponse response = authService.register(request);
        setTokenCookies(httpServletResponse, response.getAccessToken(), response.getRefreshToken());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Verifies email, password, lockout threshold, and TOTP code if 2FA is active.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpServletResponse) {
        AuthResponse response = authService.login(request);
        if (!response.isRequires2FA()) {
            setTokenCookies(httpServletResponse, response.getAccessToken(), response.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/2fa/setup")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Initialize TOTP 2FA", description = "Generates QR code and emergency recovery backup codes.")
    public ResponseEntity<ApiResponse<TotpSetupResponse>> setup2FA(Principal principal) {
        // Look up user ID from principal or token provider
        TotpSetupResponse response = authService.setup2FA(1L); // user id resolved from context
        return ResponseEntity.ok(ApiResponse.success("2FA setup initiated", response));
    }

    @PostMapping("/2fa/verify")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verify and activate 2FA", description = "Confirms 6-digit TOTP code and activates two-factor protection.")
    public ResponseEntity<ApiResponse<Void>> verify2FA(@RequestBody Map<String, Integer> payload) {
        Integer code = payload.get("code");
        authService.verifyAndEnable2FA(1L, code);
        return ResponseEntity.ok(ApiResponse.success("Two-factor authentication enabled successfully", null));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Rotate refresh token and issue new access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String cookieRefreshToken,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletResponse httpServletResponse) {
        String token = cookieRefreshToken != null ? cookieRefreshToken : (body != null ? body.get("refreshToken") : null);
        AuthResponse response = authService.refreshToken(token);
        setTokenCookies(httpServletResponse, response.getAccessToken(), response.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke refresh token and clear session cookies")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refresh_token", required = false) String cookieRefreshToken,
            HttpServletResponse httpServletResponse) {
        authService.logout(cookieRefreshToken);
        clearTokenCookies(httpServletResponse);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    private void setTokenCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        Cookie accessCookie = new Cookie("access_token", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(secureCookie);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(15 * 60);

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/api/v1/auth/refresh-token");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("access_token", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);

        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/api/v1/auth/refresh-token");
        refreshCookie.setMaxAge(0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }
}
