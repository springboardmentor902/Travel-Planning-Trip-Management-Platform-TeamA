package com.tripnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String currency;

    @Column(name = "transportation_budget")
    private Double transportationBudget;

    @Column(name = "hotel_budget")
    private Double hotelBudget;

    @Column(name = "food_budget")
    private Double foodBudget;

    @Column(name = "shopping_budget")
    private Double shoppingBudget;

    @Column(name = "entertainment_budget")
    private Double entertainmentBudget;

    @Column(name = "misc_budget")
    private Double miscBudget;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", unique = true)
    private Trip trip;
}