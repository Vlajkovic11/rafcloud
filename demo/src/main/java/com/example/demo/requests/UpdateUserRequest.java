package com.example.demo.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class UpdateUserRequest {
    @NotBlank public String fullName;
    @Email @NotBlank public String email;
    public List<String> permissions;
}