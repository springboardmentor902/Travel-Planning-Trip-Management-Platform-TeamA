package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Category;
import com.group_A.TRIPNEST.repository.CategoryRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryRepository repository;
    public CategoryController(CategoryRepository repository) { this.repository = repository; }
    @GetMapping public List<Category> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Category> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Category> create(@RequestBody Category value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
