package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.ActivityRequest;
import com.tripnest.backend.dto.ActivityResponse;
import com.tripnest.backend.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // POST /api/itineraries/{id}/activities — Activity add karo
    @PostMapping("/itineraries/{itineraryId}/activities")
    public ResponseEntity<ActivityResponse> createActivity(
            @PathVariable Long itineraryId,
            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.ok(
                activityService.createActivity(itineraryId, request));
    }

    // GET /api/itineraries/{id}/activities — Saari activities
    @GetMapping("/itineraries/{itineraryId}/activities")
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @PathVariable Long itineraryId) {
        return ResponseEntity.ok(
                activityService.getActivitiesByItinerary(itineraryId));
    }

    // GET /api/activities/{id} — Ek activity
    @GetMapping("/activities/{id}")
    public ResponseEntity<ActivityResponse> getActivity(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                activityService.getActivityById(id));
    }

    // PUT /api/activities/{id} — Update karo
    @PutMapping("/activities/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.ok(
                activityService.updateActivity(id, request));
    }

    // DELETE /api/activities/{id} — Delete karo
    @DeleteMapping("/activities/{id}")
    public ResponseEntity<String> deleteActivity(
            @PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.ok("Activity deleted successfully");
    }

    // GET /api/itineraries/{id}/activities/total-cost
    @GetMapping("/itineraries/{itineraryId}/activities/total-cost")
    public ResponseEntity<Double> getTotalCost(
            @PathVariable Long itineraryId) {
        return ResponseEntity.ok(
                activityService.getTotalCostByItinerary(itineraryId));
    }
}