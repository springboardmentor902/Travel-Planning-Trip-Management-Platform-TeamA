package com.tripnest.backend.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.dto.BudgetRequest;
import com.tripnest.backend.dto.BudgetResponse;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.ExpenseRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
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

    private Trip verifyTripOwner(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        return trip;
    }

    // ============================================================
    // CREATE OR UPDATE BUDGET
    // ============================================================

    public BudgetResponse createOrUpdateBudget(
            Long tripId, BudgetRequest request) {

        Trip trip = verifyTripOwner(tripId);
        User user = getCurrentUser();

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElse(new Budget());

        boolean isNew = budget.getId() == null;

        budget.setTotalAmount(request.getTotalAmount());
        budget.setCurrency(request.getCurrency() != null
                ? request.getCurrency() : "INR");
        budget.setTransportationBudget(
                request.getTransportationBudget());
        budget.setHotelBudget(request.getHotelBudget());
        budget.setFoodBudget(request.getFoodBudget());
        budget.setShoppingBudget(request.getShoppingBudget());
        budget.setEntertainmentBudget(
                request.getEntertainmentBudget());
        budget.setMiscBudget(request.getMiscBudget());
        budget.setTrip(trip);

        Budget saved = budgetRepository.save(budget);

        String msg = isNew
                ? "Budget set for \""
                    + trip.getTitle()
                    + "\": ₹" + request.getTotalAmount()
                : "Budget updated for \""
                    + trip.getTitle()
                    + "\": ₹" + request.getTotalAmount();

        // ✅ Notification with referenceId
        notificationService.createNotification(
                user,
                msg,
                Notification.NotificationType.BUDGET_ALERT,
                trip.getId(),
                Notification.ReferenceType.TRIP
        );

        return BudgetResponse.fromEntity(saved);
    }

    // ============================================================
    // GET BUDGET
    // ============================================================

    public BudgetResponse getBudgetByTrip(Long tripId) {
        verifyTripOwner(tripId);
        User user = getCurrentUser();

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not set"));

        BudgetResponse res = BudgetResponse.fromEntity(budget);

        List<Expense> expenses =
                expenseRepository.findByTripId(tripId);

        double totalSpent = expenses.stream()
                .filter(e -> e.getAmount() != null)
                .mapToDouble(Expense::getAmount)
                .sum();

        res.setTotalSpent(totalSpent);
        res.setRemainingBudget(
                budget.getTotalAmount() - totalSpent);

        if (budget.getTotalAmount() > 0) {
            double pct = (totalSpent
                    / budget.getTotalAmount()) * 100;
            res.setSpentPercentage(
                    Math.round(pct * 100.0) / 100.0);
        } else {
            res.setSpentPercentage(0.0);
        }

        // ✅ 80%+ budget alert
        if (res.getSpentPercentage() >= 80) {
            notificationService.createNotification(
                    user,
                    "⚠️ Budget alert: "
                            + res.getSpentPercentage()
                            + "% spent for \""
                            + budget.getTrip().getTitle()
                            + "\"",
                    Notification.NotificationType.BUDGET_ALERT,
                    budget.getTrip().getId(),
                    Notification.ReferenceType.TRIP
            );

            // Email bhi bhejo
            emailService.sendBudgetAlertEmail(
                    user.getEmail(),
                    user.getName(),
                    budget.getTrip().getTitle(),
                    res.getSpentPercentage()
            );
        }

        return res;
    }

    // ============================================================
    // GET SUMMARY
    // ============================================================

    public BudgetResponse getBudgetSummary(Long tripId) {
        verifyTripOwner(tripId);

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not set"));

        BudgetResponse res = BudgetResponse.fromEntity(budget);

        List<Expense> expenses =
                expenseRepository.findByTripId(tripId);

        double totalSpent = expenses.stream()
                .mapToDouble(e -> e.getAmount() != null
                        ? e.getAmount() : 0)
                .sum();

        res.setTotalSpent(totalSpent);
        res.setRemainingBudget(
                budget.getTotalAmount() - totalSpent);

        if (budget.getTotalAmount() > 0) {
            double pct = (totalSpent
                    / budget.getTotalAmount()) * 100;
            res.setSpentPercentage(
                    Math.round(pct * 100.0) / 100.0);
        }

        return res;
    }

    // ============================================================
    // DELETE
    // ============================================================

    public void deleteBudget(Long tripId) {
        verifyTripOwner(tripId);
        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found"));
        budgetRepository.delete(budget);
    }
}