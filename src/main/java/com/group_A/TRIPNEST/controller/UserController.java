package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.User;
import com.group_A.TRIPNEST.repository.UserRepository;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/users")
public class UserController {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    public UserController(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }
    @GetMapping public List<User> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<User> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<User> create(@RequestBody User value) { encodePassword(value); return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); encodePassword(value); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }

    private void encodePassword(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
    }
}
