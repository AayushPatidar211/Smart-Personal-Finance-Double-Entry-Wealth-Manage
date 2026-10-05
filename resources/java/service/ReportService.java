package com.finwise.service;

import com.finwise.dto.report.FinancialAnalyticsReportDto;

import java.time.LocalDate;

public interface ReportService {

    FinancialAnalyticsReportDto generateAnalytics(Long userId, String period, LocalDate startDate, LocalDate endDate);

    byte[] exportPdfReport(Long userId, LocalDate startDate, LocalDate endDate);

    byte[] exportCsvTransactions(Long userId, LocalDate startDate, LocalDate endDate);
}
