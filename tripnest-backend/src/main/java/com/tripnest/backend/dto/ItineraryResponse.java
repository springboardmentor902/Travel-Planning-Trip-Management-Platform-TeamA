package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Itinerary;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ItineraryResponse {

    private Long id;
    private Integer dayNumber;
    private LocalDate date;
    private String notes;
    private Long tripId;
    private String tripTitle;
    private List<ActivityResponse> activities;

    public static ItineraryResponse fromEntity(Itinerary itinerary) {
        ItineraryResponse res = new ItineraryResponse();
        res.setId(itinerary.getId());
        res.setDayNumber(itinerary.getDayNumber());
        res.setDate(itinerary.getDate());
        res.setNotes(itinerary.getNotes());
        res.setTripId(itinerary.getTrip().getId());
        res.setTripTitle(itinerary.getTrip().getTitle());
        return res;
    }
}