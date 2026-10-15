package com.tripnest.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ItineraryRequest {

    @NotNull(message = "Day number required")
    private Integer dayNumber;

    @NotNull(message = "Date required")
    private LocalDate date;

    private String notes;
}