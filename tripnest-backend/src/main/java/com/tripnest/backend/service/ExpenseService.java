package com.tripnest.backend.service;

import com.tripnest.backend.dto.ExpenseRequest;
import com.tripnest.backend.dto.ExpenseResponse;
import com.tripnest.backend.dto.ExpenseSummaryResponse;
import com.tripnest.backend.dto.SplitMemberRequest;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.ExpenseSplit;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.ExpenseRepository;
import com.tripnest.backend.repository.ExpenseSplitRepository;
import com.tripnest.backend.repository.GroupMemberRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final NotificationService notificationService;

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

    // ✅ Owner + Member dono access kar sakte hain
    private Trip verifyTripAccess(Long tripId) {
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
        return trip;
    }

    // ✅ Sirf owner ke liye
    private Trip verifyTripOwner(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Only trip owner can do this");
        }
        return trip;
    }

    // ============================================================
    // CREATE SPLITS
    // ============================================================

    private void createSplits(Expense expense,
                               ExpenseRequest request) {
        List<SplitMemberRequest> members =
                request.getMembers();
        if (members == null || members.isEmpty()) return;

        int count = members.size();
        double total = expense.getAmount();
        List<ExpenseSplit> splits = new ArrayList<>();

        if (request.getSplitType()
                == Expense.SplitType.EQUAL) {

            double base = Math.floor(
                    (total / count) * 100) / 100;
            double totalAssigned = base * (count - 1);
            double lastShare = Math.round(
                    (total - totalAssigned) * 100.0) / 100.0;

            for (int i = 0; i < members.size(); i++) {
                SplitMemberRequest m = members.get(i);
                User member = userRepository
                        .findById(m.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found: "
                                        + m.getUserId()));

                double share = (i == members.size() - 1)
                        ? lastShare : base;
                double paid = member.getId().equals(
                        expense.getPaidBy().getId())
                        ? expense.getAmount() : 0.0;

                splits.add(ExpenseSplit.builder()
                        .expense(expense)
                        .user(member)
                        .shareAmount(share)
                        .paidAmount(paid)
                        .isSettled(false)
                        .build());
            }

        } else if (request.getSplitType()
                == Expense.SplitType.CUSTOM) {

            double customTotal = members.stream()
                    .mapToDouble(m -> m.getCustomAmount()
                            != null
                            ? m.getCustomAmount() : 0)
                    .sum();

            if (Math.abs(customTotal - total) > 0.02) {
                throw new RuntimeException(
                        "Custom amounts sum ("
                        + customTotal
                        + ") does not match expense ("
                        + total + ")");
            }

            for (SplitMemberRequest m : members) {
                if (m.getCustomAmount() == null) {
                    throw new RuntimeException(
                            "Custom amount required "
                            + "for all members");
                }

                User member = userRepository
                        .findById(m.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found: "
                                        + m.getUserId()));

                double paid = member.getId().equals(
                        expense.getPaidBy().getId())
                        ? expense.getAmount() : 0.0;

                splits.add(ExpenseSplit.builder()
                        .expense(expense)
                        .user(member)
                        .shareAmount(m.getCustomAmount())
                        .paidAmount(paid)
                        .isSettled(false)
                        .build());
            }
        }

        expenseSplitRepository.saveAll(splits);
    }

    // ============================================================
    // ADD EXPENSE — Owner + Member
    // ============================================================

    @Transactional
    public ExpenseResponse addExpense(Long tripId,
                                       ExpenseRequest request) {
        Trip trip = verifyTripAccess(tripId); // ✅
        User user = getCurrentUser();

        Expense expense = Expense.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(request.getCategory())
                .expenseDate(request.getExpenseDate())
                .receiptUrl(request.getReceiptUrl())
                .isShared(request.getIsShared() != null
                        ? request.getIsShared() : false)
                .splitType(request.getSplitType())
                .trip(trip)
                .paidBy(user)
                .build();

        Expense saved = expenseRepository.save(expense);

        // Shared expense — splits banao
        if (Boolean.TRUE.equals(request.getIsShared())
                && request.getSplitType() != null
                && request.getMembers() != null
                && !request.getMembers().isEmpty()) {

            createSplits(saved, request);

            // ✅ Notify each split member
            for (SplitMemberRequest m :
                    request.getMembers()) {
                userRepository.findById(m.getUserId())
                        .ifPresent(member -> {
                    if (!member.getId()
                            .equals(user.getId())) {

                        double share =
                                request.getSplitType()
                                == Expense.SplitType.EQUAL
                                ? Math.round(
                                    (saved.getAmount()
                                    / request.getMembers()
                                            .size())
                                    * 100.0) / 100.0
                                : (m.getCustomAmount() != null
                                    ? m.getCustomAmount()
                                    : 0);

                        notificationService.createNotification(
                                member,
                                user.getName()
                                + " added shared expense: \""
                                + saved.getDescription()
                                + "\" — your share: ₹"
                                + share,
                                Notification.NotificationType
                                        .BUDGET_ALERT,
                                saved.getTrip().getId(),
                                Notification.ReferenceType.TRIP
                        );
                    }
                });
            }
        }

        // ✅ Notify other trip members
        notifyOtherTripMembers(
                tripId,
                user,
                user.getName() + " added expense: \""
                + saved.getDescription() + "\" ₹"
                + saved.getAmount(),
                saved.getTrip().getId()
        );

        return ExpenseResponse.fromEntity(
                expenseRepository.findById(saved.getId())
                        .orElseThrow());
    }

    // ============================================================
    // GET ALL EXPENSES — Owner + Member
    // ============================================================

    public List<ExpenseResponse> getExpensesByTrip(
            Long tripId) {
        verifyTripAccess(tripId); // ✅
        return expenseRepository.findByTripId(tripId)
                .stream()
                .sorted((a, b) -> {
                    if (a.getExpenseDate() == null) return 1;
                    if (b.getExpenseDate() == null) return -1;
                    return b.getExpenseDate()
                            .compareTo(a.getExpenseDate());
                })
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET BY CATEGORY — Owner + Member
    // ============================================================

    public List<ExpenseResponse> getExpensesByCategory(
            Long tripId,
            Expense.ExpenseCategory category) {
        verifyTripAccess(tripId); // ✅
        return expenseRepository.findByTripId(tripId)
                .stream()
                .filter(e -> e.getCategory() == category)
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // UPDATE EXPENSE — Only expense creator or trip owner
    // ============================================================

    @Transactional
    public ExpenseResponse updateExpense(Long expenseId,
                                          ExpenseRequest request) {
        Expense expense = expenseRepository
                .findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense not found"));

        User user = getCurrentUser();
        Long tripId = expense.getTrip().getId();

        // ✅ Trip member check
        boolean isOwner = expense.getTrip().getUser()
                .getId().equals(user.getId());
        boolean isExpenseCreator = expense.getPaidBy()
                .getId().equals(user.getId());
        boolean isMember = groupMemberRepository
                .isTripMember(tripId, user.getId());

        if (!isOwner && !isExpenseCreator && !isMember) {
            throw new RuntimeException("Access denied");
        }

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setReceiptUrl(request.getReceiptUrl());
        expense.setIsShared(request.getIsShared() != null
                ? request.getIsShared() : false);
        expense.setSplitType(request.getSplitType());

        expenseRepository.save(expense);

        // Purane splits delete — naye banao
        expenseSplitRepository.deleteByExpenseId(expenseId);

        if (Boolean.TRUE.equals(request.getIsShared())
                && request.getSplitType() != null
                && request.getMembers() != null
                && !request.getMembers().isEmpty()) {

            createSplits(expense, request);

            // Notify members
            for (SplitMemberRequest m :
                    request.getMembers()) {
                userRepository.findById(m.getUserId())
                        .ifPresent(member -> {
                    if (!member.getId()
                            .equals(user.getId())) {
                        notificationService.createNotification(
                                member,
                                user.getName()
                                + " updated shared expense: \""
                                + expense.getDescription()
                                + "\"",
                                Notification.NotificationType
                                        .BUDGET_ALERT,
                                expense.getTrip().getId(),
                                Notification.ReferenceType.TRIP
                        );
                    }
                });
            }
        }

        return ExpenseResponse.fromEntity(
                expenseRepository.findById(expenseId)
                        .orElseThrow());
    }

    // ============================================================
    // DELETE EXPENSE
    // ============================================================

    @Transactional
    public void deleteExpense(Long expenseId) {
        Expense expense = expenseRepository
                .findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense not found"));

        User user = getCurrentUser();
        Long tripId = expense.getTrip().getId();

        boolean isOwner = expense.getTrip().getUser()
                .getId().equals(user.getId());
        boolean isExpenseCreator = expense.getPaidBy()
                .getId().equals(user.getId());

        if (!isOwner && !isExpenseCreator) {
            throw new RuntimeException(
                    "Only trip owner or expense creator"
                    + " can delete");
        }

        expenseSplitRepository
                .deleteByExpenseId(expenseId);
        expenseRepository.delete(expense);
    }

    // ============================================================
    // EXPENSE SUMMARY — Owner + Member
    // ============================================================

    public ExpenseSummaryResponse getExpenseSummary(Long tripId) {
    Trip trip = verifyTripAccess(tripId);

    List<Expense> expenses = expenseRepository.findByTripId(tripId);

    double totalSpent = expenses.stream()
            .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0)
            .sum();

    Map<String, Double> breakdown = new LinkedHashMap<>();
    for (Expense.ExpenseCategory cat : Expense.ExpenseCategory.values()) {
        double catTotal = expenses.stream()
                .filter(e -> e.getCategory() == cat)
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0)
                .sum();
        breakdown.put(cat.name(), Math.round(catTotal * 100.0) / 100.0);
    }

    Map<String, Long> count = new LinkedHashMap<>();
    for (Expense.ExpenseCategory cat : Expense.ExpenseCategory.values()) {
        long catCount = expenses.stream()
                .filter(e -> e.getCategory() == cat)
                .count();
        count.put(cat.name(), catCount);
    }

    double totalBudget = 0;
    double remaining   = 0;
    double percentage  = 0;

    // ✅ FIX: Pehle Budget table check karo, phir Trip ka budget field
    var budgetOpt = budgetRepository.findByTripId(tripId);
    if (budgetOpt.isPresent()) {
        totalBudget = budgetOpt.get().getTotalAmount();
    } else if (trip.getTotalBudget() != null) {
        totalBudget = trip.getTotalBudget(); // ← Trip entity se fallback
    }

    if (totalBudget > 0) {
        remaining  = totalBudget - totalSpent;
        percentage = Math.round((totalSpent / totalBudget) * 10000.0) / 100.0;
    }

    ExpenseSummaryResponse summary = new ExpenseSummaryResponse();
    summary.setTripId(tripId);
    summary.setTripTitle(trip.getTitle());
    summary.setTotalSpent(Math.round(totalSpent * 100.0) / 100.0);
    summary.setTotalBudget(totalBudget);
    summary.setRemainingBudget(remaining);
    summary.setSpentPercentage(percentage);
    summary.setCategoryBreakdown(breakdown);
    summary.setCategoryCount(count);

    return summary;
}

    // ============================================================
    // HELPER — Notify other trip members
    // ============================================================

    private void notifyOtherTripMembers(
            Long tripId,
            User currentUser,
            String message,
            Long refId) {
        try {
            groupMemberRepository
                    .findAcceptedMembersByTripId(tripId)
                    .stream()
                    .map(gm -> gm.getUser())
                    .filter(u -> !u.getId()
                            .equals(currentUser.getId()))
                    .forEach(u ->
                        notificationService
                                .createNotification(
                                u,
                                message,
                                Notification.NotificationType
                                        .BUDGET_ALERT,
                                refId,
                                Notification.ReferenceType
                                        .TRIP));
        } catch (Exception e) {
            // Non-critical — log and continue
        }
    }
}