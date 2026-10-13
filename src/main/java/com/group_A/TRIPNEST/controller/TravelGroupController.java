package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.TravelGroup;
import com.group_A.TRIPNEST.repository.TravelGroupRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/travel-groups")
public class TravelGroupController {
    private final TravelGroupRepository repository;
    public TravelGroupController(TravelGroupRepository repository) { this.repository = repository; }
    @GetMapping public List<TravelGroup> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<TravelGroup> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<TravelGroup> create(@RequestBody TravelGroup value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<TravelGroup> update(@PathVariable Long id, @RequestBody TravelGroup value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
