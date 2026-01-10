package com.example.demo.repositories;

import com.example.demo.model.ScheduledError;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduledErrorRepository extends JpaRepository<ScheduledError, Long> {
    List<ScheduledError> findByMachineCreatedById(Long userId);
}
