package com.finwise.service.impl;

import com.finwise.dto.auth.AuthResponse;
import com.finwise.dto.auth.LoginRequest;
import com.finwise.dto.auth.RegisterRequest;
import com.finwise.dto.auth.TotpSetupResponse;
import com.finwise.entity.Account;
import com.finwise.entity.RefreshToken;
import com.finwise.entity.User;
import com.finwise.entity.User2FA;
import com.finwise.exception.BusinessException;
import com.finwise.exception.DuplicateResourceException;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.repository.AccountRepository;
import com.finwise.repository.RefreshTokenRepository;
import com.finwise.repository.UserRepository;
import com.finwise.security.JwtTokenProvider;
import com.finwise.security.TotpService;
import com.finwise.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TotpService totpService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("User already exists with email: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .currencyCode(request.getCurrencyCode().toUpperCase())
                .timezone(request.getTimezone())
                .role(User.Role.ROLE_USER)
                .status(User.UserStatus.ACTIVE)
                .failedAttemptCount(0)
                .build();

        User savedUser = userRepository.save(user);

        // Bootstrap default financial accounts for new user
        Account checking = Account.builder()
                .user(savedUser)
                .accountName("Default Checking Account")
                .accountType(Account.AccountType.CHECKING)
                .currencyCode(savedUser.getCurrencyCode())
                .balance(BigDecimal.ZERO)
                .openingBalance(BigDecimal.ZERO)
                .isActive(true)
                .build();

        Account cash = Account.builder()
                .user(savedUser)
                .accountName("Cash Wallet")
                .accountType(Account.AccountType.CASH)
                .currencyCode(savedUser.getCurrencyCode())
                .balance(BigDecimal.ZERO)
                .openingBalance(BigDecimal.ZERO)
                .isActive(true)
                .build();

        accountRepository.saveAll(List.of(checking, cash));

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getId(), savedUser.getEmail());
        saveRefreshToken(savedUser, rawRefreshToken);

        return buildAuthResponse(savedUser, accessToken, rawRefreshToken, false);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check Account Lockout
        if (user.getLockedUntil() != null) {
            if (Instant.now().isBefore(user.getLockedUntil())) {
                long minutesLeft = ChronoUnit.MINUTES.between(Instant.now(), user.getLockedUntil()) + 1;
                throw new BusinessException(
                        String.format("Account is temporarily locked due to excessive failed attempts. Try again in %d minute(s).", minutesLeft),
                        HttpStatus.LOCKED);
            } else {
                user.setLockedUntil(null);
                user.setFailedAttemptCount(0);
            }
        }

        // Verify Password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedAttemptCount() + 1;
            user.setFailedAttemptCount(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(Instant.now().plus(LOCKOUT_DURATION_MINUTES, ChronoUnit.MINUTES));
                log.warn("Account {} locked for {} minutes after {} failed attempts", user.getEmail(), LOCKOUT_DURATION_MINUTES, attempts);
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check 2FA requirement
        User2FA twoFa = user.getTwoFactorAuth();
        boolean is2faEnabled = twoFa != null && twoFa.isEnabled();

        if (is2faEnabled) {
            if (request.getTotpCode() == null) {
                return AuthResponse.builder()
                        .requires2FA(true)
                        .email(user.getEmail())
                        .build();
            }
            boolean validTotp = totpService.verifyCode(twoFa.getSecretKey(), request.getTotpCode());
            if (!validTotp) {
                throw new BadCredentialsException("Invalid two-factor authentication code");
            }
        }

        // Reset failed attempts on success
        user.setFailedAttemptCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        saveRefreshToken(user, rawRefreshToken);

        return buildAuthResponse(user, accessToken, rawRefreshToken, is2faEnabled);
    }

    @Override
    @Transactional
    public TotpSetupResponse setup2FA(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String secretKey = totpService.generateSecretKey();
        List<String> backupCodes = totpService.generateBackupCodes(8);
        String qrCodeUri = totpService.generateQrCodeDataUri(secretKey, user.getEmail());

        User2FA user2FA = user.getTwoFactorAuth();
        if (user2FA == null) {
            user2FA = User2FA.builder()
                    .user(user)
                    .secretKey(secretKey)
                    .backupCodes(String.join(",", backupCodes))
                    .isEnabled(false)
                    .build();
        } else {
            user2FA.setSecretKey(secretKey);
            user2FA.setBackupCodes(String.join(",", backupCodes));
            user2FA.setEnabled(false);
        }
        user.setTwoFactorAuth(user2FA);
        userRepository.save(user);

        return TotpSetupResponse.builder()
                .secretKey(secretKey)
                .qrCodeDataUri(qrCodeUri)
                .backupCodes(backupCodes)
                .instructions("Scan this QR code with Google Authenticator or Authy, then verify with the 6-digit code.")
                .build();
    }

    @Override
    @Transactional
    public void verifyAndEnable2FA(Long userId, int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        User2FA user2FA = user.getTwoFactorAuth();
        if (user2FA == null) {
            throw new BusinessException("2FA setup not initiated. Please request setup first.", HttpStatus.BAD_REQUEST);
        }

        if (!totpService.verifyCode(user2FA.getSecretKey(), code)) {
            throw new BusinessException("Invalid verification code. Please check your authenticator app.", HttpStatus.BAD_REQUEST);
        }

        user2FA.setEnabled(true);
        user2FA.setEnabledAt(Instant.now());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        if (!jwtTokenProvider.validateToken(rawRefreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        String tokenHash = sha256Hex(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHashAndIsRevokedFalse(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token was revoked or not found"));

        if (token.isExpired()) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new BadCredentialsException("Refresh token has expired");
        }

        // Token Rotation: revoke old token and issue fresh refresh token
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = token.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        saveRefreshToken(user, newRefreshToken);

        return buildAuthResponse(user, newAccessToken, newRefreshToken, false);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null) {
            String tokenHash = sha256Hex(rawRefreshToken);
            refreshTokenRepository.findByTokenHashAndIsRevokedFalse(tokenHash)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }
    }

    private void saveRefreshToken(User user, String rawToken) {
        String tokenHash = sha256Hex(rawToken);
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .isRevoked(false)
                .build();
        refreshTokenRepository.save(token);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken, boolean twoFactor) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInMs(900000) // 15 mins
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .currencyCode(user.getCurrencyCode())
                .twoFactorEnabled(twoFactor)
                .requires2FA(false)
                .build();
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
