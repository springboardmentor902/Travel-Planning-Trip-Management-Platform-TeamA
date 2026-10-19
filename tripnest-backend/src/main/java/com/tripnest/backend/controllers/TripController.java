package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.GroupMemberResponse;
import com.tripnest.backend.dto.TripRequest;
import com.tripnest.backend.dto.TripResponse;
import com.tripnest.backend.entity.GroupMember;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final UserRepository userRepository;

    // ============================================================
    // CRUD
    // ============================================================

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(
                tripService.createTrip(request));
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getMyTrips() {
        return ResponseEntity.ok(
                tripService.getMyTrips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                tripService.getTripById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(
                tripService.updateTrip(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrip(
            @PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok(
                "Trip deleted successfully");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TripResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Trip.TripStatus status) {
        return ResponseEntity.ok(
                tripService.updateTripStatus(id, status));
    }

    // ============================================================
    // MEMBER MANAGEMENT
    // ============================================================

    // ✅ Invite by email
    @PostMapping("/{id}/invite")
    public ResponseEntity<GroupMemberResponse> inviteMember(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        GroupMember member =
                tripService.inviteMemberToTrip(id, email);
        return ResponseEntity.ok(
                GroupMemberResponse.fromEntity(member));
    }

    // ✅ Get trip members
    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberResponse>>
            getTripMembers(@PathVariable Long id) {
        return ResponseEntity.ok(
                tripService.getTripMembers(id)
                        .stream()
                        .map(GroupMemberResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    // ✅ Accept invitation
    @PatchMapping("/{id}/accept")
    public ResponseEntity<GroupMemberResponse>
            acceptInvitation(@PathVariable Long id) {
        return ResponseEntity.ok(
                GroupMemberResponse.fromEntity(
                        tripService.acceptTripInvitation(id)));
    }

    // ✅ Decline invitation
    @PatchMapping("/{id}/decline")
    public ResponseEntity<GroupMemberResponse>
            declineInvitation(@PathVariable Long id) {
        return ResponseEntity.ok(
                GroupMemberResponse.fromEntity(
                        tripService
                                .declineTripInvitation(id)));
    }

    // ✅ Remove member
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        tripService.removeTripMember(id, memberId);
        return ResponseEntity.ok("Member removed");
    }

    // ✅ Pending invitations
    @GetMapping("/invitations/pending")
public ResponseEntity<List<Map<String, Object>>>
        getPendingInvitations() {

    List<Map<String, Object>> result =
            tripService.getPendingInvitations();

    return ResponseEntity.ok(result);
}
}