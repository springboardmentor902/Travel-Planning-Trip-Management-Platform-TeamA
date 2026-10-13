package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Role;
import com.group_A.TRIPNEST.repository.RoleRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/roles")
public class RoleController {
    private final RoleRepository repository;
    public RoleController(RoleRepository repository) { this.repository = repository; }
    @GetMapping public List<Role> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Role> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Role> create(@RequestBody Role value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Role> update(@PathVariable Long id, @RequestBody Role value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
