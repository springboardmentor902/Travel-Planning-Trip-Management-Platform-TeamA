package com.tripnest.backend.dto;

import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.UserProfile;
import lombok.Data;

import java.util.List;

@Data
public class ProfileResponse {

    // User info
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String createdAt;

    // Profile info
    private String bio;
    private String phone;
    private String city;
    private String country;
    private String profilePicture;

    // Travel
    private List<String> travelPreferences;
    private List<String> favoriteDestinations;
    private String travelStyle;
    private String budgetRange;

    // Stats
    private Long totalTrips;
    private Long completedTrips;
    private Long totalGroups;

    public static ProfileResponse fromEntities(
            User user,
            UserProfile profile,
            Long totalTrips,
            Long completedTrips,
            Long totalGroups) {

        ProfileResponse res = new ProfileResponse();
        res.setUserId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole()
                .getRoleName().name());
        res.setCreatedAt(user.getCreatedAt() != null
                ? user.getCreatedAt().toString() : "");

        if (profile != null) {
            res.setBio(profile.getBio());
            res.setPhone(profile.getPhone());
            res.setCity(profile.getCity());
            res.setCountry(profile.getCountry());
            res.setProfilePicture(
                    profile.getProfilePicture());
            res.setTravelPreferences(
                    profile.getTravelPreferences());
            res.setFavoriteDestinations(
                    profile.getFavoriteDestinations());
            res.setTravelStyle(
                    profile.getTravelStyle() != null
                    ? profile.getTravelStyle().name()
                    : null);
            res.setBudgetRange(
                    profile.getBudgetRange() != null
                    ? profile.getBudgetRange().name()
                    : null);
        }

        res.setTotalTrips(totalTrips);
        res.setCompletedTrips(completedTrips);
        res.setTotalGroups(totalGroups);

        return res;
    }
}