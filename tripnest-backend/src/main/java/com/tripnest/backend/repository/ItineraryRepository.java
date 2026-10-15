package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryRepository
        extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByTripId(Long tripId);
    void deleteByTripId(Long tripId);
}