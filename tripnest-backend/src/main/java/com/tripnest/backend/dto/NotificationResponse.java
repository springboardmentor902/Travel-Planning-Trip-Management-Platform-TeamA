package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {

    private Long id;
    private String message;
    private Notification.NotificationType notificationType;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // ✅ Navigation fields
    private Long referenceId;
    private Notification.ReferenceType referenceType;

    // ✅ Frontend redirect URL
    private String redirectUrl;

    public static NotificationResponse fromEntity(
            Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setMessage(n.getMessage());
        res.setNotificationType(n.getNotificationType());
        res.setIsRead(n.getIsRead());
        res.setCreatedAt(n.getCreatedAt());
        res.setReferenceId(n.getReferenceId());
        res.setReferenceType(n.getReferenceType());

        // ✅ Auto redirect URL generate karo
        res.setRedirectUrl(
                buildRedirectUrl(
                        n.getReferenceType(),
                        n.getReferenceId()));

        return res;
    }

    private static String buildRedirectUrl(
            Notification.ReferenceType type,
            Long referenceId) {

        if (type == null || referenceId == null) return null;

        return switch (type) {
            case TRIP      -> "/trips/" + referenceId;
            case GROUP     -> "/groups/" + referenceId;
            case ACTIVITY  -> "/trips/" + referenceId;
            case EXPENSE   -> "/trips/" + referenceId;
            case ITINERARY -> "/trips/" + referenceId;
        };
    }
}