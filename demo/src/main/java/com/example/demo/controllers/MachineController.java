package com.example.demo.controllers;

import com.example.demo.model.Machine;
import com.example.demo.requests.CreateMachineRequest;
import com.example.demo.security.AuthContext;
import com.example.demo.security.RequiredPermission;
import com.example.demo.services.MachineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @RequiredPermission("create_machine")
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateMachineRequest req) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        Machine m = machineService.createMachine(req.name, auth.id);
        if (m == null) return ResponseEntity.status(500).body(Map.of("error", "Failed to create machine"));
        return ResponseEntity.ok(m);
    }

    @RequiredPermission("search_machine")
    @GetMapping
    public ResponseEntity<?> list() {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        return ResponseEntity.ok(machineService.getMachines(auth.id, auth.email));
    }

    @RequiredPermission("search_machine")
    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        Machine m = machineService.getByIdForUser(id, auth.id, auth.email);
        if (m == null) return ResponseEntity.status(404).body(Map.of("error", "Machine not found"));
        return ResponseEntity.ok(m);
    }

    @RequiredPermission("turnon_machine")
    @PostMapping("/{id}/turn-on")
    public ResponseEntity<?> turnOn(@PathVariable Long id) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        Machine m = machineService.turnOnForUser(id, auth.id, auth.email);
        if (m == null) return ResponseEntity.status(404).body(Map.of("error", "Machine not found"));
        return ResponseEntity.ok(Map.of("message", "Turning on operation started", "machine", m));
    }

    @RequiredPermission("turnoff_machine")
    @PostMapping("/{id}/turn-off")
    public ResponseEntity<?> turnOff(@PathVariable Long id) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        Machine m = machineService.turnOffForUser(id, auth.id, auth.email);
        if (m == null) return ResponseEntity.status(404).body(Map.of("error", "Machine not found"));
        return ResponseEntity.ok(Map.of("message", "Turning off operation started", "machine", m));
    }

    @RequiredPermission("restart_machine")
    @PostMapping("/{id}/restart")
    public ResponseEntity<?> restart(@PathVariable Long id) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        boolean ok = machineService.restartForUser(id, auth.id, auth.email);
        if (!ok) return ResponseEntity.status(404).body(Map.of("error", "Machine not found"));
        return ResponseEntity.ok(Map.of("message", "Error logged for restarting"));
    }

    @RequiredPermission("destroy_machine")
    @PostMapping("/{id}/destroy")
    public ResponseEntity<?> destroy(@PathVariable Long id) {
        var auth = AuthContext.get();
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "No token provided"));

        Machine m = machineService.destroyForUser(id, auth.id, auth.email);
        if (m == null) return ResponseEntity.status(404).body(Map.of("error", "Machine not found"));
        return ResponseEntity.ok(Map.of("message", "Machine destroyed", "machine", m));
    }
}