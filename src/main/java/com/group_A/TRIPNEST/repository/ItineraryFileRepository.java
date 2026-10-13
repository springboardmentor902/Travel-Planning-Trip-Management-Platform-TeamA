package com.group_A.TRIPNEST.repository;

import com.group_A.TRIPNEST.entity.ItineraryFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryFileRepository extends JpaRepository<ItineraryFile, Long> {
    List<ItineraryFile> findByItineraryId(Long itineraryId);
}
