package com.tripnest.backend.service;

import com.tripnest.backend.dto.AdminDashboardResponse;
import com.tripnest.backend.entity.*;
import com.tripnest.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final TripDocumentRepository documentRepository;
    private final ActivityRepository activityRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private void checkAdmin(User user) {
        if (user.getRole().getRoleName()
                != Role.RoleName.ADMIN) {
            throw new RuntimeException(
                    "Access denied — Admin only");
        }
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    // ============================================================
    // ADMIN DASHBOARD
    // ============================================================

    public AdminDashboardResponse getAdminDashboard() {
        User user = getCurrentUser();
        checkAdmin(user);

        AdminDashboardResponse res =
                new AdminDashboardResponse();

        // ── Users — DB queries ──
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countActiveUsers();

        res.setTotalUsers(totalUsers);
        res.setActiveUsers(activeUsers);
        res.setInactiveUsers(totalUsers - activeUsers);

        // Users by role — DB
        List<Object[]> roleRows =
                userRepository.countByRole();
        Map<String, Long> usersByRole =
                new LinkedHashMap<>();
        for (Object[] row : roleRows) {
            usersByRole.put(row[0].toString(),
                    ((Number) row[1]).longValue());
        }
        res.setUsersByRole(usersByRole);

        // Monthly signups — DB
        List<Object[]> signupRows =
                userRepository.monthlySignups();
        Map<String, Long> monthlySignups =
                new LinkedHashMap<>();
        for (Object[] row : signupRows) {
            monthlySignups.put(row[0].toString(),
                    ((Number) row[1]).longValue());
        }
        res.setMonthlySignups(monthlySignups);
        res.setUserGrowth(monthlySignups);

        // ── Trips — DB queries ──
        res.setTotalTrips(tripRepository.count());
        res.setTotalActivities(activityRepository.count());

        // Trips by status — DB
        List<Object[]> statusRows =
                tripRepository.countByStatus();
        Map<String, Long> tripsByStatus =
                new LinkedHashMap<>();
        for (Object[] row : statusRows) {
            tripsByStatus.put(row[0].toString(),
                    ((Number) row[1]).longValue());
        }
        res.setTripsByStatus(tripsByStatus);

        // Monthly trip count — DB
        List<Object[]> monthlyTripRows =
                tripRepository.monthlyTripCount();
        Map<String, Long> monthlyTrips =
                new LinkedHashMap<>();
        for (Object[] row : monthlyTripRows) {
            monthlyTrips.put(row[0].toString(),
                    ((Number) row[1]).longValue());
        }
        res.setMonthlyTripCount(monthlyTrips);
        res.setTripGrowth(monthlyTrips);

        // Average trip days
        List<Trip> allTrips = tripRepository.findAll();
        double avgDays = allTrips.stream()
                .filter(t -> t.getStartDate() != null
                        && t.getEndDate() != null)
                .mapToLong(t -> t.getStartDate()
                        .until(t.getEndDate()).getDays() + 1)
                .average()
                .orElse(0);
        res.setAverageTripDays(round(avgDays));

        // ── Destinations — DB ──
        List<Object[]> destRows =
                tripRepository.popularDestinations();

        long totalTripCount = tripRepository.count();

        List<AdminDashboardResponse.DestinationTrend> popDests =
                destRows.stream()
                .limit(10)
                .map(row -> {
                    AdminDashboardResponse.DestinationTrend dt =
                            new AdminDashboardResponse
                                    .DestinationTrend();
                    dt.setDestination(row[0].toString());
                    long cnt = ((Number) row[1]).longValue();
                    dt.setTripCount(cnt);
                    dt.setPercentage(totalTripCount > 0
                            ? round((cnt / (double)
                                totalTripCount) * 100)
                            : 0);
                    return dt;
                })
                .collect(Collectors.toList());

        res.setPopularDestinations(popDests);

        Map<String, Long> destTrends =
                new LinkedHashMap<>();
        destRows.stream().limit(10).forEach(row ->
                destTrends.put(row[0].toString(),
                        ((Number) row[1]).longValue()));
        res.setDestinationTrends(destTrends);

        // ── Expenses — DB queries ──
        res.setTotalExpenses(expenseRepository.count());

        List<Object[]> expRows =
                expenseRepository.platformCategorySum();

        Map<String, Double> platformExp =
                new LinkedHashMap<>();
        double totalPlatformSpend = 0;

        for (Object[] row : expRows) {
            double amount =
                    ((Number) row[1]).doubleValue();
            platformExp.put(row[0].toString(),
                    round(amount));
            totalPlatformSpend += amount;
        }

        // Fill missing categories
        for (Expense.ExpenseCategory cat :
                Expense.ExpenseCategory.values()) {
            platformExp.putIfAbsent(cat.name(), 0.0);
        }

        res.setTotalPlatformSpending(
                round(totalPlatformSpend));
        res.setPlatformExpensesByCategory(platformExp);

        // ── Groups + Docs ──
        res.setTotalGroups(groupRepository.count());
        res.setTotalDocuments(documentRepository.count());

        return res;
    }
}