package com.group_A.TRIPNEST.entity;

import com.group_A.TRIPNEST.entity.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "media")
@Getter @Setter @NoArgsConstructor
public class Media {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(optional = false) @JoinColumn(name = "uploaded_by_id") private User uploadedBy;
    @Enumerated(EnumType.STRING) private MediaType type;
    @Column(nullable = false) private String fileName;
    @Column(nullable = false, length = 2000) private String fileUrl;
    @Column(columnDefinition = "datetime") private LocalDateTime uploadedAt;
}
