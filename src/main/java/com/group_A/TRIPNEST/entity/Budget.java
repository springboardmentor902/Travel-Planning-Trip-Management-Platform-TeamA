package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Getter @Setter @NoArgsConstructor
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(optional = false) @JoinColumn(name = "trip_id", unique = true) private Trip trip;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal totalAmount;
    @Column(precision = 14, scale = 2) private BigDecimal spentAmount = BigDecimal.ZERO;
    @Column(nullable = false, length = 3) private String currency;
}
