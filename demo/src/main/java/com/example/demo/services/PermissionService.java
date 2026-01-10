package com.example.demo.services;

import com.example.demo.model.Permission;
import com.example.demo.repositories.PermissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public List<Permission> all() {
        return permissionRepository.findAll();
    }
}
