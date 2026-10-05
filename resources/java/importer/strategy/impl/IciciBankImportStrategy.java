package com.finwise.importer.strategy.impl;

import com.finwise.dto.importer.ParsedTransactionDto;
import com.finwise.importer.strategy.BankImportStrategy;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class IciciBankImportStrategy implements BankImportStrategy {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    @Override
    public String getBankCode() {
        return "ICICI";
    }

    @Override
    public String getDisplayName() {
        return "ICICI Bank Statement (CSV)";
    }

    @Override
    public boolean supports(String headerLine, String fileName) {
        if (headerLine == null) return false;
        String lower = headerLine.toLowerCase();
        return (lower.contains("transaction remarks") && lower.contains("cheque number")) ||
               (fileName != null && fileName.toLowerCase().contains("icici"));
    }

    @Override
    public List<ParsedTransactionDto> parse(InputStream inputStream) throws Exception {
        List<ParsedTransactionDto> results = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));

        CSVParser csvParser = CSVFormat.DEFAULT
                .builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build()
                .parse(reader);

        int lineNo = 1;
        for (CSVRecord record : csvParser) {
            lineNo++;
            try {
                String dateStr = record.get("Transaction Date");
                if (dateStr == null || dateStr.isBlank()) continue;

                LocalDate txnDate = LocalDate.parse(dateStr.trim(), FORMATTER);
                String remarks = record.get("Transaction Remarks");
                String cheque = record.isMapped("Cheque Number") ? record.get("Cheque Number") : "";

                BigDecimal debit = parseAmount(record, "Debit Amount");
                BigDecimal credit = parseAmount(record, "Credit Amount");
                BigDecimal balance = parseAmount(record, "Balance");

                results.add(ParsedTransactionDto.builder()
                        .transactionDate(txnDate)
                        .description(remarks)
                        .referenceNumber(cheque)
                        .debitAmount(debit)
                        .creditAmount(credit)
                        .balanceAfter(balance)
                        .lineNumber(lineNo)
                        .build());
            } catch (Exception e) {
                log.warn("Skipping unparseable ICICI row at line {}: {}", lineNo, e.getMessage());
            }
        }
        return results;
    }

    private BigDecimal parseAmount(CSVRecord record, String col) {
        if (!record.isMapped(col)) return BigDecimal.ZERO;
        String val = record.get(col);
        if (val == null || val.isBlank() || "-".equals(val.trim())) return BigDecimal.ZERO;
        return new BigDecimal(val.replaceAll("[,\\s]", ""));
    }
}
