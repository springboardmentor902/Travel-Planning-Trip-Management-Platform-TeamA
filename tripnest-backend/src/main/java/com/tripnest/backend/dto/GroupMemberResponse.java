package com.tripnest.backend.dto;

import com.tripnest.backend.entity.GroupMember;
import lombok.Data;

@Data
public class GroupMemberResponse {

    private Long id;
    private Long userId;
    private String email;
    private String name;
    private GroupMember.MemberRole role;
    private GroupMember.InviteStatus status;

    public static GroupMemberResponse fromEntity(GroupMember m) {
        GroupMemberResponse res = new GroupMemberResponse();
        res.setId(m.getId());
        res.setUserId(m.getUser().getId()); // ← YE ADD KARO
        res.setEmail(m.getUser().getEmail());
        res.setName(m.getUser().getName());
        res.setRole(m.getRole());
        res.setStatus(m.getStatus());
        return res;
    }
}