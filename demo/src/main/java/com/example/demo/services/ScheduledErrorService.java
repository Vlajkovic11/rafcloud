package com.example.demo.services;

import com.example.demo.model.Machine;
import com.example.demo.model.OperationType;
import com.example.demo.model.ScheduledError;
import com.example.demo.repositories.ScheduledErrorRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ScheduledErrorService {

    private final ScheduledErrorRepository scheduledErrorRepository;

    public ScheduledErrorService(ScheduledErrorRepository scheduledErrorRepository) {
        this.scheduledErrorRepository = scheduledErrorRepository;
    }

    public void log(Machine m, OperationType op, String message, Instant executeAt) {
        ScheduledError err = new ScheduledError();
        err.setMachine(m);
        err.setOperation(op);
        err.setMessage(message);
        err.setExecuteAt(executeAt);
        scheduledErrorRepository.save(err);
    }
}
