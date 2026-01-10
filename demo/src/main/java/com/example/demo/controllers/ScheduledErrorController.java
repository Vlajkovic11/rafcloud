package com.example.demo.controllers;

import com.example.demo.repositories.ScheduledErrorRepository;
import com.example.demo.security.AuthContext;
import com.example.demo.security.RequiredPermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/errors")
public class ScheduledErrorController {

    private final ScheduledErrorRepository scheduledErrorRepository;

    public ScheduledErrorController(ScheduledErrorRepository scheduledErrorRepository) {
        this.scheduledErrorRepository = scheduledErrorRepository;
    }

    @RequiredPermission("search_machine")
    @GetMapping("/scheduled")
    public ResponseEntity<?> scheduledErrors() {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        boolean isAdmin = "admin@rafcloud".equals(auth.email);

        var list = isAdmin
                ? scheduledErrorRepository.findAll()
                : scheduledErrorRepository.findByMachineCreatedById(auth.id);

        var formatted = list.stream().map(e -> Map.of(
                "id", e.getId(),
                "machineId", e.getMachine().getId(),
                "machineName", e.getMachine().getName(),
                "operation", e.getOperation().name(),
                "message", e.getMessage(),
                "executeAt", e.getExecuteAt(),
                "createdAt", e.getCreatedAt()
        )).toList();

        return ResponseEntity.ok(Map.of("errors", formatted));
    }
}
