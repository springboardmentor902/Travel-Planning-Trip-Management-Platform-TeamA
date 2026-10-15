package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripRepository
        extends JpaRepository<Trip, Long> {

    List<Trip> findByUserId(Long userId);

    // ✅ Trips by status count — DB level
    @Query("SELECT t.status, COUNT(t) " +
           "FROM Trip t " +
           "GROUP BY t.status")
    List<Object[]> countByStatus();

    // ✅ User trips by status
    @Query("SELECT t.status, COUNT(t) " +
           "FROM Trip t " +
           "WHERE t.user.id = :userId " +
           "GROUP BY t.status")
    List<Object[]> countByUserAndStatus(
            @Param("userId") Long userId);

    // ✅ Popular destinations — DB level
    @Query("SELECT t.destination, COUNT(t) " +
           "FROM Trip t " +
           "WHERE t.destination IS NOT NULL " +
           "GROUP BY t.destination " +
           "ORDER BY COUNT(t) DESC")
    List<Object[]> popularDestinations();

    // ✅ User destinations
    @Query("SELECT t.destination, COUNT(t) " +
           "FROM Trip t " +
           "WHERE t.user.id = :userId " +
           "AND t.destination IS NOT NULL " +
           "GROUP BY t.destination " +
           "ORDER BY COUNT(t) DESC")
    List<Object[]> userDestinations(
            @Param("userId") Long userId);

    // ✅ Monthly trip count
    @Query("SELECT FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM'), " +
           "COUNT(t) " +
           "FROM Trip t " +
           "GROUP BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM') " +
           "ORDER BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM')")
    List<Object[]> monthlyTripCount();

    // ✅ User monthly trips
    @Query("SELECT FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM'), " +
           "COUNT(t) " +
           "FROM Trip t " +
           "WHERE t.user.id = :userId " +
           "GROUP BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM') " +
           "ORDER BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM')")
    List<Object[]> userMonthlyTripCount(
            @Param("userId") Long userId);
}