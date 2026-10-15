package com.tripnest.backend.dto;

import com.tripnest.backend.entity.Expense;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ExpenseRequest {

    @NotBlank(message = "Description required")
    private String description;

    @NotNull(message = "Amount required")
    private Double amount;

    @NotNull(message = "Category required")
    private Expense.ExpenseCategory category;

    @NotNull(message = "Date required")
    private LocalDate expenseDate;

    private String receiptUrl;

    // ✅ Shared expense fields
    private Boolean isShared = false;
    private Expense.SplitType splitType;
    private List<SplitMemberRequest> members;
}