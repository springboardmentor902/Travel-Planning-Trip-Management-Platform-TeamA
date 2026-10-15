package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.NotificationRequest;
import com.tripnest.backend.dto.NotificationResponse;
import com.tripnest.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications — Saari notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponse>>
            getAll() {
        return ResponseEntity.ok(
                notificationService.getMyNotifications());
    }

    // GET /api/notifications/unread — Unread only
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>>
            getUnread() {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications());
    }

    // GET /api/notifications/count — Unread count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // PATCH /api/notifications/{id}/read — Mark read
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id));
    }

    // PATCH /api/notifications/read-all — Saari read
    @PatchMapping("/read-all")
    public ResponseEntity<String> markAllRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok("All marked as read");
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Deleted");
    }

    // POST /api/notifications — Manual create
    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(
                notificationService
                        .createManualNotification(request));
    }
}