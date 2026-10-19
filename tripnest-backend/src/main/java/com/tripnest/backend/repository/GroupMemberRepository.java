package com.tripnest.backend.repository;

import com.tripnest.backend.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import com.tripnest.backend.entity.User;
public interface GroupMemberRepository
        extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByUserAndStatus(User user, GroupMember.InviteStatus status);

    Optional<GroupMember> findByGroupIdAndUserId(
            Long groupId, Long userId);

    boolean existsByGroupIdAndUserId(
            Long groupId, Long userId);

    // ✅ Trip ke saare members
    @Query("SELECT gm FROM GroupMember gm " +
           "JOIN gm.group g " +
           "WHERE g.trip.id = :tripId " +
           "AND gm.status = 'ACCEPTED'")
    List<GroupMember> findAcceptedMembersByTripId(
            @Param("tripId") Long tripId);

    // ✅ Check karo user is trip ka member hai ya nahi
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm " +
           "JOIN gm.group g " +
           "WHERE g.trip.id = :tripId " +
           "AND gm.user.id = :userId " +
           "AND gm.status = 'ACCEPTED'")
    boolean isTripMember(
            @Param("tripId") Long tripId,
            @Param("userId") Long userId);

    // ✅ User ki pending invitations
    @Query("SELECT gm FROM GroupMember gm " +
           "WHERE gm.user.id = :userId " +
           "AND gm.status = 'PENDING'")
    List<GroupMember> findPendingByUserId(
            @Param("userId") Long userId);
}