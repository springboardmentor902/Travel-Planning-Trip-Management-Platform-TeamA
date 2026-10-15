package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Budget;
import lombok.Data;

@Data
public class BudgetResponse {

    private Long id;
    private Double totalAmount;
    private String currency;
    private Double transportationBudget;
    private Double hotelBudget;
    private Double foodBudget;
    private Double shoppingBudget;
    private Double entertainmentBudget;
    private Double miscBudget;
    private Long tripId;
    private String tripTitle;

    // Summary fields
    private Double totalSpent;
    private Double remainingBudget;
    private Double spentPercentage;

    public static BudgetResponse fromEntity(Budget b) {
        BudgetResponse res = new BudgetResponse();
        res.setId(b.getId());
        res.setTotalAmount(b.getTotalAmount());
        res.setCurrency(b.getCurrency());
        res.setTransportationBudget(b.getTransportationBudget());
        res.setHotelBudget(b.getHotelBudget());
        res.setFoodBudget(b.getFoodBudget());
        res.setShoppingBudget(b.getShoppingBudget());
        res.setEntertainmentBudget(b.getEntertainmentBudget());
        res.setMiscBudget(b.getMiscBudget());
        res.setTripId(b.getTrip().getId());
        res.setTripTitle(b.getTrip().getTitle());
        return res;
    }
}