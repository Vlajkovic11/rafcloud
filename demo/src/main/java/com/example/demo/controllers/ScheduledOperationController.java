package com.example.demo.controllers;


import com.example.demo.model.ScheduledOperation;
import com.example.demo.requests.ScheduleOperationRequest;
import com.example.demo.security.AuthContext;

import com.example.demo.services.MachineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/api/machines")
public class ScheduledOperationController {

    private final MachineService machineService;

    public ScheduledOperationController(MachineService machineService) {
        this.machineService = machineService;
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<?> schedule(@PathVariable Long id, @Valid @RequestBody ScheduleOperationRequest req) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        ScheduledOperation so = machineService.createScheduledOperationForUser(
                id, auth.id, auth.email, req.operation, req.executeAt
        );

        if (so == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot schedule operation"));
        }

        return ResponseEntity.status(201).body(Map.of(
                "id", so.getId(),
                "machineId", so.getMachine().getId(),
                "operation", so.getOperation().name(),
                "executeAt", so.getExecuteAt(),
                "status", so.getStatus().name()
        ));
    }
}
