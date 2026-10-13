package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Payment;
import com.group_A.TRIPNEST.repository.PaymentRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentRepository repository;
    public PaymentController(PaymentRepository repository) { this.repository = repository; }
    @GetMapping public List<Payment> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Payment> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Payment> create(@RequestBody Payment value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody Payment value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
