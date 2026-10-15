package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.ItineraryRequest;
import com.tripnest.backend.dto.ItineraryResponse;
import com.tripnest.backend.service.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    // POST /api/trips/{tripId}/itineraries — Day banao
    @PostMapping("/trips/{tripId}/itineraries")
    public ResponseEntity<ItineraryResponse> createItinerary(
            @PathVariable Long tripId,
            @Valid @RequestBody ItineraryRequest request) {
        return ResponseEntity.ok(
                itineraryService.createItinerary(tripId, request));
    }

    // GET /api/trips/{tripId}/itineraries — Saare days
    @GetMapping("/trips/{tripId}/itineraries")
    public ResponseEntity<List<ItineraryResponse>> getItineraries(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                itineraryService.getItinerariesByTrip(tripId));
    }

    // GET /api/itineraries/{id} — Ek day detail
    @GetMapping("/itineraries/{id}")
    public ResponseEntity<ItineraryResponse> getItinerary(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                itineraryService.getItineraryById(id));
    }

    // PUT /api/itineraries/{id} — Update karo
    @PutMapping("/itineraries/{id}")
    public ResponseEntity<ItineraryResponse> updateItinerary(
            @PathVariable Long id,
            @Valid @RequestBody ItineraryRequest request) {
        return ResponseEntity.ok(
                itineraryService.updateItinerary(id, request));
    }

    // DELETE /api/itineraries/{id} — Delete karo
    @DeleteMapping("/itineraries/{id}")
    public ResponseEntity<String> deleteItinerary(
            @PathVariable Long id) {
        itineraryService.deleteItinerary(id);
        return ResponseEntity.ok("Day deleted successfully");
    }

    // POST /api/trips/{tripId}/itineraries/generate
    // Automatically saare days banao
    @PostMapping("/trips/{tripId}/itineraries/generate")
    public ResponseEntity<List<ItineraryResponse>> generateDays(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                itineraryService.generateDays(tripId));
    }
}