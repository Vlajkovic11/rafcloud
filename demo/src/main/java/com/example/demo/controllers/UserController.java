package com.example.demo.controllers;

import com.example.demo.model.User;
import com.example.demo.requests.CreateUserRequest;
import com.example.demo.requests.UpdateUserRequest;
import com.example.demo.security.RequiredPermission;
import com.example.demo.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @RequiredPermission("read_user")
    @GetMapping
    public ResponseEntity<?> all() {
        var formatted = userService.allUsers().stream().map(u -> Map.of(
                "id", u.getId(),
                "fullName", u.getFullName(),
                "email", u.getEmail(),
                "permissions", u.getPermissions().stream().map(p -> p.getName()).toList()
        )).toList();

        return ResponseEntity.ok(Map.of("users", formatted));
    }

    @RequiredPermission("read_user")
    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id) {
        User u = userService.getById(id);
        if (u == null) return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "fullName", u.getFullName(),
                "email", u.getEmail(),
                "permissions", u.getPermissions().stream().map(p -> p.getName()).toList()
        ));
    }

    @RequiredPermission("update_user")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
        User updated = userService.update(id, req.fullName, req.email, req.permissions);
        if (updated == null) return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "fullName", updated.getFullName(),
                "email", updated.getEmail(),
                "permissions", updated.getPermissions().stream().map(p -> p.getName()).toList()
        ));
    }

    @RequiredPermission("delete_user")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean ok = userService.delete(id);
        if (!ok) return ResponseEntity.status(500).body(Map.of("error", "Failed to delete user"));
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @RequiredPermission("create_user")
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest req) {
        try {
            User created = userService.create(req.fullName, req.email, req.password, req.permissions);
            return ResponseEntity.status(201).body(Map.of(
                    "id", created.getId(),
                    "fullName", created.getFullName(),
                    "email", created.getEmail(),
                    "permissions", created.getPermissions().stream().map(p -> p.getName()).toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create user"));
        }
    }
}
