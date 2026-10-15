package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository
        extends JpaRepository<Expense, Long> {

    List<Expense> findByTripId(Long tripId);

    List<Expense> findByTripIdAndCategory(
            Long tripId, Expense.ExpenseCategory category);

    // ✅ Category wise sum — DB level
    @Query("SELECT e.category, SUM(e.amount) " +
           "FROM Expense e " +
           "WHERE e.trip.user.id = :userId " +
           "GROUP BY e.category")
    List<Object[]> sumByUserAndCategory(
            @Param("userId") Long userId);

    // ✅ Category wise sum per trip
    @Query("SELECT e.category, SUM(e.amount) " +
           "FROM Expense e " +
           "WHERE e.trip.id = :tripId " +
           "GROUP BY e.category")
    List<Object[]> sumByTripAndCategory(
            @Param("tripId") Long tripId);

    // ✅ Monthly spending trend
    @Query("SELECT FUNCTION('TO_CHAR', e.expenseDate, 'YYYY-MM'), " +
           "SUM(e.amount) " +
           "FROM Expense e " +
           "WHERE e.trip.user.id = :userId " +
           "GROUP BY FUNCTION('TO_CHAR', e.expenseDate, 'YYYY-MM') " +
           "ORDER BY FUNCTION('TO_CHAR', e.expenseDate, 'YYYY-MM')")
    List<Object[]> monthlySpendingByUser(
            @Param("userId") Long userId);

    // ✅ Platform wide category sum
    @Query("SELECT e.category, SUM(e.amount) " +
           "FROM Expense e " +
           "GROUP BY e.category")
    List<Object[]> platformCategorySum();

    // ✅ Total spent per trip
    @Query("SELECT e.trip.id, SUM(e.amount) " +
           "FROM Expense e " +
           "GROUP BY e.trip.id")
    List<Object[]> totalSpentPerTrip();
}