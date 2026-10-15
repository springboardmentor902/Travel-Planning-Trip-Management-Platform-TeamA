package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Activity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ActivityRequest {

    @NotBlank(message = "Title required")
    private String title;

    @NotNull(message = "Activity type required")
    private Activity.ActivityType activityType;

    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String notes;
    private Double estimatedCost;
}