package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.importer.ImportSummaryResponse;
import com.finwise.service.BankStatementImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
@Tag(name = "Bank Statement Importer", description = "Multipart statement upload, multi-bank parsing and SHA-256 deduplication")
public class BankImportController {

    private final BankStatementImportService importService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and parse bank statement CSV", description = "Selects strategy (HDFC/ICICI/SBI/Chase), auto-categorizes, and filters duplicates.")
    public ResponseEntity<ApiResponse<ImportSummaryResponse>> uploadStatement(
            @RequestParam("file") MultipartFile file,
            @RequestParam("accountId") Long accountId,
            @RequestParam(value = "bankCode", required = false) String bankCode,
            Principal principal) {
        Long userId = 1L; // Derived from SecurityContext
        ImportSummaryResponse summary = importService.importStatement(userId, accountId, bankCode, file);
        return ResponseEntity.ok(ApiResponse.success("Statement imported successfully", summary));
    }
}
