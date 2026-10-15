package com.tripnest.backend.service;

import com.tripnest.backend.dto.GroupRequest;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ============================================================
    // CREATE TRIP — Auto group banao
    // ============================================================

    @Transactional
    public TripResponse createTrip(TripRequest request) {
        User user = getCurrentUser();

        Trip trip = Trip.builder()
                .title(request.getTitle())
                .destination(request.getDestination())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBudget(request.getTotalBudget())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .status(request.getStatus() != null
                        ? request.getStatus()
                        : Trip.TripStatus.PLANNING)
                .user(user)
                .build();

        Trip saved = tripRepository.save(trip);

        // ✅ Auto group create karo
        Group group = Group.builder()
                .name(saved.getTitle() + " Team")
                .description("Trip group for "
                        + saved.getDestination())
                .createdBy(user)
                .trip(saved)
                .build();

        Group savedGroup = groupRepository.save(group);

        // ✅ Creator ko ADMIN banao
        GroupMember adminMember = GroupMember.builder()
                .group(savedGroup)
                .user(user)
                .role(GroupMember.MemberRole.ADMIN)
                .status(GroupMember.InviteStatus.ACCEPTED)
                .build();

        groupMemberRepository.save(adminMember);

        // Notification
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
    // GET MY TRIPS — Own + Member trips
    // ============================================================

   
    public List<TripResponse> getMyTrips() {
        User user = getCurrentUser();

        // Apni trips
        List<Trip> ownTrips =
                tripRepository.findByUserId(user.getId());

        // Jis trips ka member hai
        List<Long> memberTripIds = groupMemberRepository
                .findAcceptedMembersByTripId(0L)
                .stream()
                .map(gm -> gm.getGroup().getTrip() != null
                        ? gm.getGroup().getTrip().getId()
                        : null)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        // Dono merge karo
        List<Trip> allTrips = new java.util.ArrayList<>(
                ownTrips);

        groupMemberRepository
                .findByUserId(user.getId())
                .stream()
                .filter(gm -> gm.getStatus()
                        == GroupMember.InviteStatus.ACCEPTED)
                .filter(gm -> gm.getGroup().getTrip() != null)
                .map(gm -> gm.getGroup().getTrip())
                .filter(t -> ownTrips.stream()
                        .noneMatch(ot ->
                                ot.getId().equals(t.getId())))
                .forEach(allTrips::add);

        return allTrips.stream()
                .map(TripResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET BY ID — Owner + Member access
    // ============================================================

    public TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
        User user = getCurrentUser();

        boolean isOwner = trip.getUser().getId()
                .equals(user.getId());
        boolean isMember = groupMemberRepository
                .isTripMember(id, user.getId());

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }

        return TripResponse.fromEntity(trip);
    }

    // ============================================================
    // UPDATE — Only owner
    // ============================================================

    public TripResponse updateTrip(Long id,
                                    TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
        User user = getCurrentUser();

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can update");
        }

        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTotalBudget(request.getTotalBudget());
        trip.setDescription(request.getDescription());
        trip.setCoverImage(request.getCoverImage());
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        Trip saved = tripRepository.save(trip);

        // Notify all members
        notifyAllTripMembers(
                id,
                "Trip updated: \"" + saved.getTitle() + "\"",
                Notification.NotificationType.TRAVEL_UPDATE,
                saved.getId()
        );

        return TripResponse.fromEntity(saved);
    }

    // ============================================================
    // DELETE — Only owner
    // ============================================================

    public void deleteTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
        User user = getCurrentUser();
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can delete");
        }
        tripRepository.delete(trip);
    }

    // ============================================================
    // STATUS UPDATE
    // ============================================================

    public TripResponse updateTripStatus(Long id,
                                          Trip.TripStatus status) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
        User user = getCurrentUser();
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can update status");
        }

        trip.setStatus(status);
        Trip saved = tripRepository.save(trip);

        notifyAllTripMembers(
                id,
                "Trip \"" + saved.getTitle()
                        + "\" is now " + status.name(),
                Notification.NotificationType.TRAVEL_UPDATE,
                saved.getId()
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

public List<Map<String, Object>> getPendingInvitations(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    return groupMemberRepository
            .findByUserAndStatus(user, GroupMember.InviteStatus.PENDING)
            .stream()
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