package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne @JoinColumn(name = "category_id") private Category category;
    @ManyToOne(optional = false) @JoinColumn(name = "paid_by_id") private User paidBy;
    @Column(nullable = false) private String description;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(nullable = false, length = 3) private String currency;
    private LocalDate expenseDate;
    private boolean shared;
}
