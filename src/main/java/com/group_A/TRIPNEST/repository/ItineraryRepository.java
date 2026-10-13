package com.group_A.TRIPNEST.repository;

import com.group_A.TRIPNEST.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByTripIdOrderByItineraryDateAsc(Long tripId);
}
