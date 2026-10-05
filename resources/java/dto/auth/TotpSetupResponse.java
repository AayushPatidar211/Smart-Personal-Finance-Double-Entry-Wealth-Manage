package com.finwise.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotpSetupResponse {

    private String secretKey;
    private String qrCodeDataUri;
    private List<String> backupCodes;
    private String instructions;
}
