package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Expense;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseResponse {

    private Long id;
    private String description;
    private Double amount;
    private Expense.ExpenseCategory category;
    private LocalDate expenseDate;
    private String receiptUrl;
    private Long tripId;
    private String tripTitle;
    private String paidByEmail;
    private LocalDateTime createdAt;

    public static ExpenseResponse fromEntity(Expense e) {
        ExpenseResponse res = new ExpenseResponse();
        res.setId(e.getId());
        res.setDescription(e.getDescription());
        res.setAmount(e.getAmount());
        res.setCategory(e.getCategory());
        res.setExpenseDate(e.getExpenseDate());
        res.setReceiptUrl(e.getReceiptUrl());
        res.setTripId(e.getTrip().getId());
        res.setTripTitle(e.getTrip().getTitle());
        res.setPaidByEmail(e.getPaidBy().getEmail());
        res.setCreatedAt(e.getCreatedAt());
        return res;
    }
}