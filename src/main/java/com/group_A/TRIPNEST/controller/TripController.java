package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Trip;
import com.group_A.TRIPNEST.repository.TripRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/trips")
public class TripController {
    private final TripRepository repository;
    public TripController(TripRepository repository) { this.repository = repository; }
    @GetMapping public List<Trip> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Trip> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Trip> create(@RequestBody Trip value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Trip> update(@PathVariable Long id, @RequestBody Trip value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
