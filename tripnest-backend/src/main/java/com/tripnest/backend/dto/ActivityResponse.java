package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Activity;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ActivityResponse {

    private Long id;
    private String title;
    private Activity.ActivityType activityType;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String notes;
    private Double estimatedCost;
    private Long itineraryId;
    private Integer dayNumber;

    public static ActivityResponse fromEntity(Activity activity) {
        ActivityResponse res = new ActivityResponse();
        res.setId(activity.getId());
        res.setTitle(activity.getTitle());
        res.setActivityType(activity.getActivityType());
        res.setStartTime(activity.getStartTime());
        res.setEndTime(activity.getEndTime());
        res.setLocation(activity.getLocation());
        res.setNotes(activity.getNotes());
        res.setEstimatedCost(activity.getEstimatedCost());
        res.setItineraryId(activity.getItinerary().getId());
        res.setDayNumber(activity.getItinerary().getDayNumber());
        return res;
    }
}