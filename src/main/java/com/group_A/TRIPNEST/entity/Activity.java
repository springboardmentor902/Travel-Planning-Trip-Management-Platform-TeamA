package com.group_A.TRIPNEST.entity;

import com.group_A.TRIPNEST.entity.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Getter @Setter @NoArgsConstructor
public class Activity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "itinerary_id") private Itinerary itinerary;
    @ManyToOne @JoinColumn(name = "destination_id") private Destination destination;
    @Column(nullable = false) private String title;
    @Enumerated(EnumType.STRING) private ActivityType type;
    private String location;
    @Column(columnDefinition = "datetime") private LocalDateTime startTime;
    @Column(columnDefinition = "datetime") private LocalDateTime endTime;
    private BigDecimal estimatedCost;
    @Column(length = 2000) private String notes;
}
