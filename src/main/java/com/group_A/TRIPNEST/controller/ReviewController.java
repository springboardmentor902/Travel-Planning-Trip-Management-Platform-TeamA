package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Review;
import com.group_A.TRIPNEST.repository.ReviewRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewRepository repository;
    public ReviewController(ReviewRepository repository) { this.repository = repository; }
    @GetMapping public List<Review> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Review> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Review> create(@RequestBody Review value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Review> update(@PathVariable Long id, @RequestBody Review value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
