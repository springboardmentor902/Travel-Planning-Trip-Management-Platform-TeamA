package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "author_id") private User author;
    @ManyToOne(optional = false) @JoinColumn(name = "destination_id") private Destination destination;
    @Column(nullable = false) private Integer rating;
    @Column(length = 3000) private String comment;
    @Column(columnDefinition = "datetime") private LocalDateTime createdAt;
}
