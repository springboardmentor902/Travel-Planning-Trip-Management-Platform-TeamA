package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Activity;
import com.group_A.TRIPNEST.repository.ActivityRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/activities")
public class ActivityController {
    private final ActivityRepository repository;
    public ActivityController(ActivityRepository repository) { this.repository = repository; }
    @GetMapping public List<Activity> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Activity> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Activity> create(@RequestBody Activity value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Activity> update(@PathVariable Long id, @RequestBody Activity value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
