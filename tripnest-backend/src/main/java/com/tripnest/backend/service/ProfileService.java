package com.tripnest.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tripnest.backend.dto.PasswordChangeRequest;
import com.tripnest.backend.dto.ProfileRequest;
import com.tripnest.backend.dto.ProfileResponse;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.UserProfile;
import com.tripnest.backend.repository.GroupRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserProfileRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final TripRepository tripRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;
    private final Cloudinary cloudinary;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ============================================================
    // GET PROFILE
    // ============================================================

    public ProfileResponse getProfile() {
        User user = getCurrentUser();

        UserProfile profile = profileRepository
                .findByUserId(user.getId())
                .orElse(null);

        List<Trip> trips =
                tripRepository.findByUserId(user.getId());

        long totalTrips = trips.size();
        long completedTrips = trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.COMPLETED)
                .count();
        long totalGroups = groupRepository
                .findByCreatedById(user.getId()).size();

        return ProfileResponse.fromEntities(
                user, profile,
                totalTrips, completedTrips, totalGroups);
    }

    // ============================================================
    // UPDATE PROFILE
    // ============================================================

    public ProfileResponse updateProfile(
            ProfileRequest request) {
        User user = getCurrentUser();

        // Update user name
        if (request.getName() != null
                && !request.getName().isBlank()) {
            user.setName(request.getName());
            userRepository.save(user);
        }

        // Update or create profile
        UserProfile profile = profileRepository
                .findByUserId(user.getId())
                .orElse(UserProfile.builder()
                        .user(user).build());

        if (request.getBio() != null)
            profile.setBio(request.getBio());
        if (request.getPhone() != null)
            profile.setPhone(request.getPhone());
        if (request.getCity() != null)
            profile.setCity(request.getCity());
        if (request.getCountry() != null)
            profile.setCountry(request.getCountry());
        if (request.getTravelPreferences() != null)
            profile.setTravelPreferences(
                    request.getTravelPreferences());
        if (request.getFavoriteDestinations() != null)
            profile.setFavoriteDestinations(
                    request.getFavoriteDestinations());
        if (request.getTravelStyle() != null)
            profile.setTravelStyle(
                    request.getTravelStyle());
        if (request.getBudgetRange() != null)
            profile.setBudgetRange(
                    request.getBudgetRange());

        profileRepository.save(profile);

        return getProfile();
    }

    // ============================================================
    // UPLOAD PROFILE PICTURE
    // ============================================================

    @SuppressWarnings("unchecked")
    public ProfileResponse uploadProfilePicture(
            MultipartFile file) throws IOException {
        User user = getCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null
                || !contentType.startsWith("image/")) {
            throw new RuntimeException(
                    "Only images allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException(
                    "Image too large. Max 5MB");
        }

        Map<String, Object> uploadResult =
                cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder",
                                "tripnest/avatars",
                                "public_id",
                                "avatar_" + user.getId(),
                                "overwrite", true,
                                "resource_type", "image",
                                "transformation",
                                "c_fill,g_face,h_200,w_200"
                        ));

        String imageUrl = (String) uploadResult
                .get("secure_url");

        UserProfile profile = profileRepository
                .findByUserId(user.getId())
                .orElse(UserProfile.builder()
                        .user(user).build());

        profile.setProfilePicture(imageUrl);
        profileRepository.save(profile);

        return getProfile();
    }

    // ============================================================
    // CHANGE PASSWORD
    // ============================================================

    public void changePassword(
            PasswordChangeRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            throw new RuntimeException(
                    "Current password is incorrect");
        }

        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException(
                    "Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(
                request.getNewPassword()));
        userRepository.save(user);
    }

    // ============================================================
    // TRAVEL HISTORY
    // ============================================================

    public List<Trip> getTravelHistory() {
        User user = getCurrentUser();
        return tripRepository.findByUserId(user.getId())
                .stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.COMPLETED)
                .sorted((a, b) -> {
                    if (a.getEndDate() == null) return 1;
                    if (b.getEndDate() == null) return -1;
                    return b.getEndDate()
                            .compareTo(a.getEndDate());
                })
                .toList();
    }
}