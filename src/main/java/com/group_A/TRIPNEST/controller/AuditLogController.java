package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.AuditLog;
import com.group_A.TRIPNEST.repository.AuditLogRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/audit-logs")
public class AuditLogController {
    private final AuditLogRepository repository;
    public AuditLogController(AuditLogRepository repository) { this.repository = repository; }
    @GetMapping public List<AuditLog> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<AuditLog> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<AuditLog> create(@RequestBody AuditLog value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<AuditLog> update(@PathVariable Long id, @RequestBody AuditLog value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
