// RegisterRequest.java
package com.tripnest.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // TRAVELER, GROUP_ADMIN, ADMIN
}