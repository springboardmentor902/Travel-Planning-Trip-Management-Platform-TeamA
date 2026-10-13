package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destinations")
@Getter @Setter @NoArgsConstructor
public class Destination {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    private String city;
    private String country;
    @Column(length = 3000) private String description;
    private Double latitude;
    private Double longitude;
}
