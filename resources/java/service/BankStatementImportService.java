package com.finwise.service;

import com.finwise.dto.importer.ImportSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

public interface BankStatementImportService {

    ImportSummaryResponse importStatement(Long userId, Long accountId, String bankCode, MultipartFile file);
}
