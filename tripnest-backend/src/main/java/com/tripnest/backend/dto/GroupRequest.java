package com.tripnest.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GroupRequest {

    @NotBlank(message = "Group name required")
    private String name;

    private String description;
    private Long tripId;
}