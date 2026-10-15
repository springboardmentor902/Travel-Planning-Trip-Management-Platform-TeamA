package com.tripnest.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ExpenseReportResponse {

    private Long tripId;
    private String tripTitle;
    private String destination;

    // Summary
    private Double totalBudget;
    private Double totalSpent;
    private Double totalRemaining;
    private Double spentPercentage;

    // Category breakdown
    private Map<String, Double> categoryBreakdown;
    private Map<String, Long> categoryCount;

    // Top expenses
    private List<ExpenseItem> topExpenses;

    // Daily spending
    private Map<String, Double> dailySpending;

    // Shared vs personal
    private Double sharedExpensesTotal;
    private Double personalExpensesTotal;

    @Data
    public static class ExpenseItem {
        private String description;
        private Double amount;
        private String category;
        private String date;
        private String paidBy;
    }
}