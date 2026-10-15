package com.tripnest.backend.dto;

import com.tripnest.backend.entity.ExpenseSplit;
import lombok.Data;

@Data
public class ExpenseSplitResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Double shareAmount;
    private Double paidAmount;
    private Boolean isSettled;
    private Double netBalance; // positive = receive, negative = pay

    public static ExpenseSplitResponse fromEntity(ExpenseSplit s) {
        ExpenseSplitResponse res = new ExpenseSplitResponse();
        res.setId(s.getId());
        res.setUserId(s.getUser().getId());
        res.setUserName(s.getUser().getName());
        res.setUserEmail(s.getUser().getEmail());
        res.setShareAmount(s.getShareAmount());
        res.setPaidAmount(s.getPaidAmount());
        res.setIsSettled(s.getIsSettled());
        return res;
    }
}