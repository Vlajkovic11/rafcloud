package com.example.demo.controllers;

import com.example.demo.model.Permission;
import com.example.demo.services.PermissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<Permission> all() {
        return permissionService.all();
    }
}
