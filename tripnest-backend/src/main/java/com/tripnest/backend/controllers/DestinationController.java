package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.DestinationResponse;
import com.tripnest.backend.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    // GET /api/destinations
    @GetMapping
    public ResponseEntity<List<DestinationResponse>> getAllDestinations() {
        return ResponseEntity.ok(
                destinationService.getAllDestinations());
    }

    // GET /api/destinations/popular
    // ✅ /popular pehle — /{id} se upar
    @GetMapping("/popular")
    public ResponseEntity<List<DestinationResponse>> getPopular() {
        return ResponseEntity.ok(
                destinationService.getPopularDestinations());
    }

    // GET /api/destinations/search?query=goa
    // ✅ /search pehle — /{id} se upar
    @GetMapping("/search")
    public ResponseEntity<List<DestinationResponse>> search(
            @RequestParam String query) {
        return ResponseEntity.ok(
                destinationService.searchDestinations(query));
    }

    // GET /api/destinations/{id}
    // ✅ /{id} LAST mein
    @GetMapping("/{id}")
    public ResponseEntity<DestinationResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                destinationService.getDestinationById(id));
    }
}