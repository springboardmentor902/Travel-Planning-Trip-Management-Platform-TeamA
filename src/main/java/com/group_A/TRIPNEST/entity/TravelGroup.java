package com.group_A.TRIPNEST.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "travel_groups")
@Getter @Setter @NoArgsConstructor
public class TravelGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(length = 1000) private String description;
    @ManyToOne(optional = false) @JoinColumn(name = "created_by_id") private User createdBy;
    @ManyToMany
    @JoinTable(name = "travel_group_members", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> members = new HashSet<>();
}
