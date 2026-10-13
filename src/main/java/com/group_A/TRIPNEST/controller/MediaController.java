package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Media;
import com.group_A.TRIPNEST.repository.MediaRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/media")
public class MediaController {
    private final MediaRepository repository;
    public MediaController(MediaRepository repository) { this.repository = repository; }
    @GetMapping public List<Media> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Media> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Media> create(@RequestBody Media value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Media> update(@PathVariable Long id, @RequestBody Media value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
