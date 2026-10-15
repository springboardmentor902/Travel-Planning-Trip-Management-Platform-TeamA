package com.tripnest.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardResponse {

    // User info
    private String userName;
    private String userEmail;
    private String userRole;

    // Trip summary
    private Long totalTrips;
    private Long upcomingTrips;
    private Long ongoingTrips;
    private Long completedTrips;
    private List<TripSummary> upcomingTripList;

    // Budget summary
    private Double totalBudget;
    private Double totalSpent;
    private Double totalRemaining;
    private Double spentPercentage;

    // Expense summary
    private Map<String, Double> expensesByCategory;
    private List<RecentExpense> recentExpenses;

    // Travel stats
    private Long totalActivities;
    private Long totalGroups;
    private Long totalDocuments;

    // Favorite destinations
    private List<DestinationStat> favoriteDestinations;

    // Chart data
    private Map<String, Double> monthlySpending;
    private Map<String, Long> tripsByMonth;
    private Map<String, Double> budgetVsActual;

    // ── Nested classes ──

    @Data
    public static class TripSummary {
        private Long id;
        private String title;
        private String destination;
        private String startDate;
        private String endDate;
        private String status;
        private Integer totalDays;
        private Double budget;
        private Double spent;
    }

    @Data
    public static class RecentExpense {
        private String description;
        private Double amount;
        private String category;
        private String date;
    }

    @Data
    public static class DestinationStat {
        private String destination;
        private Long tripCount;
    }
}