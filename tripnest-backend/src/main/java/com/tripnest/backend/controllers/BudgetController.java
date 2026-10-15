package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.BudgetRequest;
import com.tripnest.backend.dto.BudgetResponse;
import com.tripnest.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    // POST /api/trips/{tripId}/budget — Budget set karo
    @PostMapping("/{tripId}/budget")
    public ResponseEntity<BudgetResponse> createBudget(
            @PathVariable Long tripId,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(
                budgetService.createOrUpdateBudget(tripId, request));
    }

    // GET /api/trips/{tripId}/budget — Budget dekho
    @GetMapping("/{tripId}/budget")
    public ResponseEntity<BudgetResponse> getBudget(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                budgetService.getBudgetByTrip(tripId));
    }

    // PUT /api/trips/{tripId}/budget — Budget update karo
    @PutMapping("/{tripId}/budget")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long tripId,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(
                budgetService.createOrUpdateBudget(tripId, request));
    }

    // GET /api/trips/{tripId}/budget/summary — Summary
    @GetMapping("/{tripId}/budget/summary")
    public ResponseEntity<BudgetResponse> getBudgetSummary(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                budgetService.getBudgetSummary(tripId));
    }

    // DELETE /api/trips/{tripId}/budget — Budget delete
    @DeleteMapping("/{tripId}/budget")
    public ResponseEntity<String> deleteBudget(
            @PathVariable Long tripId) {
        budgetService.deleteBudget(tripId);
        return ResponseEntity.ok("Budget deleted");
    }
}