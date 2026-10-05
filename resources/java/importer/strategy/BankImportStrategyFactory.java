package com.finwise.importer.strategy;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class BankImportStrategyFactory {

    private final List<BankImportStrategy> strategies;

    public BankImportStrategy getStrategy(String bankCode) {
        if (bankCode == null) return null;
        for (BankImportStrategy strategy : strategies) {
            if (strategy.getBankCode().equalsIgnoreCase(bankCode.trim())) {
                return strategy;
            }
        }
        return null;
    }

    /**
     * Inspects header line and file name to auto-detect appropriate bank parser strategy.
     */
    public BankImportStrategy detectStrategy(String headerLine, String fileName) {
        for (BankImportStrategy strategy : strategies) {
            if (strategy.supports(headerLine, fileName)) {
                log.info("Auto-detected bank strategy: {} for file: {}", strategy.getDisplayName(), fileName);
                return strategy;
            }
        }
        log.warn("Could not auto-detect specific bank parser for {}. Falling back to default.", fileName);
        return strategies.get(0); // Fallback to first available strategy
    }

    public List<BankImportStrategy> getAllStrategies() {
        return strategies;
    }
}
