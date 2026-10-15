package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Group;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private String createdByEmail;
    private Long tripId;
    private String tripTitle;
    private int memberCount;
    private List<GroupMemberResponse> members;
    private LocalDateTime createdAt;

    public static GroupResponse fromEntity(Group g) {
        GroupResponse res = new GroupResponse();
        res.setId(g.getId());
        res.setName(g.getName());
        res.setDescription(g.getDescription());
        res.setCreatedByEmail(g.getCreatedBy().getEmail());
        res.setCreatedAt(g.getCreatedAt());

        if (g.getTrip() != null) {
            res.setTripId(g.getTrip().getId());
            res.setTripTitle(g.getTrip().getTitle());
        }

        if (g.getMembers() != null) {
            res.setMemberCount(g.getMembers().size());
            res.setMembers(g.getMembers().stream()
                    .map(GroupMemberResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return res;
    }
}