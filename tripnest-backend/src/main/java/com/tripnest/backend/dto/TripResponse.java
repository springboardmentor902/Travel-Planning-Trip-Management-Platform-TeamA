package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Trip;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TripResponse {

    private Long id;
    private String title;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalBudget;
    private Integer travelers;
    private String description;
    private String coverImage;
    private Trip.TripStatus status;
    private String ownerEmail;      // ✅
    private String ownerName;       // ✅
    private LocalDateTime createdAt;
    private int totalDays;
    private boolean isOwner;        // ✅ Current user owner hai?
    private int memberCount;        // ✅

    public static TripResponse fromEntity(Trip trip) {
        TripResponse res = new TripResponse();
        res.setId(trip.getId());
        res.setTitle(trip.getTitle());
        res.setDestination(trip.getDestination());
        res.setStartDate(trip.getStartDate());
        res.setEndDate(trip.getEndDate());
        res.setTotalBudget(trip.getTotalBudget());
        res.setTravelers(trip.getTravelers());
        res.setDescription(trip.getDescription());
        res.setCoverImage(trip.getCoverImage());
        res.setStatus(trip.getStatus());
        res.setCreatedAt(trip.getCreatedAt());
        res.setOwnerEmail(trip.getUser().getEmail());
        res.setOwnerName(trip.getUser().getName());

        if (trip.getStartDate() != null
                && trip.getEndDate() != null) {
            res.setTotalDays(
                    (int)(trip.getStartDate()
                            .until(trip.getEndDate())
                            .getDays() + 1));
        }

        return res;
    }
}