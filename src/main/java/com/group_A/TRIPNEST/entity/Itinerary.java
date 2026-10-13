package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "itineraries")
@Getter @Setter @NoArgsConstructor
public class Itinerary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @Column(nullable = false) private LocalDate itineraryDate;
    private Integer dayNumber;
    @Column(length = 2000) private String notes;
}
