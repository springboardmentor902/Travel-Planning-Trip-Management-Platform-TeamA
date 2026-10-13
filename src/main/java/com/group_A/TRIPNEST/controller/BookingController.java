package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.entity.Booking;
import com.group_A.TRIPNEST.repository.BookingRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/bookings")
public class BookingController {
    private final BookingRepository repository;
    public BookingController(BookingRepository repository) { this.repository = repository; }
    @GetMapping public List<Booking> findAll() { return repository.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Booking> findById(@PathVariable Long id) { return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @PostMapping public ResponseEntity<Booking> create(@RequestBody Booking value) { return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(value)); }
    @PutMapping("/{id}") public ResponseEntity<Booking> update(@PathVariable Long id, @RequestBody Booking value) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); value.setId(id); return ResponseEntity.ok(repository.save(value)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { if (!repository.existsById(id)) return ResponseEntity.notFound().build(); repository.deleteById(id); return ResponseEntity.noContent().build(); }
}
