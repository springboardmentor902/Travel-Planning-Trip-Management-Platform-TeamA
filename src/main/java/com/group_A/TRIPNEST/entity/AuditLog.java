package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "actor_id") private User actor;
    @Column(nullable = false) private String action;
    private String entityType;
    private Long entityId;
    @Column(length = 5000) private String details;
    @Column(columnDefinition = "datetime") private LocalDateTime createdAt;
}
