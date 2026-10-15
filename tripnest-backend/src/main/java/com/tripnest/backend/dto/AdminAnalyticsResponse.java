package com.tripnest.backend.dto;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class AdminAnalyticsResponse {

    // User stats
    private Long totalUsers;
    private Long activeUsers;
    private Map<String, Long> usersByRole;
    private Map<String, Long> newUsersByMonth;

    // Trip stats
    private Long totalTrips;
    private Long totalItineraries;
    private Long totalActivities;
    private Map<String, Long> tripsByStatus;

    // Expense stats
    private Double totalExpensesOnPlatform;
    private Map<String, Double> expensesByCategory;

    // Destination stats
    private List<String> popularDestinations;
    private Map<String, Long> tripsByDestination;

    // Group stats
    private Long totalGroups;
    private Long totalGroupMembers;

    // Document stats
    private Long totalDocuments;
    private Long totalPhotos;

    // Notification stats
    private Long totalNotifications;
    private Long unreadNotifications;
}