package com.tripnest.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ReportResponse {

    private Long tripId;
    private String tripTitle;
    private String destination;

    // Budget vs Actual per category
    private List<CategoryReport> categoryReports;

    // Summary
    private Double totalBudget;
    private Double totalSpent;
    private Double totalRemaining;
    private Double spentPercentage;

    // Trends
    private Map<String, Double> weeklySpending;
    private Map<String, Double> dailySpending;

    // Top expenses
    private List<ExpenseItem> topExpenses;

    // Shared vs Personal
    private Double sharedTotal;
    private Double personalTotal;

    @Data
    public static class CategoryReport {
        private String category;
        private Double budgeted;
        private Double actual;
        private Double remaining;
        private Double usagePercentage;
        private String status; // UNDER, NEAR, OVER
    }

    @Data
    public static class ExpenseItem {
        private String description;
        private Double amount;
        private String category;
        private String date;
        private String paidBy;
    }
}