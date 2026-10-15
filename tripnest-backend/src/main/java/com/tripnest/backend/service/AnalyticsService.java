package com.tripnest.backend.service;

import com.tripnest.backend.dto.AdminAnalyticsResponse;
import com.tripnest.backend.dto.ExpenseReportResponse;
import com.tripnest.backend.dto.TravelerAnalyticsResponse;
import com.tripnest.backend.entity.*;
import com.tripnest.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final TripDocumentRepository documentRepository;
    private final NotificationRepository notificationRepository;

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

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // ============================================================
    // TRAVELER ANALYTICS
    // ============================================================

    public TravelerAnalyticsResponse getTravelerAnalytics() {
        User user = getCurrentUser();
        Long userId = user.getId();

        TravelerAnalyticsResponse res =
                new TravelerAnalyticsResponse();

        // ── Trips ──
        List<Trip> trips =
                tripRepository.findByUserId(userId);

        res.setTotalTrips((long) trips.size());
        res.setPlannedTrips(trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.PLANNING)
                .count());
        res.setUpcomingTrips(trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.UPCOMING)
                .count());
        res.setOngoingTrips(trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.ONGOING)
                .count());
        res.setCompletedTrips(trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.COMPLETED)
                .count());
        res.setCancelledTrips(trips.stream()
                .filter(t -> t.getStatus()
                        == Trip.TripStatus.CANCELLED)
                .count());

        // ── Budget ──
        List<Long> tripIds = trips.stream()
                .map(Trip::getId)
                .collect(Collectors.toList());

        double totalBudget = trips.stream()
                .filter(t -> t.getTotalBudget() != null)
                .mapToDouble(Trip::getTotalBudget)
                .sum();

        res.setTotalBudgetAllocated(round(totalBudget));
        res.setAverageBudgetPerTrip(trips.isEmpty()
                ? 0.0
                : round(totalBudget / trips.size()));

        // ── Expenses ──
        List<Expense> allExpenses = tripIds.stream()
                .flatMap(tId -> expenseRepository
                        .findByTripId(tId).stream())
                .collect(Collectors.toList());

        double totalSpent = allExpenses.stream()
                .mapToDouble(e -> e.getAmount() != null
                        ? e.getAmount() : 0)
                .sum();

        res.setTotalExpenses(round(totalSpent));
        res.setTotalAmountSpent(round(totalSpent));
        res.setTotalAmountRemaining(
                round(totalBudget - totalSpent));

        // Category wise expenses
        Map<String, Double> expByCategory =
                new LinkedHashMap<>();
        for (Expense.ExpenseCategory cat :
                Expense.ExpenseCategory.values()) {
            double catTotal = allExpenses.stream()
                    .filter(e -> e.getCategory() == cat)
                    .mapToDouble(e -> e.getAmount() != null
                            ? e.getAmount() : 0)
                    .sum();
            expByCategory.put(cat.name(), round(catTotal));
        }
        res.setExpensesByCategory(expByCategory);

        // ── Destinations ──
        List<String> destinations = trips.stream()
                .map(Trip::getDestination)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        res.setTopDestinations(
                destinations.stream()
                        .limit(5)
                        .collect(Collectors.toList()));
        res.setTotalDestinationsVisited(
                (long) destinations.size());

        // ── Activities ──
        List<Activity> allActivities = tripIds.stream()
                .flatMap(tId ->
                        itineraryRepository
                                .findByTripId(tId)
                                .stream()
                                .flatMap(iti ->
                                        activityRepository
                                                .findByItineraryId(
                                                        iti.getId())
                                                .stream()))
                .collect(Collectors.toList());

        res.setTotalActivities((long) allActivities.size());

        Map<String, Long> actByType = new LinkedHashMap<>();
        for (Activity.ActivityType type :
                Activity.ActivityType.values()) {
            long count = allActivities.stream()
                    .filter(a -> a.getActivityType() == type)
                    .count();
            actByType.put(type.name(), count);
        }
        res.setActivitiesByType(actByType);

        // ── Groups ──
        List<Group> createdGroups =
                groupRepository.findByCreatedById(userId);
        List<GroupMember> memberOf =
                groupMemberRepository.findByUserId(userId);

        res.setTotalGroups((long) (createdGroups.size()
                + memberOf.size()));
        res.setGroupsCreated((long) createdGroups.size());
        res.setGroupsJoined((long) memberOf.size());

        // ── Documents ──
        List<TripDocument> allDocs = tripIds.stream()
                .flatMap(tId -> documentRepository
                        .findByTripId(tId).stream())
                .collect(Collectors.toList());

        res.setTotalDocuments((long) allDocs.size());
        res.setTotalPhotos(allDocs.stream()
                .filter(d -> d.getDocumentType()
                        == TripDocument.DocumentType.PHOTO)
                .count());

        // ── Monthly Trips ──
        Map<String, Long> tripsByMonth =
                new LinkedHashMap<>();
        DateTimeFormatter fmt =
                DateTimeFormatter.ofPattern("MMM yyyy");

        trips.stream()
                .filter(t -> t.getStartDate() != null)
                .forEach(t -> {
                    String month = t.getStartDate().format(fmt);
                    tripsByMonth.merge(month, 1L, Long::sum);
                });

        res.setTripsByMonth(tripsByMonth);

        return res;
    }

    // ============================================================
    // EXPENSE REPORT — Per Trip
    // ============================================================

    public ExpenseReportResponse getExpenseReport(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        ExpenseReportResponse res = new ExpenseReportResponse();
        res.setTripId(tripId);
        res.setTripTitle(trip.getTitle());
        res.setDestination(trip.getDestination());

        List<Expense> expenses =
                expenseRepository.findByTripId(tripId);

        double totalSpent = expenses.stream()
                .mapToDouble(e -> e.getAmount() != null
                        ? e.getAmount() : 0)
                .sum();

        // Budget
        double totalBudget = 0;
        var budgetOpt =
                budgetRepository.findByTripId(tripId);
        if (budgetOpt.isPresent()) {
            totalBudget = budgetOpt.get().getTotalAmount();
        }

        res.setTotalBudget(round(totalBudget));
        res.setTotalSpent(round(totalSpent));
        res.setTotalRemaining(
                round(totalBudget - totalSpent));
        res.setSpentPercentage(totalBudget > 0
                ? round((totalSpent / totalBudget) * 100)
                : 0.0);

        // Category breakdown
        Map<String, Double> catBreakdown =
                new LinkedHashMap<>();
        Map<String, Long> catCount =
                new LinkedHashMap<>();

        for (Expense.ExpenseCategory cat :
                Expense.ExpenseCategory.values()) {
            double catTotal = expenses.stream()
                    .filter(e -> e.getCategory() == cat)
                    .mapToDouble(e -> e.getAmount() != null
                            ? e.getAmount() : 0)
                    .sum();
            long count = expenses.stream()
                    .filter(e -> e.getCategory() == cat)
                    .count();
            catBreakdown.put(cat.name(), round(catTotal));
            catCount.put(cat.name(), count);
        }

        res.setCategoryBreakdown(catBreakdown);
        res.setCategoryCount(catCount);

        // Top 5 expenses
        List<ExpenseReportResponse.ExpenseItem> topExpenses =
                expenses.stream()
                        .filter(e -> e.getAmount() != null)
                        .sorted((a, b) -> Double.compare(
                                b.getAmount(), a.getAmount()))
                        .limit(5)
                        .map(e -> {
                            ExpenseReportResponse.ExpenseItem item =
                                    new ExpenseReportResponse
                                            .ExpenseItem();
                            item.setDescription(
                                    e.getDescription());
                            item.setAmount(e.getAmount());
                            item.setCategory(
                                    e.getCategory() != null
                                    ? e.getCategory().name()
                                    : "OTHER");
                            item.setDate(e.getExpenseDate()
                                    != null
                                    ? e.getExpenseDate()
                                            .toString()
                                    : "");
                            item.setPaidBy(e.getPaidBy()
                                    != null
                                    ? e.getPaidBy().getName()
                                    : "");
                            return item;
                        })
                        .collect(Collectors.toList());

        res.setTopExpenses(topExpenses);

        // Daily spending
        Map<String, Double> dailySpending =
                new LinkedHashMap<>();
        expenses.stream()
                .filter(e -> e.getExpenseDate() != null
                        && e.getAmount() != null)
                .forEach(e -> {
                    String date =
                            e.getExpenseDate().toString();
                    dailySpending.merge(
                            date, e.getAmount(), Double::sum);
                });
        res.setDailySpending(dailySpending);

        // Shared vs personal
        double sharedTotal = expenses.stream()
                .filter(e -> Boolean.TRUE
                        .equals(e.getIsShared())
                        && e.getAmount() != null)
                .mapToDouble(Expense::getAmount)
                .sum();

        double personalTotal = expenses.stream()
                .filter(e -> !Boolean.TRUE
                        .equals(e.getIsShared())
                        && e.getAmount() != null)
                .mapToDouble(Expense::getAmount)
                .sum();

        res.setSharedExpensesTotal(round(sharedTotal));
        res.setPersonalExpensesTotal(round(personalTotal));

        return res;
    }

    // ============================================================
    // ADMIN ANALYTICS
    // ============================================================

    public AdminAnalyticsResponse getAdminAnalytics() {
        User user = getCurrentUser();

        // Only admin can access
        if (user.getRole().getRoleName()
                != Role.RoleName.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        AdminAnalyticsResponse res =
                new AdminAnalyticsResponse();

        // ── Users ──
        List<User> allUsers = userRepository.findAll();
        res.setTotalUsers((long) allUsers.size());
        res.setActiveUsers(allUsers.stream()
                .filter(u -> Boolean.TRUE
                        .equals(u.getIsActive()))
                .count());

        Map<String, Long> usersByRole =
                new LinkedHashMap<>();
        for (Role.RoleName roleName : Role.RoleName.values()) {
            long count = allUsers.stream()
                    .filter(u -> u.getRole() != null
                            && u.getRole().getRoleName()
                                    == roleName)
                    .count();
            usersByRole.put(roleName.name(), count);
        }
        res.setUsersByRole(usersByRole);

        // New users by month
        Map<String, Long> newUsersByMonth =
                new LinkedHashMap<>();
        DateTimeFormatter fmt =
                DateTimeFormatter.ofPattern("MMM yyyy");
        allUsers.stream()
                .filter(u -> u.getCreatedAt() != null)
                .forEach(u -> {
                    String month = u.getCreatedAt()
                            .format(fmt);
                    newUsersByMonth.merge(
                            month, 1L, Long::sum);
                });
        res.setNewUsersByMonth(newUsersByMonth);

        // ── Trips ──
        List<Trip> allTrips = tripRepository.findAll();
        res.setTotalTrips((long) allTrips.size());
        res.setTotalItineraries(
                itineraryRepository.count());
        res.setTotalActivities(
                activityRepository.count());

        Map<String, Long> tripsByStatus =
                new LinkedHashMap<>();
        for (Trip.TripStatus status :
                Trip.TripStatus.values()) {
            long count = allTrips.stream()
                    .filter(t -> t.getStatus() == status)
                    .count();
            tripsByStatus.put(status.name(), count);
        }
        res.setTripsByStatus(tripsByStatus);

        // ── Expenses ──
        List<Expense> allExpenses =
                expenseRepository.findAll();
        double totalExp = allExpenses.stream()
                .mapToDouble(e -> e.getAmount() != null
                        ? e.getAmount() : 0)
                .sum();
        res.setTotalExpensesOnPlatform(round(totalExp));

        Map<String, Double> expByCat =
                new LinkedHashMap<>();
        for (Expense.ExpenseCategory cat :
                Expense.ExpenseCategory.values()) {
            double catTotal = allExpenses.stream()
                    .filter(e -> e.getCategory() == cat)
                    .mapToDouble(e -> e.getAmount() != null
                            ? e.getAmount() : 0)
                    .sum();
            expByCat.put(cat.name(), round(catTotal));
        }
        res.setExpensesByCategory(expByCat);

        // ── Destinations ──
        Map<String, Long> tripsByDest =
                new LinkedHashMap<>();
        allTrips.stream()
                .filter(t -> t.getDestination() != null)
                .forEach(t -> tripsByDest.merge(
                        t.getDestination(), 1L, Long::sum));

        // Sort by count
        Map<String, Long> sortedDest = tripsByDest
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>
                        comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));

        res.setTripsByDestination(sortedDest);
        res.setPopularDestinations(
                new ArrayList<>(sortedDest.keySet()));

        // ── Groups ──
        res.setTotalGroups(groupRepository.count());
        res.setTotalGroupMembers(
                groupMemberRepository.count());

        // ── Documents ──
        List<TripDocument> allDocs =
                documentRepository.findAll();
        res.setTotalDocuments((long) allDocs.size());
        res.setTotalPhotos(allDocs.stream()
                .filter(d -> d.getDocumentType()
                        == TripDocument.DocumentType.PHOTO)
                .count());

        // ── Notifications ──
        res.setTotalNotifications(
                notificationRepository.count());
        res.setUnreadNotifications(
                notificationRepository
                        .countByUserIdAndIsRead(
                                user.getId(), false));

        return res;
    }
}