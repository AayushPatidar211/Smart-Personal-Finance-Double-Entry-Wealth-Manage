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
public class HdfcBankImportStrategy implements BankImportStrategy {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yy");
    private static final DateTimeFormatter ALT_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public String getBankCode() {
        return "HDFC";
    }

    @Override
    public String getDisplayName() {
        return "HDFC Bank Statement (CSV)";
    }

    @Override
    public boolean supports(String headerLine, String fileName) {
        if (headerLine == null) return false;
        String lower = headerLine.toLowerCase();
        return (lower.contains("narration") && lower.contains("chq/ref")) ||
               (fileName != null && fileName.toLowerCase().contains("hdfc"));
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
                String dateStr = record.get("Date");
                if (dateStr == null || dateStr.isBlank()) continue;

                LocalDate txnDate;
                try {
                    txnDate = LocalDate.parse(dateStr.trim(), DATE_FORMATTER);
                } catch (Exception e) {
                    txnDate = LocalDate.parse(dateStr.trim(), ALT_FORMATTER);
                }

                String narration = record.get("Narration");
                String refNo = record.isMapped("Chq/Ref Number") ? record.get("Chq/Ref Number") : "";

                BigDecimal withdrawal = parseAmount(record, "Withdrawal Amt.");
                BigDecimal deposit = parseAmount(record, "Deposit Amt.");
                BigDecimal balance = parseAmount(record, "Closing Balance");

                results.add(ParsedTransactionDto.builder()
                        .transactionDate(txnDate)
                        .description(narration)
                        .referenceNumber(refNo)
                        .debitAmount(withdrawal)
                        .creditAmount(deposit)
                        .balanceAfter(balance)
                        .lineNumber(lineNo)
                        .rawData(record.toString())
                        .build());
            } catch (Exception e) {
                log.warn("Skipping unparseable HDFC row at line {}: {}", lineNo, e.getMessage());
            }
        }
        return results;
    }

    private BigDecimal parseAmount(CSVRecord record, String headerName) {
        if (!record.isMapped(headerName)) return BigDecimal.ZERO;
        String val = record.get(headerName);
        if (val == null || val.isBlank()) return BigDecimal.ZERO;
        val = val.replaceAll("[,\\s]", "");
        return new BigDecimal(val);
    }
}
