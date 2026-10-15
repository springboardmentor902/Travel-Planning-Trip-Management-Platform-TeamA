package com.tripnest.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    private ExpenseCategory category;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    @Column(name = "receipt_url")
    private String receiptUrl;

    // ✅ New fields
    @Builder.Default
    @Column(name = "is_shared")
    private Boolean isShared = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_type")
    private SplitType splitType;

    @Builder.Default
    @OneToMany(mappedBy = "expense",
               cascade = CascadeType.ALL,
               fetch = FetchType.LAZY,
               orphanRemoval = true)
    private List<ExpenseSplit> splits = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by")
    private User paidBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ExpenseCategory {
        TRANSPORTATION, HOTEL, FOOD,
        SHOPPING, ENTERTAINMENT, MISCELLANEOUS
    }

    public enum SplitType {
        EQUAL, CUSTOM
    }
}