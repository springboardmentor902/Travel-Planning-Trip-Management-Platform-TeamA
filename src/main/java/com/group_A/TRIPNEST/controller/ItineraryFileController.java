package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.ItineraryFile;
import com.group_A.TRIPNEST.repository.ItineraryFileRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/itinerary-files")
public class ItineraryFileController {
    private final ItineraryFileRepository repository;
    public ItineraryFileController(ItineraryFileRepository repository) { this.repository = repository; }
    @GetMapping public List<ItineraryFile> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<ItineraryFile> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<ItineraryFile> create(@RequestBody ItineraryFile value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<ItineraryFile> update(@PathVariable Long id, @RequestBody ItineraryFile value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
