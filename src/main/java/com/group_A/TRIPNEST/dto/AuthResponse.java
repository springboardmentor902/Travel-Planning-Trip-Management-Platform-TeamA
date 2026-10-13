package com.group_A.TRIPNEST.dto;

public record AuthResponse(
        boolean success,
        String message,
        String email,
        String token,
        String tokenType,
        long expiresIn
) {}
