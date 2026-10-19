package com.tripnest.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.dto.TripRequest;
import com.tripnest.backend.dto.TripResponse;
import com.tripnest.backend.entity.Group;
import com.tripnest.backend.entity.GroupMember;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.GroupMemberRepository;
import com.tripnest.backend.repository.GroupRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    // ============================================================
    // HELPERS
    // ============================================================

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ============================================================
    // CREATE
    // ============================================================

    public TripResponse createTrip(TripRequest request) {
        User user = getCurrentUser();

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        Trip trip = Trip.builder()
                .title(request.getTitle())
                .destination(request.getDestination())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBudget(request.getTotalBudget())
                .travelers(request.getTravelers())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .status(request.getStatus() != null
                        ? request.getStatus()
                        : Trip.TripStatus.PLANNING)
                .user(user)
                .build();

        Trip saved = tripRepository.save(trip);
        Group group = Group.builder()
                .name(saved.getTitle() + " Team")
                .description("Trip group for " + saved.getDestination())
                .createdBy(user)
                .trip(saved)
                .build();

        Group savedGroup = groupRepository.save(group);

        GroupMember ownerMember = GroupMember.builder()
                .group(savedGroup)
                .user(user)
                .role(GroupMember.MemberRole.ADMIN)
                .status(GroupMember.InviteStatus.ACCEPTED)
                .build();

        groupMemberRepository.save(ownerMember);

        // ✅ Notification with referenceId
        notificationService.createNotification(
                user,
                "New trip created: \""
                        + saved.getTitle()
                        + "\" → " + saved.getDestination(),
                Notification.NotificationType.TRIP_REMINDER,
                saved.getId(),
                Notification.ReferenceType.TRIP
        );

        return TripResponse.fromEntity(saved);
    }

    // ============================================================
    // GET ALL
    // ============================================================

    public List<TripResponse> getMyTrips() {
    User user = getCurrentUser();

    List<Trip> ownTrips =
            tripRepository.findByUserId(user.getId());

    List<Trip> allTrips = new ArrayList<>(ownTrips);

    groupMemberRepository.findByUserId(user.getId())
            .stream()
            .filter(gm -> gm.getStatus()
                    == GroupMember.InviteStatus.ACCEPTED)
            .filter(gm -> gm.getGroup().getTrip() != null)
            .map(gm -> gm.getGroup().getTrip())
            .filter(trip -> allTrips.stream()
                    .noneMatch(existing ->
                            existing.getId().equals(trip.getId())))
            .forEach(allTrips::add);

    return allTrips.stream()
            .map(TripResponse::fromEntity)
            .collect(Collectors.toList());
}

    // ============================================================
    // GET BY ID
    // ============================================================

    public TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();

        boolean isOwner = trip.getUser().getId().equals(user.getId());
        boolean isMember = groupMemberRepository.isTripMember(id, user.getId());

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }

        return TripResponse.fromEntity(trip);
    }

    // ============================================================
    // UPDATE
    // ============================================================

    public TripResponse updateTrip(Long id,
                                    TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can update");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTotalBudget(request.getTotalBudget());
        trip.setTravelers(request.getTravelers());
        trip.setDescription(request.getDescription());
        trip.setCoverImage(request.getCoverImage());

        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        Trip saved = tripRepository.save(trip);

        // ✅ Notification
        notificationService.createNotification(
        user,
        "Trip updated: \"" + saved.getTitle() + "\"",
        Notification.NotificationType.TRAVEL_UPDATE,
        saved.getId(),
        Notification.ReferenceType.TRIP
);

        return TripResponse.fromEntity(saved);
    }

    // ============================================================
    // DELETE
    // ============================================================

    public void deleteTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can delete");
        }

        tripRepository.delete(trip);
    }

    // Update trip status
    public TripResponse updateTripStatus(Long id, Trip.TripStatus status) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can update status");
        }

        trip.setStatus(status);

        Trip saved = tripRepository.save(trip);

        // ✅ Notification
        notificationService.createNotification(
        user,
        "Trip \"" + saved.getTitle()
                + "\" is now " + status.name(),
        Notification.NotificationType.TRAVEL_UPDATE,
        saved.getId(),
        Notification.ReferenceType.TRIP
);

        return TripResponse.fromEntity(saved);
    }

    // ============================================================
    // INVITE MEMBER — By email
    // ============================================================

    @Transactional
    public GroupMember inviteMemberToTrip(
            Long tripId, String email) {

        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        // Only owner can invite
        if (!trip.getUser().getId()
                .equals(currentUser.getId())) {
            throw new RuntimeException(
                    "Only trip owner can invite members");
        }

        // Find trip group
        Group group = groupRepository
                .findFirstByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip group not found"));

        // Find user to invite
        User invitedUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + email));

        // Already member check
        if (groupMemberRepository.existsByGroupIdAndUserId(
                group.getId(), invitedUser.getId())) {
            throw new RuntimeException(
                    "User already in this trip!");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(invitedUser)
                .role(GroupMember.MemberRole.MEMBER)
                .status(GroupMember.InviteStatus.PENDING)
                .build();

        GroupMember saved =
                groupMemberRepository.save(member);

        // Notification to invited user
        notificationService.createNotification(
                invitedUser,
                currentUser.getName()
                        + " invited you to join trip: \""
                        + trip.getTitle() + "\"",
                Notification.NotificationType.GROUP_INVITATION,
                tripId,
                Notification.ReferenceType.TRIP
        );

        return saved;
    }

    // ============================================================
    // GET TRIP MEMBERS
    // ============================================================

    public List<GroupMember> getTripMembers(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        boolean isOwner = trip.getUser().getId()
                .equals(user.getId());
        boolean isMember = groupMemberRepository
                .isTripMember(tripId, user.getId());

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }

        return groupMemberRepository
                .findAcceptedMembersByTripId(tripId);
    }

    // ============================================================
    // ACCEPT / DECLINE TRIP INVITATION
    // ============================================================

    @Transactional
    public GroupMember acceptTripInvitation(Long tripId) {
        User user = getCurrentUser();

        Group group = groupRepository
                .findFirstByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        GroupMember member = groupMemberRepository
                .findByGroupIdAndUserId(
                        group.getId(), user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invitation not found"));

        member.setStatus(GroupMember.InviteStatus.ACCEPTED);
        GroupMember saved =
                groupMemberRepository.save(member);

        // Notify trip owner
        Trip trip = group.getTrip();
        notificationService.createNotification(
                trip.getUser(),
                user.getName()
                        + " joined your trip: \""
                        + trip.getTitle() + "\"",
                Notification.NotificationType.GROUP_INVITATION,
                tripId,
                Notification.ReferenceType.TRIP
        );

        return saved;
    }

    @Transactional
    public GroupMember declineTripInvitation(Long tripId) {
        User user = getCurrentUser();

        Group group = groupRepository
                .findFirstByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        GroupMember member = groupMemberRepository
                .findByGroupIdAndUserId(
                        group.getId(), user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invitation not found"));

        member.setStatus(GroupMember.InviteStatus.DECLINED);
        return groupMemberRepository.save(member);
    }

    // ============================================================
    // REMOVE MEMBER
    // ============================================================

    @Transactional
    public void removeTripMember(Long tripId, Long memberId) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId()
                .equals(currentUser.getId())) {
            throw new RuntimeException(
                    "Only trip owner can remove members");
        }

        GroupMember member = groupMemberRepository
                .findById(memberId)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        if (member.getGroup().getTrip() == null
                || !member.getGroup().getTrip().getId().equals(tripId)) {
            throw new RuntimeException(
            "Member does not belong to this trip");
        }

        notificationService.createNotification(
                member.getUser(),
                "You were removed from trip: \""
                        + trip.getTitle() + "\"",
                Notification.NotificationType.SYSTEM,
                tripId,
                Notification.ReferenceType.TRIP
        );

        groupMemberRepository.delete(member);
    }

    // ============================================================
    // HELPER — Notify all trip members
    // ============================================================

    public void notifyAllTripMembers(Long tripId,
                                      String message,
                                      Notification.NotificationType type,
                                      Long refId) {
        List<GroupMember> members = groupMemberRepository
                .findAcceptedMembersByTripId(tripId);

        User currentUser = getCurrentUser();

        members.stream()
                .map(GroupMember::getUser)
                .filter(u -> !u.getId()
                        .equals(currentUser.getId()))
                .forEach(u ->
                        notificationService
                                .createNotification(
                                        u, message, type,
                                        refId,
                                        Notification
                                                .ReferenceType
                                                .TRIP));
    }
    // ============================================================
// PENDING INVITATIONS
// ============================================================

public List<Map<String, Object>> getPendingInvitations() {
    User user = getCurrentUser();

    return groupMemberRepository
            .findByUserAndStatus(
                    user, GroupMember.InviteStatus.PENDING)
            .stream()
            .filter(member -> member.getGroup().getTrip() != null)
            .map(member -> {
                Map<String, Object> map = new java.util.HashMap<>();
                Trip trip = member.getGroup().getTrip();

                map.put("memberId", member.getId());
                map.put("tripId", trip.getId());
                map.put("tripTitle", trip.getTitle());
                map.put("tripDestination", trip.getDestination());
                map.put("invitedBy", trip.getUser().getName());

                return map;
            })
            .collect(Collectors.toList());
}
}