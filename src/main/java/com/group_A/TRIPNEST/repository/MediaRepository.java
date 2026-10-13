package com.group_A.TRIPNEST.repository;

import com.group_A.TRIPNEST.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByTripId(Long tripId);
}
