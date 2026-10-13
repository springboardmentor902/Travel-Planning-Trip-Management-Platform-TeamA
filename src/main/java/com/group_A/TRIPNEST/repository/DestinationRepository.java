package com.group_A.TRIPNEST.repository;

import com.group_A.TRIPNEST.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByCountryIgnoreCase(String country);
}
