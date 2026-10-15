package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinationRepository
        extends JpaRepository<Destination, Long> {
    List<Destination> findByIsPopular(Boolean isPopular);
    List<Destination> findByNameContainingIgnoreCase(String name);
}