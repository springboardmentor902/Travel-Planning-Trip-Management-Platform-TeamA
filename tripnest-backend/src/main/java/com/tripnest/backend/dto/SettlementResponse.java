package com.tripnest.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class SettlementResponse {

    private Long tripId;
    private String tripTitle;
    private Double totalSharedAmount;

    // Har member ka net balance
    private List<MemberBalance> memberBalances;

    // Simplified transactions
    private List<Transaction> transactions;

    @Data
    public static class MemberBalance {
        private Long userId;
        private String userName;
        private String userEmail;
        private Double totalPaid;    // Kitna diya
        private Double totalOwed;    // Kitna dena chahiye tha
        private Double netBalance;   // paid - owed
                                     // +ve = receive karna hai
                                     // -ve = dena hai
    }

    @Data
    public static class Transaction {
        private Long fromUserId;
        private String fromUserName;
        private Long toUserId;
        private String toUserName;
        private Double amount;
    }
}