package com.example.demo.controllers;

import com.example.demo.model.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.requests.LoginRequest;
import com.example.demo.requests.RegisterRequest;
import com.example.demo.responses.LoginResponse;
import com.example.demo.security.AuthContext;
import com.example.demo.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String token = authService.login(req.email, req.password);
        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid credentials"));
        }

        User user = userRepository.findByEmail(req.email).orElseThrow();

        LoginResponse resp = new LoginResponse();
        resp.success = true;
        resp.message = "Login successful";
        resp.token = token;

        LoginResponse.UserInfo ui = new LoginResponse.UserInfo();
        ui.id = user.getId();
        ui.fullName = user.getFullName();
        ui.email = user.getEmail();
        ui.permissions = user.getPermissions().stream().map(p -> p.getName()).toList();
        resp.user = ui;

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        boolean ok = authService.register(req.fullName, req.email, req.password);
        if (!ok) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email already in use"));
        }
        return ResponseEntity.status(201).body(Map.of("success", true, "message", "User registered successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logout successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        var auth = AuthContext.get();
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Access denied. No token provided."));
        }

        User user = userRepository.findById(auth.id).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "permissions", user.getPermissions().stream().map(p -> p.getName()).toList()
        ));
    }
}
