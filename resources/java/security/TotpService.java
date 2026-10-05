package com.finwise.security;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
public class TotpService {

    private final GoogleAuthenticator gAuth;
    private final String issuer;
    private final SecureRandom secureRandom = new SecureRandom();

    public TotpService(@Value("${finwise.security.totp.issuer:FinWise AI}") String issuer) {
        this.issuer = issuer;
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
                .setTimeStepSizeInMillis(30000)
                .setWindowSize(1) // Allows ±30 seconds drift tolerance
                .build();
        this.gAuth = new GoogleAuthenticator(config);
    }

    public String generateSecretKey() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    public boolean verifyCode(String secretKey, int code) {
        if (secretKey == null || code <= 0) return false;
        return gAuth.authorize(secretKey, code);
    }

    public String generateQrCodeDataUri(String secretKey, String email) {
        String otpAuthUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                issuer, email, secretKey, issuer);
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(otpAuthUrl, BarcodeFormat.QR_CODE, 220, 220);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] pngBytes = outputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes);
        } catch (Exception e) {
            log.error("Failed to generate TOTP QR Code", e);
            throw new RuntimeException("Could not generate 2FA QR code", e);
        }
    }

    public List<String> generateBackupCodes(int count) {
        List<String> codes = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            int num = 10000000 + secureRandom.nextInt(90000000);
            codes.add(String.valueOf(num));
        }
        return codes;
    }
}
