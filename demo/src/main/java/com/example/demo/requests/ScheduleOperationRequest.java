package com.example.demo.requests;

import com.example.demo.model.OperationType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class ScheduleOperationRequest {
    @NotNull public OperationType operation;
    @NotNull public Instant executeAt;
}
