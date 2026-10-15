package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository
        extends JpaRepository<Group, Long> {

    List<Group> findByCreatedById(Long userId);
    List<Group> findByTripId(Long tripId);

    // ✅ Trip ka group find karo
    Optional<Group> findFirstByTripId(Long tripId);
}