package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.PasswordChangeRequest;
import com.tripnest.backend.dto.ProfileRequest;
import com.tripnest.backend.dto.ProfileResponse;
import com.tripnest.backend.dto.TripResponse;
import com.tripnest.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // GET /api/profile
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(
                profileService.getProfile());
    }

    // PUT /api/profile
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(
                profileService.updateProfile(request));
    }

    // POST /api/profile/picture
    @PostMapping(value = "/picture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadPicture(
            @RequestParam("file") MultipartFile file)
            throws IOException {
        return ResponseEntity.ok(
                profileService.uploadProfilePicture(file));
    }

    // PUT /api/profile/password
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody PasswordChangeRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok(
                "Password changed successfully");
    }

    // GET /api/profile/history
    @GetMapping("/history")
    public ResponseEntity<List<TripResponse>> getHistory() {
        return ResponseEntity.ok(
                profileService.getTravelHistory()
                        .stream()
                        .map(TripResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}