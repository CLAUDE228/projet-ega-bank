package com.egabank.backend.controller;

import com.egabank.backend.dto.AuthRequest;
import com.egabank.backend.dto.AuthResponse;
import com.egabank.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import com.egabank.backend.repository.UserRepository;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody com.egabank.backend.dto.RegisterRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Object> me() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<com.egabank.backend.entity.AppUser> user = userRepository.findByUsername(username);
        if (user.isEmpty()) return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body("User not found");
        com.egabank.backend.entity.AppUser u = user.get();
        record Profile(String username2, String role, Long clientId) {}
        Long clientId = u.getClient() == null ? null : u.getClient().getId();
        return ResponseEntity.ok(new Profile(u.getUsername(), u.getRole(), clientId));
    }
}
