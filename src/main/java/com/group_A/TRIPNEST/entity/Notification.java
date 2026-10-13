package com.group_A.TRIPNEST.entity;

import com.group_A.TRIPNEST.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "recipient_id") private User recipient;
    @Enumerated(EnumType.STRING) private NotificationType type;
    @Column(nullable = false) private String title;
    @Column(nullable = false, length = 3000) private String message;
    @Column(name = "is_read") private boolean read;
    @Column(columnDefinition = "datetime") private LocalDateTime createdAt;
}
