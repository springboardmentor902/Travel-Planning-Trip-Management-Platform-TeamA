package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Saari notifications — newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Read/unread notifications — newest first
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(
            Long userId,
            boolean isRead
    );

    // Unread/read count
    long countByUserIdAndIsRead(
            Long userId,
            boolean isRead
    );
}