package com.finwise.importer.strategy;

import com.finwise.dto.importer.ParsedTransactionDto;

import java.io.InputStream;
import java.util.List;

/**
 * Strategy interface for parsing heterogeneous bank statement formats (HDFC, ICICI, SBI, Chase, etc.)
 */
public interface BankImportStrategy {

    String getBankCode();

    String getDisplayName();

    /**
     * Inspects header tokens or filename pattern to determine if this strategy can parse the file.
     */
    boolean supports(String headerLine, String fileName);

    /**
     * Parses the CSV stream into normalized ParsedTransactionDto objects.
     */
    List<ParsedTransactionDto> parse(InputStream inputStream) throws Exception;
}
