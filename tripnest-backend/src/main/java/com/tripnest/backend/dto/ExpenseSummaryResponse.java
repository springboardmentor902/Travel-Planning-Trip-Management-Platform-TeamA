package com.tripnest.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ExpenseSummaryResponse {

    private Long tripId;
    private String tripTitle;
    private Double totalSpent;
    private Double totalBudget;
    private Double remainingBudget;
    private Double spentPercentage;

    // Category wise total
    private Map<String, Double> categoryBreakdown;

    // Category wise count
    private Map<String, Long> categoryCount;
}