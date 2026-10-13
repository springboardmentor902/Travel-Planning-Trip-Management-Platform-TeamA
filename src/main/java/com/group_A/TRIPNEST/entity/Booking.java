package com.group_A.TRIPNEST.entity;

import com.group_A.TRIPNEST.entity.enums.BookingStatus;
import com.group_A.TRIPNEST.entity.enums.BookingType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(optional = false) @JoinColumn(name = "booked_by_id") private User bookedBy;
    @Enumerated(EnumType.STRING) private BookingType type;
    @Column(nullable = false) private String provider;
    private String confirmationNumber;
    @Column(columnDefinition = "datetime") private LocalDateTime startTime;
    @Column(columnDefinition = "datetime") private LocalDateTime endTime;
    @Column(precision = 14, scale = 2) private BigDecimal amount;
    private String currency;
    @Enumerated(EnumType.STRING) private BookingStatus status = BookingStatus.PENDING;
}
