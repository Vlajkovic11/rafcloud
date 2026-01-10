package com.example.demo.services;

import com.example.demo.model.Permission;
import com.example.demo.model.User;
import com.example.demo.repositories.PermissionRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final BCryptPasswordEncoder encoder;

    public UserService(UserRepository userRepository, PermissionRepository permissionRepository, BCryptPasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.encoder = encoder;
    }

    public List<User> allUsers() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public boolean delete(Long id) {
        if (!userRepository.existsById(id)) return false;
        userRepository.deleteById(id);
        return true;
    }


    public User update(Long id, String fullName, String email, List<String> permissionNames) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return null;

        u.setFullName(fullName);
        u.setEmail(email);

        Set<Permission> perms = new HashSet<>();
        if (permissionNames != null) {
            for (String name : permissionNames) {
                permissionRepository.findByName(name).ifPresent(perms::add);
            }
        }
        u.setPermissions(perms);

        return userRepository.save(u);
    }


    public User create(String fullName, String email, String password, List<Long> permissionIds) {
        String hash = encoder.encode(password);
        User u = new User(fullName, email, hash);

        Set<Permission> perms = new HashSet<>();
        if (permissionIds != null) {
            for (Long pid : permissionIds) {
                permissionRepository.findById(pid).ifPresent(perms::add);
            }
        }
        u.setPermissions(perms);

        return userRepository.save(u);
    }
}
