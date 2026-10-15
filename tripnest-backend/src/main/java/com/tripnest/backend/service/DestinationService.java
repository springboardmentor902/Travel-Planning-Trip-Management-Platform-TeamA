package com.tripnest.backend.service;

import com.tripnest.backend.dto.DestinationResponse;
import com.tripnest.backend.entity.Destination;
import com.tripnest.backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    // Saari destinations
    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll()
                .stream()
                .map(DestinationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Ek destination detail
    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Destination not found"));
        return DestinationResponse.fromEntity(destination);
    }

    // Popular destinations
    public List<DestinationResponse> getPopularDestinations() {
        return destinationRepository.findByIsPopular(true)
                .stream()
                .map(DestinationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Search destinations
    public List<DestinationResponse> searchDestinations(String query) {
    if (query == null || query.trim().isEmpty()) {
        return getAllDestinations();
    }

    String q = query.toLowerCase().trim();

    return destinationRepository.findAll()
            .stream()
            .filter(d ->
                d.getName().toLowerCase().contains(q) ||
                d.getCountry().toLowerCase().contains(q) ||
                (d.getDescription() != null &&
                    d.getDescription().toLowerCase().contains(q))
            )
            .map(DestinationResponse::fromEntity)
            .collect(Collectors.toList());
}
}