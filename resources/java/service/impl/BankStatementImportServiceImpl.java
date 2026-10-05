package com.finwise.service.impl;

import com.finwise.dto.importer.ImportSummaryResponse;
import com.finwise.dto.importer.ImportSummaryResponse.SkippedDuplicateDto;
import com.finwise.dto.importer.ParsedTransactionDto;
import com.finwise.entity.*;
import com.finwise.exception.BusinessException;
import com.finwise.exception.ResourceNotFoundException;
import com.finwise.importer.deduplication.TransactionDeduplicationService;
import com.finwise.importer.strategy.BankImportStrategy;
import com.finwise.importer.strategy.BankImportStrategyFactory;
import com.finwise.repository.*;
import com.finwise.service.BankStatementImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankStatementImportServiceImpl implements BankStatementImportService {

    private final BankImportStrategyFactory strategyFactory;
    private final TransactionDeduplicationService deduplicationService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final ImportBatchRepository importBatchRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ImportSummaryResponse importStatement(Long userId, Long accountId, String bankCode, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Uploaded file is empty", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Account account = accountRepository.findByIdAndUserIdAndIsDeletedFalse(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        byte[] fileBytes;
        String fileHash;
        try {
            fileBytes = file.getBytes();
            fileHash = calculateFileHash(fileBytes);
        } catch (Exception e) {
            throw new BusinessException("Failed to read uploaded file", HttpStatus.BAD_REQUEST);
        }

        // 1. Detect or Retrieve Strategy
        BankImportStrategy strategy;
        if (bankCode != null && !bankCode.isBlank()) {
            strategy = strategyFactory.getStrategy(bankCode);
            if (strategy == null) {
                throw new BusinessException("Unsupported bank code: " + bankCode, HttpStatus.BAD_REQUEST);
            }
        } else {
            String firstLine = extractFirstLine(fileBytes);
            strategy = strategyFactory.detectStrategy(firstLine, file.getOriginalFilename());
        }

        // 2. Parse Transactions via Selected Strategy
        List<ParsedTransactionDto> parsedRows;
        try (InputStream is = file.getInputStream()) {
            parsedRows = strategy.parse(is);
        } catch (Exception e) {
            log.error("Parsing failed using strategy {}", strategy.getDisplayName(), e);
            throw new BusinessException("Error parsing bank statement: " + e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // 3. Process Rows, Detect Duplicates, & Categorize
        List<Transaction> transactionsToSave = new ArrayList<>();
        List<SkippedDuplicateDto> skippedDuplicates = new ArrayList<>();
        List<Category> allCategories = categoryRepository.findAll();

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (ParsedTransactionDto row : parsedRows) {
            BigDecimal amount = row.getAmount().setScale(2, RoundingMode.HALF_EVEN);
            if (amount.compareTo(BigDecimal.ZERO) <= 0) continue;

            String checksum = deduplicationService.calculateChecksum(
                    account.getId(), row.getTransactionDate(), amount, row.getDescription(), row.getReferenceNumber());

            // Duplicate Check
            if (deduplicationService.isDuplicate(userId, checksum)) {
                skippedDuplicates.add(SkippedDuplicateDto.builder()
                        .lineNumber(row.getLineNumber())
                        .date(row.getTransactionDate().toString())
                        .description(row.getDescription())
                        .amount(amount)
                        .sha256Checksum(checksum.substring(0, 16) + "...")
                        .reason("Duplicate: Identical transaction already exists in ledger")
                        .build());
                continue;
            }

            Transaction.TransactionType type = row.isExpense()
                    ? Transaction.TransactionType.EXPENSE
                    : Transaction.TransactionType.INCOME;

            Category category = autoCategorize(row.getDescription(), allCategories);

            Transaction tx = Transaction.builder()
                    .user(user)
                    .account(account)
                    .category(category)
                    .transactionType(type)
                    .amount(amount)
                    .currencyCode(account.getCurrencyCode())
                    .transactionDate(row.getTransactionDate())
                    .description(row.getDescription())
                    .checksumHash(checksum)
                    .status(Transaction.TransactionStatus.COMPLETED)
                    .build();

            transactionsToSave.add(tx);

            if (row.isExpense()) {
                totalDebit = totalDebit.add(amount);
                account.debit(amount);
            } else {
                totalCredit = totalCredit.add(amount);
                account.credit(amount);
            }
        }

        // 4. Batch Persist & Balance Update
        transactionRepository.saveAll(transactionsToSave);
        accountRepository.save(account);

        // 5. Audit ImportBatch Record
        ImportBatch batch = ImportBatch.builder()
                .user(user)
                .account(account)
                .bankName(strategy.getBankCode())
                .fileName(file.getOriginalFilename())
                .fileHash(fileHash)
                .totalRecords(parsedRows.size())
                .importedCount(transactionsToSave.size())
                .duplicateCount(skippedDuplicates.size())
                .failedCount(0)
                .status(ImportBatch.ImportStatus.COMPLETED)
                .build();

        ImportBatch savedBatch = importBatchRepository.save(batch);

        return ImportSummaryResponse.builder()
                .batchId(savedBatch.getId())
                .bankName(strategy.getDisplayName())
                .fileName(file.getOriginalFilename())
                .fileHash(fileHash)
                .totalRecords(parsedRows.size())
                .importedCount(transactionsToSave.size())
                .duplicateCount(skippedDuplicates.size())
                .failedCount(0)
                .totalDebitAmount(totalDebit)
                .totalCreditAmount(totalCredit)
                .status("COMPLETED")
                .createdAt(Instant.now())
                .skippedDuplicates(skippedDuplicates)
                .build();
    }

    private Category autoCategorize(String description, List<Category> categories) {
        if (description == null) return categories.get(0);
        String desc = description.toLowerCase();

        for (Category cat : categories) {
            String name = cat.getName().toLowerCase();
            if (desc.contains(name) || desc.contains(cat.getSlug().toLowerCase())) {
                return cat;
            }
        }

        // Fintech keyword heuristics
        if (desc.contains("uber") || desc.contains("ola") || desc.contains("fuel") || desc.contains("metro") || desc.contains("shell")) {
            return findCategoryBySlug(categories, "transportation");
        }
        if (desc.contains("swiggy") || desc.contains("zomato") || desc.contains("starbucks") || desc.contains("mcdonald") || desc.contains("restaurant") || desc.contains("cafe")) {
            return findCategoryBySlug(categories, "food-dining");
        }
        if (desc.contains("amazon") || desc.contains("flipkart") || desc.contains("walmart") || desc.contains("target")) {
            return findCategoryBySlug(categories, "shopping");
        }
        if (desc.contains("salary") || desc.contains("payroll") || desc.contains("bonus") || desc.contains("dividend")) {
            return findCategoryBySlug(categories, "salary");
        }

        return categories.get(0);
    }

    private Category findCategoryBySlug(List<Category> list, String slug) {
        return list.stream()
                .filter(c -> c.getSlug().equalsIgnoreCase(slug))
                .findFirst()
                .orElse(list.get(0));
    }

    private String calculateFileHash(byte[] bytes) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(bytes);
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    private String extractFirstLine(byte[] bytes) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new java.io.ByteArrayInputStream(bytes), StandardCharsets.UTF_8))) {
            return reader.readLine();
        } catch (Exception e) {
            return "";
        }
    }
}
