package com.example.demo.security;

public class AuthUser {
    public final Long id;
    public final String email;
    public final String fullName;

    public AuthUser(Long id, String email, String fullName) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
    }
}