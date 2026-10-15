package com.tripnest.backend.dto;

import com.tripnest.backend.entity.UserProfile;
import lombok.Data;

import java.util.List;

@Data
public class ProfileRequest {

    // Basic
    private String name;
    private String bio;
    private String phone;
    private String city;
    private String country;
    private String profilePicture;

    // Travel
    private List<String> travelPreferences;
    private List<String> favoriteDestinations;
    private UserProfile.TravelStyle travelStyle;
    private UserProfile.BudgetRange budgetRange;
}