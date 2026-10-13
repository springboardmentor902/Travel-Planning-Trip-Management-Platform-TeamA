package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Itinerary;
import com.group_A.TRIPNEST.repository.ItineraryRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/itineraries")
public class ItineraryController {
    private final ItineraryRepository repository;
    public ItineraryController(ItineraryRepository repository) { this.repository = repository; }
    @GetMapping public List<Itinerary> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Itinerary> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Itinerary> create(@RequestBody Itinerary value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Itinerary> update(@PathVariable Long id, @RequestBody Itinerary value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
