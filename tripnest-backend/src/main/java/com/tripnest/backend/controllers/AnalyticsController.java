package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.AdminAnalyticsResponse;
import com.tripnest.backend.dto.ExpenseReportResponse;
import com.tripnest.backend.dto.TravelerAnalyticsResponse;
import com.tripnest.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // GET /api/analytics/overview
    // Traveler ka poora overview
    @GetMapping("/overview")
    public ResponseEntity<TravelerAnalyticsResponse>
            getOverview() {
        return ResponseEntity.ok(
                analyticsService.getTravelerAnalytics());
    }

    // GET /api/analytics/trips/{tripId}/report
    // Ek trip ka expense report
    @GetMapping("/trips/{tripId}/report")
    public ResponseEntity<ExpenseReportResponse>
            getExpenseReport(@PathVariable Long tripId) {
        return ResponseEntity.ok(
                analyticsService.getExpenseReport(tripId));
    }

    // GET /api/analytics/admin
    // Admin only — platform wide stats
    @GetMapping("/admin")
    public ResponseEntity<AdminAnalyticsResponse>
            getAdminAnalytics() {
        return ResponseEntity.ok(
                analyticsService.getAdminAnalytics());
    }
}