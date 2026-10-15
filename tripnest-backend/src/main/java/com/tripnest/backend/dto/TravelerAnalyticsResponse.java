package com.tripnest.backend.dto;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class TravelerAnalyticsResponse {

    // Trip overview
    private Long totalTrips;
    private Long plannedTrips;
    private Long upcomingTrips;
    private Long ongoingTrips;
    private Long completedTrips;
    private Long cancelledTrips;

    // Budget overview
    private Double totalBudgetAllocated;
    private Double totalAmountSpent;
    private Double totalAmountRemaining;
    private Double averageBudgetPerTrip;

    // Expense overview
    private Double totalExpenses;
    private Map<String, Double> expensesByCategory;

    // Destination overview
    private List<String> topDestinations;
    private Long totalDestinationsVisited;

    // Activity overview
    private Long totalActivities;
    private Map<String, Long> activitiesByType;

    // Group overview
    private Long totalGroups;
    private Long groupsCreated;
    private Long groupsJoined;

    // Document overview
    private Long totalDocuments;
    private Long totalPhotos;

    // Monthly trips
    private Map<String, Long> tripsByMonth;
}