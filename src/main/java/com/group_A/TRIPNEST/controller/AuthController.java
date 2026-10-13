package com.group_A.TRIPNEST.controller;

import com.group_A.TRIPNEST.dto.AuthRequest;
import com.group_A.TRIPNEST.dto.AuthResponse;
import com.group_A.TRIPNEST.dto.RegisterRequest;
import com.group_A.TRIPNEST.entity.User;
import com.group_A.TRIPNEST.repository.UserRepository;
import com.group_A.TRIPNEST.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    public AuthController(UserRepository users, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByEmail(request.email())) return ResponseEntity.status(HttpStatus.CONFLICT).build();
        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhoneNumber(request.phoneNumber());
        user.setPreferredCurrency(request.preferredCurrency());
        user = users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseFor(user, "Registration successful"));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = users.findByEmail(email).orElseThrow();
        return responseFor(user, "Login successful");
    }

    private AuthResponse responseFor(User user, String message) {
        return new AuthResponse(true, message, user.getEmail(), jwtService.generateToken(user),
                "Bearer", jwtService.getExpirationMs() / 1000);
    }
}
