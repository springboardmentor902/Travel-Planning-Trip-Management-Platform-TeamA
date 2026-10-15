package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.AdminDashboardResponse;
import com.tripnest.backend.dto.DashboardResponse;
import com.tripnest.backend.dto.ReportResponse;
import com.tripnest.backend.service.AdminDashboardService;
import com.tripnest.backend.service.DashboardService;
import com.tripnest.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AdminDashboardService adminDashboardService;
    private final ReportService reportService;

    // ✅ Traveler dashboard — single API
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse>
            getTravelerDashboard() {
        return ResponseEntity.ok(
                dashboardService.getTravelerDashboard());
    }

    // ✅ Admin dashboard — Admin only
    @GetMapping("/admin/dashboard")
    public ResponseEntity<AdminDashboardResponse>
            getAdminDashboard() {
        return ResponseEntity.ok(
                adminDashboardService.getAdminDashboard());
    }

    // ✅ Trip report
    @GetMapping("/reports/trips/{tripId}")
    public ResponseEntity<ReportResponse>
            getTripReport(@PathVariable Long tripId) {
        return ResponseEntity.ok(
                reportService.getTripReport(tripId));
    }
}