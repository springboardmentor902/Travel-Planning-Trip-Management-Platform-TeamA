package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.GroupMemberResponse;
import com.tripnest.backend.dto.GroupRequest;
import com.tripnest.backend.dto.GroupResponse;
import com.tripnest.backend.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // POST /api/groups — Group banao
    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody GroupRequest request) {
        return ResponseEntity.ok(
                groupService.createGroup(request));
    }

    // GET /api/groups — Apne saare groups
    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups() {
        return ResponseEntity.ok(
                groupService.getMyGroups());
    }

    // GET /api/groups/{id} — Ek group
    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroup(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                groupService.getGroupById(id));
    }

    // GET /api/groups/trip/{tripId} — Trip ke groups
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<GroupResponse>> getByTrip(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                groupService.getGroupsByTrip(tripId));
    }

    // POST /api/groups/{id}/invite — Member invite karo
    @PostMapping("/{id}/invite")
    public ResponseEntity<GroupMemberResponse> inviteMember(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        return ResponseEntity.ok(
                groupService.inviteMember(id, email));
    }

    // PATCH /api/groups/{id}/accept — Accept karo
    @PatchMapping("/{id}/accept")
    public ResponseEntity<GroupMemberResponse> acceptInvite(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                groupService.acceptInvite(id));
    }

    // PATCH /api/groups/{id}/decline — Decline karo
    @PatchMapping("/{id}/decline")
    public ResponseEntity<GroupMemberResponse> declineInvite(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                groupService.declineInvite(id));
    }

    // DELETE /api/groups/{id}/members/{memberId}
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId) {
        groupService.removeMember(id, memberId);
        return ResponseEntity.ok("Member removed");
    }

    // DELETE /api/groups/{id} — Group delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok("Group deleted");
    }
}