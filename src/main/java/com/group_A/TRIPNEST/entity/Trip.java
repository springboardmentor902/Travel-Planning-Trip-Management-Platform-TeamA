package com.group_A.TRIPNEST.entity;

import com.group_A.TRIPNEST.entity.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "trips")
@Getter @Setter @NoArgsConstructor
public class Trip {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @ManyToOne(optional = false) @JoinColumn(name = "owner_id") private User owner;
    @ManyToOne @JoinColumn(name = "destination_id") private Destination destination;
    @ManyToOne @JoinColumn(name = "group_id") private TravelGroup travelGroup;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer travelerCount;
    private BigDecimal budgetAmount;
    private String currency;
    @Enumerated(EnumType.STRING) private TripStatus status = TripStatus.PLANNING;
}
