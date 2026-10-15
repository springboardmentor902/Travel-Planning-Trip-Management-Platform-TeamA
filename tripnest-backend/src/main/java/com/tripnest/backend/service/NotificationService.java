package com.tripnest.backend.service;

import com.tripnest.backend.dto.NotificationRequest;
import com.tripnest.backend.dto.NotificationResponse;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.NotificationRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ============================================================
    // HELPERS
    // ============================================================

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ============================================================
    // CREATE NOTIFICATION
    // ============================================================

    // ✅ Full method — referenceId + referenceType ke saath
    public void createNotification(
            User user,
            String message,
            Notification.NotificationType type,
            Long referenceId,
            Notification.ReferenceType referenceType) {

        Notification notification = Notification.builder()
                .message(message)
                .notificationType(type)
                .isRead(false)
                .user(user)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();

        notificationRepository.save(notification);
        log.info("Notification → {}: {}",
                user.getEmail(), message);
    }

    // ✅ Backward compatible — bina referenceId ke
    public void createNotification(
            User user,
            String message,
            Notification.NotificationType type) {
        createNotification(user, message, type, null, null);
    }

    // ============================================================
    // GET NOTIFICATIONS
    // ============================================================

    public List<NotificationResponse> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications() {
        User user = getCurrentUser();
        return notificationRepository
                .findByUserIdAndIsReadOrderByCreatedAtDesc(
                        user.getId(), false)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository
                .countByUserIdAndIsRead(user.getId(), false);
    }

    // ============================================================
    // MARK READ
    // ============================================================

    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found"));

        User user = getCurrentUser();
        if (!notification.getUser().getId()
                .equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notification.setIsRead(true);
        return NotificationResponse.fromEntity(
                notificationRepository.save(notification));
    }

    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadOrderByCreatedAtDesc(
                        user.getId(), false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    // ============================================================
    // DELETE
    // ============================================================

    public void deleteNotification(Long id) {
        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found"));

        User user = getCurrentUser();
        if (!notification.getUser().getId()
                .equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notificationRepository.delete(notification);
    }

    // ============================================================
    // MANUAL CREATE
    // ============================================================

    public NotificationResponse createManualNotification(
            NotificationRequest request) {
        User user = getCurrentUser();
        Notification notification = Notification.builder()
                .message(request.getMessage())
                .notificationType(request.getNotificationType())
                .isRead(false)
                .user(user)
                .build();
        return NotificationResponse.fromEntity(
                notificationRepository.save(notification));
    }
}