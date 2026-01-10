package com.example.demo.services;

import com.example.demo.model.*;
import com.example.demo.repositories.ScheduledOperationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class MachineSchedulerService {

    private final ScheduledOperationRepository scheduledOperationRepository;
    private final MachineService machineService;
    private final ScheduledErrorService scheduledErrorService;

    public MachineSchedulerService(ScheduledOperationRepository repo,
                                   MachineService machineService,
                                   ScheduledErrorService scheduledErrorService) {
        this.scheduledOperationRepository = repo;
        this.machineService = machineService;
        this.scheduledErrorService = scheduledErrorService;
    }

    @Scheduled(fixedDelay = 1000)
    public void runDueOperations() {
        Instant now = Instant.now();

        List<ScheduledOperation> due = scheduledOperationRepository
                .findByStatusAndExecuteAtLessThanEqual(ScheduleStatus.PENDING, now);

        for (ScheduledOperation op : due) {
            tryExecute(op);
        }
    }

    private void tryExecute(ScheduledOperation op) {
        Machine m = op.getMachine();


        String fail = machineService.tryStartScheduledOperation(m.getId(), op.getOperation(), op.getId());

        if (fail == null) {
            op.setStatus(ScheduleStatus.RUNNING);
            scheduledOperationRepository.save(op);
        } else {
            op.setStatus(ScheduleStatus.FAILED);
            op.setFailReason(fail);
            scheduledOperationRepository.save(op);

            scheduledErrorService.log(m, op.getOperation(), fail, op.getExecuteAt());
        }
    }
}
