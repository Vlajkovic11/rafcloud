package com.example.demo.requests;

import jakarta.validation.constraints.NotBlank;

public class CreateMachineRequest {
    @NotBlank public String name;
}