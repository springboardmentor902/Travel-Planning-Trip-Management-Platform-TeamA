package com.group_A.TRIPNEST.entity;

import com.group_A.TRIPNEST.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(optional = false) @JoinColumn(name = "payer_id") private User payer;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(nullable = false, length = 3) private String currency;
    @Column(nullable = false) private String method;
    private String transactionReference;
    @Enumerated(EnumType.STRING) private PaymentStatus status = PaymentStatus.PENDING;
    @Column(columnDefinition = "datetime") private LocalDateTime paidAt;
}
