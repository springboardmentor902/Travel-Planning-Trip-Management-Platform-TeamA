package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {

    @NotBlank(message = "Message required")
    private String message;

    @NotNull(message = "Type required")
    private Notification.NotificationType notificationType;
}