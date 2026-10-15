package com.tripnest.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.dto.GroupMemberResponse;
import com.tripnest.backend.dto.GroupRequest;
import com.tripnest.backend.dto.GroupResponse;
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
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ============================================================
    // HELPERS
    // ============================================================

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ============================================================
    // CREATE GROUP
    // ============================================================

    public GroupResponse createGroup(GroupRequest request) {
        User user = getCurrentUser();

        Group.GroupBuilder builder = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(user);

        if (request.getTripId() != null) {
            Trip trip = tripRepository
                    .findById(request.getTripId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Trip not found"));
            builder.trip(trip);
        }

        Group group = groupRepository.save(builder.build());

        // Creator ko ADMIN banao
        GroupMember adminMember = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupMember.MemberRole.ADMIN)
                .status(GroupMember.InviteStatus.ACCEPTED)
                .build();

        groupMemberRepository.save(adminMember);

        // ✅ Notification
        notificationService.createNotification(
                user,
                "Group created: \"" + group.getName() + "\"",
                Notification.NotificationType.SYSTEM,
                group.getId(),
                Notification.ReferenceType.GROUP
        );

        return GroupResponse.fromEntity(
                groupRepository.findById(group.getId())
                        .orElseThrow());
    }

    // ============================================================
    // GET MY GROUPS
    // ============================================================

    public List<GroupResponse> getMyGroups() {
        User user = getCurrentUser();

        List<Group> created = groupRepository
                .findByCreatedById(user.getId());

        List<Long> memberGroupIds = groupMemberRepository
                .findByUserId(user.getId())
                .stream()
                .map(m -> m.getGroup().getId())
                .collect(Collectors.toList());

        List<Group> allGroups = created;
        for (Long gId : memberGroupIds) {
            boolean alreadyIn = allGroups.stream()
                    .anyMatch(g -> g.getId().equals(gId));
            if (!alreadyIn) {
                groupRepository.findById(gId)
                        .ifPresent(allGroups::add);
            }
        }

        return allGroups.stream()
                .map(GroupResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    public GroupResponse getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));
        return GroupResponse.fromEntity(group);
    }

    // ============================================================
    // INVITE MEMBER
    // ============================================================

    public GroupMemberResponse inviteMember(Long groupId,
                                             String email) {
        User currentUser = getCurrentUser();

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        GroupMember currentMember = groupMemberRepository
                .findByGroupIdAndUserId(
                        groupId, currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("Access denied"));

        if (currentMember.getRole()
                != GroupMember.MemberRole.ADMIN) {
            throw new RuntimeException(
                    "Only admin can invite members");
        }

        User invitedUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + email));

        if (groupMemberRepository.existsByGroupIdAndUserId(
                groupId, invitedUser.getId())) {
            throw new RuntimeException("Already a member!");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(invitedUser)
                .role(GroupMember.MemberRole.MEMBER)
                .status(GroupMember.InviteStatus.PENDING)
                .build();

        GroupMember saved = groupMemberRepository.save(member);

        // ✅ In-app notification — invited user ko
        notificationService.createNotification(
                invitedUser,
                "You have been invited to join group: \""
                        + group.getName() + "\" by "
                        + currentUser.getName(),
                Notification.NotificationType.GROUP_INVITATION,
                group.getId(),
                Notification.ReferenceType.GROUP
        );

        // ✅ Email
        emailService.sendGroupInvitationEmail(
                invitedUser.getEmail(),
                invitedUser.getName(),
                group.getName(),
                currentUser.getName()
        );

        return GroupMemberResponse.fromEntity(saved);
    }

    // ============================================================
    // ACCEPT INVITE
    // ============================================================

    public GroupMemberResponse acceptInvite(Long groupId) {
        User user = getCurrentUser();

        GroupMember member = groupMemberRepository
                .findByGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invitation not found"));

        member.setStatus(GroupMember.InviteStatus.ACCEPTED);
        GroupMember saved = groupMemberRepository.save(member);

        User groupOwner = member.getGroup().getCreatedBy();

        // ✅ Notify group owner
        notificationService.createNotification(
                groupOwner,
                user.getName()
                        + " accepted your invitation to join \""
                        + member.getGroup().getName() + "\"",
                Notification.NotificationType.GROUP_INVITATION,
                member.getGroup().getId(),
                Notification.ReferenceType.GROUP
        );

        // ✅ Email to owner
        emailService.sendInvitationAcceptedEmail(
                groupOwner.getEmail(),
                groupOwner.getName(),
                user.getName(),
                member.getGroup().getName()
        );

        // ✅ Self notification
        notificationService.createNotification(
                user,
                "You joined group: \""
                        + member.getGroup().getName() + "\"",
                Notification.NotificationType.SYSTEM,
                member.getGroup().getId(),
                Notification.ReferenceType.GROUP
        );

        return GroupMemberResponse.fromEntity(saved);
    }

    // ============================================================
    // DECLINE INVITE
    // ============================================================

    public GroupMemberResponse declineInvite(Long groupId) {
        User user = getCurrentUser();

        GroupMember member = groupMemberRepository
                .findByGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invitation not found"));

        member.setStatus(GroupMember.InviteStatus.DECLINED);

        // ✅ Notify group owner
        notificationService.createNotification(
                member.getGroup().getCreatedBy(),
                user.getName()
                        + " declined your invitation to join \""
                        + member.getGroup().getName() + "\"",
                Notification.NotificationType.GROUP_INVITATION,
                member.getGroup().getId(),
                Notification.ReferenceType.GROUP
        );

        return GroupMemberResponse.fromEntity(
                groupMemberRepository.save(member));
    }

    // ============================================================
    // REMOVE MEMBER
    // ============================================================

    public void removeMember(Long groupId, Long memberId) {
        User currentUser = getCurrentUser();

        GroupMember currentMember = groupMemberRepository
                .findByGroupIdAndUserId(
                        groupId, currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("Access denied"));

        if (currentMember.getRole()
                != GroupMember.MemberRole.ADMIN) {
            throw new RuntimeException(
                    "Only admin can remove members");
        }

        GroupMember toRemove = groupMemberRepository
                .findById(memberId)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        // ✅ Notify removed member
        notificationService.createNotification(
                toRemove.getUser(),
                "You have been removed from group: \""
                        + toRemove.getGroup().getName() + "\"",
                Notification.NotificationType.SYSTEM,
                toRemove.getGroup().getId(),
                Notification.ReferenceType.GROUP
        );

        groupMemberRepository.delete(toRemove);
    }

    // ============================================================
    // DELETE GROUP
    // ============================================================

    public void deleteGroup(Long groupId) {
        User user = getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        if (!group.getCreatedBy().getId()
                .equals(user.getId())) {
            throw new RuntimeException(
                    "Only creator can delete group");
        }

        groupRepository.delete(group);
    }

    // ============================================================
    // GET BY TRIP
    // ============================================================

    public List<GroupResponse> getGroupsByTrip(Long tripId) {
        return groupRepository.findByTripId(tripId)
                .stream()
                .map(GroupResponse::fromEntity)
                .collect(Collectors.toList());
    }
}