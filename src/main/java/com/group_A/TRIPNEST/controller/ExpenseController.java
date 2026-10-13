package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Expense;
import com.group_A.TRIPNEST.repository.ExpenseRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseRepository repository;
    public ExpenseController(ExpenseRepository repository) { this.repository = repository; }
    @GetMapping public List<Expense> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Expense> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Expense> create(@RequestBody Expense value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Expense> update(@PathVariable Long id, @RequestBody Expense value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
