package com.tripnest.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminDashboardResponse {

    // Platform overview
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long totalTrips;
    private Long totalExpenses;
    private Long totalGroups;
    private Long totalDocuments;
    private Long totalActivities;

    // User analytics
    private Map<String, Long> usersByRole;
    private Map<String, Long> monthlySignups;

    // Trip analytics
    private Map<String, Long> tripsByStatus;
    private Map<String, Long> monthlyTripCount;
    private Double averageTripDays;

    // Destination analytics
    private List<DestinationTrend> popularDestinations;
    private Map<String, Long> destinationTrends;

    // Expense analytics
    private Double totalPlatformSpending;
    private Map<String, Double> platformExpensesByCategory;
    private Map<String, Double> monthlyPlatformSpending;

    // Chart data
    private Map<String, Long> userGrowth;
    private Map<String, Long> tripGrowth;

    @Data
    public static class DestinationTrend {
        private String destination;
        private Long tripCount;
        private Double percentage;
    }
}