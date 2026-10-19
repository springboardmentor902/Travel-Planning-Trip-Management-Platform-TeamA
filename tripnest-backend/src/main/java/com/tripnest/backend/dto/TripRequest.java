package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Trip;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TripRequest {

    @NotBlank(message = "Title required")
    private String title;

    @NotBlank(message = "Destination required")
    private String destination;

    @NotNull(message = "Start date required")
    private LocalDate startDate;

    @NotNull(message = "End date required")
    private LocalDate endDate;

    @PositiveOrZero(message = "Budget cannot be negative")
    private Double totalBudget;

    @Positive(message = "Travelers must be at least 1")
    private Integer travelers;
    private String description;
    private String coverImage;
    private Trip.TripStatus status = Trip.TripStatus.PLANNING;
}