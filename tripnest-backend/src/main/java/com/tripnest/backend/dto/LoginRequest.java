// LoginRequest.java
package com.tripnest.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}