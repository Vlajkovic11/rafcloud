package com.example.demo.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class CreateUserRequest {
    @NotBlank public String fullName;
    @Email @NotBlank public String email;
    @NotBlank public String password;

    public List<Long> permissions;
}