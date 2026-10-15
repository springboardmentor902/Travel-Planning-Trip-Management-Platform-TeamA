package com.tripnest.backend.repository;

import com.tripnest.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    // ✅ Users by role — DB level
    @Query("SELECT u.role.roleName, COUNT(u) " +
           "FROM User u " +
           "GROUP BY u.role.roleName")
    List<Object[]> countByRole();

    // ✅ Monthly signups
    @Query("SELECT FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM'), " +
           "COUNT(u) " +
           "FROM User u " +
           "GROUP BY FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') " +
           "ORDER BY FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM')")
    List<Object[]> monthlySignups();

    // ✅ Active users count
    @Query("SELECT COUNT(u) FROM User u " +
           "WHERE u.isActive = true")
    Long countActiveUsers();
}