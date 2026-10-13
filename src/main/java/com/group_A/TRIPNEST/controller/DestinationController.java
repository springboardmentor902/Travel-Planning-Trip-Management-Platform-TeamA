package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Destination;
import com.group_A.TRIPNEST.repository.DestinationRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/destinations")
public class DestinationController {
    private final DestinationRepository repository;
    public DestinationController(DestinationRepository repository) { this.repository = repository; }
    @GetMapping public List<Destination> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Destination> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Destination> create(@RequestBody Destination value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Destination> update(@PathVariable Long id, @RequestBody Destination value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
