package com.tripnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // Profile info
    private String bio;
    private String phone;
    private String city;
    private String country;
    private String profilePicture;

    // Travel preferences
    @ElementCollection
    @CollectionTable(name = "travel_preferences",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "preference")
    private List<String> travelPreferences;

    // Favorite destinations
    @ElementCollection
    @CollectionTable(name = "favorite_destinations",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "destination")
    private List<String> favoriteDestinations;

    // Travel style
    @Enumerated(EnumType.STRING)
    private TravelStyle travelStyle;

    // Budget range
    @Enumerated(EnumType.STRING)
    private BudgetRange budgetRange;

    public enum TravelStyle {
        ADVENTURE, LUXURY, BUDGET,
        BACKPACKER, FAMILY, SOLO, COUPLE
    }

    public enum BudgetRange {
        BUDGET,      // Under 10k
        MODERATE,    // 10k-30k
        COMFORTABLE, // 30k-60k
        LUXURY       // 60k+
    }
}