package com.tripnest.backend.dto;

import lombok.Data;

@Data
public class SplitMemberRequest {
    private Long userId;
    private Double customAmount; // CUSTOM split ke liye
}