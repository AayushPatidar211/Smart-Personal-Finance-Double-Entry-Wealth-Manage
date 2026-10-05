package com.finwise.controller;

import com.finwise.common.ApiResponse;
import com.finwise.dto.report.FinancialAnalyticsReportDto;
import com.finwise.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Financial analytics, Chart.js dataset generation, and PDF/CSV export")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/analytics")
    @Operation(summary = "Get aggregated financial analytics", description = "Returns summary metrics, Chart.js datasets (pie, bar, line), and budget vs actual variance.")
    public ResponseEntity<ApiResponse<FinancialAnalyticsReportDto>> getAnalytics(
            @RequestParam(defaultValue = "MONTHLY") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Principal principal) {
        Long userId = 1L;
        FinancialAnalyticsReportDto report = reportService.generateAnalytics(userId, period, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Export financial summary report as PDF", description = "Generates formatted PDF report using iText 7.")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Principal principal) {
        Long userId = 1L;
        byte[] pdfBytes = reportService.exportPdfReport(userId, startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=FinWise_Financial_Report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export transactions ledger as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Principal principal) {
        Long userId = 1L;
        byte[] csvBytes = reportService.exportCsvTransactions(userId, startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=FinWise_Transactions.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
