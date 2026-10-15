package com.tripnest.backend.service;

import com.tripnest.backend.dto.DashboardResponse;
import com.tripnest.backend.entity.*;
import com.tripnest.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final GroupRepository groupRepository;
    private final TripDocumentRepository documentRepository;
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
    // TRAVELER DASHBOARD
    // ============================================================

    public DashboardResponse getTravelerDashboard() {
        User user = getCurrentUser();
        Long userId = user.getId();

        DashboardResponse res = new DashboardResponse();

        // User info
        res.setUserName(user.getName());
        res.setUserEmail(user.getEmail());
        res.setUserRole(user.getRole()
                .getRoleName().name());

        // ── Trips ──
        List<Trip> trips = tripRepository.findByUserId(userId);
        List<Object[]> statusCounts =
                tripRepository.countByUserAndStatus(userId);

        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] row : statusCounts) {
            statusMap.put(row[0].toString(),
                    ((Number) row[1]).longValue());
        }

        res.setTotalTrips((long) trips.size());
        res.setUpcomingTrips(
                statusMap.getOrDefault("UPCOMING", 0L)
                + statusMap.getOrDefault("PLANNING", 0L));
        res.setOngoingTrips(
                statusMap.getOrDefault("ONGOING", 0L));
        res.setCompletedTrips(
                statusMap.getOrDefault("COMPLETED", 0L));

        // Upcoming trip list — lightweight
        List<DashboardResponse.TripSummary> upcomingList =
                trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.UPCOMING
                    || t.getStatus()
                        == Trip.TripStatus.PLANNING
                    || t.getStatus()
                        == Trip.TripStatus.ONGOING)
                .sorted(Comparator.comparing(
                        t -> t.getStartDate() != null
                                ? t.getStartDate()
                                : java.time.LocalDate.MAX))
                .limit(3)
                .map(t -> {
                    DashboardResponse.TripSummary s =
                            new DashboardResponse.TripSummary();
                    s.setId(t.getId());
                    s.setTitle(t.getTitle());
                    s.setDestination(t.getDestination());
                    s.setStartDate(t.getStartDate() != null
                            ? t.getStartDate().toString() : "");
                    s.setEndDate(t.getEndDate() != null
                            ? t.getEndDate().toString() : "");
                    s.setStatus(t.getStatus().name());
                    s.setTotalDays(
                            t.getStartDate() != null
                            && t.getEndDate() != null
                            ? (int)(t.getStartDate()
                                .until(t.getEndDate())
                                .getDays() + 1)
                            : 0);
                    s.setBudget(t.getTotalBudget());
                    return s;
                })
                .collect(Collectors.toList());

        res.setUpcomingTripList(upcomingList);

        // ── Budget + Expenses — DB queries ──
        List<Long> tripIds = trips.stream()
                .map(Trip::getId)
                .collect(Collectors.toList());

        double totalBudget = trips.stream()
                .filter(t -> t.getTotalBudget() != null)
                .mapToDouble(Trip::getTotalBudget).sum();

        // Category sums from DB
        List<Object[]> catSums =
                expenseRepository.sumByUserAndCategory(userId);

        Map<String, Double> expByCategory =
                new LinkedHashMap<>();
        double totalSpent = 0;

        for (Object[] row : catSums) {
            String cat = row[0].toString();
            double amount = ((Number) row[1]).doubleValue();
            expByCategory.put(cat, round(amount));
            totalSpent += amount;
        }

        // Fill missing categories with 0
        for (Expense.ExpenseCategory cat :
                Expense.ExpenseCategory.values()) {
            expByCategory.putIfAbsent(cat.name(), 0.0);
        }

        res.setTotalBudget(round(totalBudget));
        res.setTotalSpent(round(totalSpent));
        res.setTotalRemaining(round(totalBudget - totalSpent));
        res.setSpentPercentage(totalBudget > 0
                ? round((totalSpent / totalBudget) * 100) : 0);
        res.setExpensesByCategory(expByCategory);

        // Recent expenses — last 5
        List<Expense> recentExp = tripIds.stream()
                .flatMap(tid -> expenseRepository
                        .findByTripId(tid).stream())
                .filter(e -> e.getAmount() != null)
                .sorted((a, b) -> {
                    if (a.getExpenseDate() == null) return 1;
                    if (b.getExpenseDate() == null) return -1;
                    return b.getExpenseDate()
                            .compareTo(a.getExpenseDate());
                })
                .limit(5)
                .collect(Collectors.toList());

        res.setRecentExpenses(recentExp.stream()
                .map(e -> {
                    DashboardResponse.RecentExpense re =
                            new DashboardResponse.RecentExpense();
                    re.setDescription(e.getDescription());
                    re.setAmount(e.getAmount());
                    re.setCategory(e.getCategory() != null
                            ? e.getCategory().name() : "OTHER");
                    re.setDate(e.getExpenseDate() != null
                            ? e.getExpenseDate().toString() : "");
                    return re;
                })
                .collect(Collectors.toList()));

        // ── Activities ──
        long totalActivities = tripIds.stream()
                .mapToLong(tid ->
                    itineraryRepository.findByTripId(tid)
                        .stream()
                        .mapToLong(iti ->
                            activityRepository
                                .findByItineraryId(iti.getId())
                                .size())
                        .sum())
                .sum();
        res.setTotalActivities(totalActivities);

        // ── Groups ──
        res.setTotalGroups((long)
                groupRepository.findByCreatedById(userId)
                        .size());

        // ── Documents ──
        long totalDocs = tripIds.stream()
                .mapToLong(tid -> documentRepository
                        .findByTripId(tid).size())
                .sum();
        res.setTotalDocuments(totalDocs);

        // ── Favorite Destinations — DB query ──
        List<Object[]> destRows =
                tripRepository.userDestinations(userId);

        List<DashboardResponse.DestinationStat> favDests =
                destRows.stream()
                .limit(5)
                .map(row -> {
                    DashboardResponse.DestinationStat ds =
                            new DashboardResponse
                                    .DestinationStat();
                    ds.setDestination(row[0].toString());
                    ds.setTripCount(
                            ((Number) row[1]).longValue());
                    return ds;
                })
                .collect(Collectors.toList());
        res.setFavoriteDestinations(favDests);

        // ── Monthly spending trend — DB query ──
        List<Object[]> monthlySpend =
                expenseRepository.monthlySpendingByUser(userId);

        Map<String, Double> monthlySpendMap =
                new LinkedHashMap<>();
        for (Object[] row : monthlySpend) {
            monthlySpendMap.put(row[0].toString(),
                    round(((Number) row[1]).doubleValue()));
        }
        res.setMonthlySpending(monthlySpendMap);

        // ── Monthly trips — DB query ──
        List<Object[]> monthlyTrips =
                tripRepository.userMonthlyTripCount(userId);

        Map<String, Long> monthlyTripMap =
                new LinkedHashMap<>();
        for (Object[] row : monthlyTrips) {
            monthlyTripMap.put(row[0].toString(),
                    ((Number) row[1]).longValue());
        }
        res.setTripsByMonth(monthlyTripMap);

        return res;
    }
}