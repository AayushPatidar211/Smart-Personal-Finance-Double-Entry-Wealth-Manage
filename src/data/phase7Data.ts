export const SAMPLE_HDFC_CSV = `Date,Narration,Chq/Ref Number,Value Dt,Withdrawal Amt.,Deposit Amt.,Closing Balance
01/10/26,SWIGGY BANGALORE UPI/62910291,UPI-62910291,01/10/26,450.00,,42875.50
02/10/26,UBER INDIA TECH PVT LTD,UPI-98210341,02/10/26,380.00,,42495.50
03/10/26,SALARY CREDIT ACME CORP,NEFT-8910283,03/10/26,,85000.00,127495.50
03/10/26,AMAZON PAY INDIA,UPI-19284019,03/10/26,1299.00,,126196.50
04/10/26,STARBUCKS COFFEE KORAMANGALA,POS-4910293,04/10/26,350.00,,125846.50
04/10/26,STARBUCKS COFFEE KORAMANGALA,POS-4910293,04/10/26,350.00,,125846.50`;

export const SAMPLE_ICICI_CSV = `Transaction Date,Cheque Number,Transaction Remarks,Debit Amount,Credit Amount,Balance
01-10-2026,CHQ-10029,ZOMATO FOODS GURGAON,620.00,,38500.00
02-10-2026,UPI-81920,SHELL PETROL PUMP WHITEFIELD,2400.00,,36100.00
03-10-2026,NEFT-4918,MONTHLY DIVIDEND PAYOUT,,1500.00,37600.00
04-10-2026,UPI-99210,NETFLIX ENTERTAINMENT,649.00,,36951.00`;

export const SAMPLE_SBI_CSV = `Txn Date,Value Date,Description,Ref No./Cheque No.,Debit,Credit,Balance
01 Oct 2026,01 Oct 2026,TRANSFER TO PPF ACCOUNT,REF-910283,5000.00,,62000.00
02 Oct 2026,02 Oct 2026,FLIPKART INTERNET PVT,UPI-481920,1899.00,,60101.00
03 Oct 2026,03 Oct 2026,ELECTRICITY BILL BESCOM,BBPS-819203,1420.00,,58681.00`;

export const BANK_STRATEGY_JAVA = `package com.finwise.importer.strategy;

import com.finwise.dto.importer.ParsedTransactionDto;
import java.io.InputStream;
import java.util.List;

public interface BankImportStrategy {
    String getBankCode();
    String getDisplayName();
    boolean supports(String headerLine, String fileName);
    List<ParsedTransactionDto> parse(InputStream inputStream) throws Exception;
}`;

export const BANK_FACTORY_JAVA = `package com.finwise.importer.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BankImportStrategyFactory {

    private final List<BankImportStrategy> strategies;

    public BankImportStrategy getStrategy(String bankCode) {
        return strategies.stream()
                .filter(s -> s.getBankCode().equalsIgnoreCase(bankCode))
                .findFirst()
                .orElse(null);
    }

    public BankImportStrategy detectStrategy(String headerLine, String fileName) {
        return strategies.stream()
                .filter(s -> s.supports(headerLine, fileName))
                .findFirst()
                .orElse(strategies.get(0));
    }
}`;

export const DEDUPLICATION_SERVICE_JAVA = `package com.finwise.importer.deduplication;

import com.finwise.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class TransactionDeduplicationService {

    private final TransactionRepository transactionRepository;

    public String calculateChecksum(Long accountId, LocalDate date, BigDecimal amount, String description, String refNumber) {
        try {
            String normDesc = description != null ? description.trim().replaceAll("\\\\s+", " ").toLowerCase() : "";
            String normRef = refNumber != null ? refNumber.trim().toLowerCase() : "";
            String raw = String.format("%d|%s|%s|%s|%s", accountId, date, amount.toPlainString(), normDesc, normRef);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 error", e);
        }
    }

    public boolean isDuplicate(Long userId, String checksumHash) {
        return transactionRepository.existsByUserIdAndChecksumHashAndIsDeletedFalse(userId, checksumHash);
    }
}`;
