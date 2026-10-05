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
import java.util.Locale;

@Slf4j
@Component
public class SbiBankImportStrategy implements BankImportStrategy {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);

    @Override
    public String getBankCode() {
        return "SBI";
    }

    @Override
    public String getDisplayName() {
        return "State Bank of India (CSV)";
    }

    @Override
    public boolean supports(String headerLine, String fileName) {
        if (headerLine == null) return false;
        String lower = headerLine.toLowerCase();
        return (lower.contains("txn date") && lower.contains("ref no./cheque no.")) ||
               (fileName != null && fileName.toLowerCase().contains("sbi"));
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
                String dateStr = record.get("Txn Date");
                if (dateStr == null || dateStr.isBlank()) continue;

                LocalDate txnDate = LocalDate.parse(dateStr.trim(), FORMATTER);
                String desc = record.get("Description");
                String refNo = record.isMapped("Ref No./Cheque No.") ? record.get("Ref No./Cheque No.") : "";

                BigDecimal debit = parseAmount(record, "Debit");
                BigDecimal credit = parseAmount(record, "Credit");
                BigDecimal balance = parseAmount(record, "Balance");

                results.add(ParsedTransactionDto.builder()
                        .transactionDate(txnDate)
                        .description(desc)
                        .referenceNumber(refNo)
                        .debitAmount(debit)
                        .creditAmount(credit)
                        .balanceAfter(balance)
                        .lineNumber(lineNo)
                        .build());
            } catch (Exception e) {
                log.warn("Skipping unparseable SBI row at line {}: {}", lineNo, e.getMessage());
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
