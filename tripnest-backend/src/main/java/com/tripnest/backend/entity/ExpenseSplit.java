package com.tripnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expense_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Kitna dena hai is member ko
    @Column(name = "share_amount", nullable = false)
    private Double shareAmount;

    // Kitna diya (usually 0 unless they also paid)
    @Builder.Default
    @Column(name = "paid_amount")
    private Double paidAmount = 0.0;

    @Builder.Default
    @Column(name = "is_settled")
    private Boolean isSettled = false;
}