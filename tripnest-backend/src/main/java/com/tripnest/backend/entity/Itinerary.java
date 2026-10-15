package com.tripnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "itineraries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // YE FIX KIYA
    @Column(name = "itinerary_date", nullable = false)
    private LocalDate date;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @OneToMany(mappedBy = "itinerary",
               cascade = CascadeType.ALL,
               fetch = FetchType.LAZY)
    private java.util.List<Activity> activities;
}