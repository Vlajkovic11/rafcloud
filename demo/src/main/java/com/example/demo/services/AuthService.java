package com.example.demo.services;

import com.example.demo.model.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder encoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return null;

        if (!encoder.matches(password, user.getPassword())) return null;

        return jwtService.generateToken(user.getId(), user.getEmail(), user.getFullName());
    }

    public boolean register(String fullName, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) return false;

        String hash = encoder.encode(password);
        userRepository.save(new User(fullName, email, hash));
        return true;
    }
}
