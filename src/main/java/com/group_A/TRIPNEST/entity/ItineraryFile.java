package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "itinerary_files")
@Getter @Setter @NoArgsConstructor
public class ItineraryFile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "itinerary_id") private Itinerary itinerary;
    @ManyToOne(optional = false) @JoinColumn(name = "uploaded_by_id") private User uploadedBy;
    @Column(nullable = false) private String fileName;
    @Column(nullable = false, length = 2000) private String fileUrl;
    private String contentType;
    private Long sizeInBytes;
    @Column(columnDefinition = "datetime") private LocalDateTime uploadedAt;
}
