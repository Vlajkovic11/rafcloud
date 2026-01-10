package com.example.demo.repositories;

import com.example.demo.model.ScheduledOperation;
import com.example.demo.model.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ScheduledOperationRepository extends JpaRepository<ScheduledOperation, Long> {
    List<ScheduledOperation> findByStatusAndExecuteAtLessThanEqual(ScheduleStatus status, Instant time);
}
