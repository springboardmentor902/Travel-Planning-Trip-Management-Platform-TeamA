package com.tripnest.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BudgetRequest {

    @NotNull(message = "Total amount required")
    private Double totalAmount;

    private String currency = "INR";

    // Category wise budget
    private Double transportationBudget;
    private Double hotelBudget;
    private Double foodBudget;
    private Double shoppingBudget;
    private Double entertainmentBudget;
    private Double miscBudget;
}