package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Budget;
import com.group_A.TRIPNEST.repository.BudgetRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetRepository repository;
    public BudgetController(BudgetRepository repository) { this.repository = repository; }
    @GetMapping public List<Budget> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Budget> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Budget> create(@RequestBody Budget value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Budget> update(@PathVariable Long id, @RequestBody Budget value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
