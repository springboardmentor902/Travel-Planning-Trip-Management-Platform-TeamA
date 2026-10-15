package com.tripnest.backend.service;

import com.tripnest.backend.dto.ReportResponse;
import com.tripnest.backend.entity.*;
import com.tripnest.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    // ============================================================
    // TRIP REPORT — Category vs Budget
    // ============================================================

    public ReportResponse getTripReport(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        ReportResponse res = new ReportResponse();
        res.setTripId(tripId);
        res.setTripTitle(trip.getTitle());
        res.setDestination(trip.getDestination());

        // Budget
        Optional<Budget> budgetOpt =
                budgetRepository.findByTripId(tripId);
        Budget budget = budgetOpt.orElse(null);

        double totalBudget = budget != null
                ? budget.getTotalAmount() : 0;

        // Expenses from DB — category sum
        List<Object[]> catSums =
                expenseRepository.sumByTripAndCategory(tripId);

        Map<String, Double> actualByCategory =
                new LinkedHashMap<>();
        double totalSpent = 0;

        for (Object[] row : catSums) {
            String cat = row[0].toString();
            double amount = ((Number) row[1]).doubleValue();
            actualByCategory.put(cat, round(amount));
            totalSpent += amount;
        }

        res.setTotalBudget(round(totalBudget));
        res.setTotalSpent(round(totalSpent));
        res.setTotalRemaining(round(totalBudget - totalSpent));
        res.setSpentPercentage(totalBudget > 0
                ? round((totalSpent / totalBudget) * 100) : 0);

        // Category reports — budget vs actual
        List<ReportResponse.CategoryReport> catReports =
                new ArrayList<>();

        Map<String, Double> budgetedByCategory =
                new LinkedHashMap<>();
        if (budget != null) {
            budgetedByCategory.put("TRANSPORTATION",
                    budget.getTransportationBudget() != null
                    ? budget.getTransportationBudget() : 0);
            budgetedByCategory.put("HOTEL",
                    budget.getHotelBudget() != null
                    ? budget.getHotelBudget() : 0);
            budgetedByCategory.put("FOOD",
                    budget.getFoodBudget() != null
                    ? budget.getFoodBudget() : 0);
            budgetedByCategory.put("SHOPPING",
                    budget.getShoppingBudget() != null
                    ? budget.getShoppingBudget() : 0);
            budgetedByCategory.put("ENTERTAINMENT",
                    budget.getEntertainmentBudget() != null
                    ? budget.getEntertainmentBudget() : 0);
            budgetedByCategory.put("MISCELLANEOUS",
                    budget.getMiscBudget() != null
                    ? budget.getMiscBudget() : 0);
        }

        for (Expense.ExpenseCategory cat :
                Expense.ExpenseCategory.values()) {
            String catName = cat.name();
            double budgeted =
                    budgetedByCategory.getOrDefault(catName, 0.0);
            double actual =
                    actualByCategory.getOrDefault(catName, 0.0);
            double remaining = budgeted - actual;
            double usagePct = budgeted > 0
                    ? round((actual / budgeted) * 100) : 0;

            String status = usagePct >= 100 ? "OVER"
                    : usagePct >= 80 ? "NEAR" : "UNDER";

            ReportResponse.CategoryReport cr =
                    new ReportResponse.CategoryReport();
            cr.setCategory(catName);
            cr.setBudgeted(round(budgeted));
            cr.setActual(round(actual));
            cr.setRemaining(round(remaining));
            cr.setUsagePercentage(usagePct);
            cr.setStatus(status);

            catReports.add(cr);
        }
        res.setCategoryReports(catReports);

        // Budget vs Actual map for chart
        // (used in frontend bar chart)
        Map<String, Double> budgetVsActual =
                new LinkedHashMap<>();
        for (ReportResponse.CategoryReport cr : catReports) {
            if (cr.getBudgeted() > 0 || cr.getActual() > 0) {
                budgetVsActual.put(
                        cr.getCategory() + "_budget",
                        cr.getBudgeted());
                budgetVsActual.put(
                        cr.getCategory() + "_actual",
                        cr.getActual());
            }
        }

        // Daily spending trend
        List<Expense> allExpenses =
                expenseRepository.findByTripId(tripId);

        Map<String, Double> dailySpending =
                new LinkedHashMap<>();
        allExpenses.stream()
                .filter(e -> e.getExpenseDate() != null
                        && e.getAmount() != null)
                .sorted(Comparator.comparing(
                        Expense::getExpenseDate))
                .forEach(e -> {
                    String date =
                            e.getExpenseDate().toString();
                    dailySpending.merge(
                            date, e.getAmount(), Double::sum);
                });
        res.setDailySpending(dailySpending);

        // Top expenses
        List<ReportResponse.ExpenseItem> topExpenses =
                allExpenses.stream()
                .filter(e -> e.getAmount() != null)
                .sorted((a, b) -> Double.compare(
                        b.getAmount(), a.getAmount()))
                .limit(5)
                .map(e -> {
                    ReportResponse.ExpenseItem item =
                            new ReportResponse.ExpenseItem();
                    item.setDescription(e.getDescription());
                    item.setAmount(e.getAmount());
                    item.setCategory(e.getCategory() != null
                            ? e.getCategory().name() : "OTHER");
                    item.setDate(e.getExpenseDate() != null
                            ? e.getExpenseDate().toString() : "");
                    item.setPaidBy(e.getPaidBy() != null
                            ? e.getPaidBy().getName() : "");
                    return item;
                })
                .collect(Collectors.toList());
        res.setTopExpenses(topExpenses);

        // Shared vs personal
        double sharedTotal = allExpenses.stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsShared())
                        && e.getAmount() != null)
                .mapToDouble(Expense::getAmount).sum();
        double personalTotal = allExpenses.stream()
                .filter(e -> !Boolean.TRUE.equals(e.getIsShared())
                        && e.getAmount() != null)
                .mapToDouble(Expense::getAmount).sum();

        res.setSharedTotal(round(sharedTotal));
        res.setPersonalTotal(round(personalTotal));

        return res;
    }
}