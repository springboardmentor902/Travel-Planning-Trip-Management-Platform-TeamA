package com.tripnest.backend.controllers;

import com.tripnest.backend.dto.ExpenseRequest;
import com.tripnest.backend.dto.ExpenseResponse;
import com.tripnest.backend.dto.ExpenseSummaryResponse;
import com.tripnest.backend.dto.SettlementResponse;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.service.ExpenseService;
import com.tripnest.backend.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final SettlementService settlementService;

    // POST /api/trips/{tripId}/expenses
    @PostMapping("/trips/{tripId}/expenses")
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(
                expenseService.addExpense(tripId, request));
    }

    // GET /api/trips/{tripId}/expenses
    @GetMapping("/trips/{tripId}/expenses")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                expenseService.getExpensesByTrip(tripId));
    }

    // GET /api/trips/{tripId}/expenses/summary
    @GetMapping("/trips/{tripId}/expenses/summary")
    public ResponseEntity<ExpenseSummaryResponse> getSummary(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                expenseService.getExpenseSummary(tripId));
    }

    // GET /api/trips/{tripId}/expenses/category?cat=FOOD
    @GetMapping("/trips/{tripId}/expenses/category")
    public ResponseEntity<List<ExpenseResponse>> getByCategory(
            @PathVariable Long tripId,
            @RequestParam Expense.ExpenseCategory cat) {
        return ResponseEntity.ok(
                expenseService.getExpensesByCategory(
                        tripId, cat));
    }

    // GET /api/trips/{tripId}/settlement
    @GetMapping("/trips/{tripId}/settlement")
    public ResponseEntity<SettlementResponse> getSettlement(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                settlementService.calculateSettlement(tripId));
    }

    // PUT /api/expenses/{id}
    @PutMapping("/expenses/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(
                expenseService.updateExpense(id, request));
    }

    // DELETE /api/expenses/{id}
    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<String> deleteExpense(
            @PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok("Expense deleted");
    }
}