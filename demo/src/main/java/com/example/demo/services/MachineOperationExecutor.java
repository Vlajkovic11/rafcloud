package com.example.demo.services;

import com.example.demo.model.OperationType;
import com.example.demo.model.ScheduleStatus;
import com.example.demo.repositories.MachineRepository;
import com.example.demo.repositories.ScheduledOperationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
public class MachineOperationExecutor {

    private final MachineRepository machineRepository;
    private final ScheduledOperationRepository scheduledOperationRepository;

    public MachineOperationExecutor(MachineRepository machineRepository,
                                    ScheduledOperationRepository scheduledOperationRepository) {
        this.machineRepository = machineRepository;
        this.scheduledOperationRepository = scheduledOperationRepository;
    }

    @Async
    public void run(Long machineId, OperationType op, Long scheduledOpId) {
        int delayMs = ThreadLocalRandom.current().nextInt(10, 16) * 1000;

        try {
            if (op == OperationType.TURN_ON) {
                Thread.sleep(delayMs);
                var m = machineRepository.findById(machineId).orElse(null);
                if (m == null) return;
                m.setState("On");
                machineRepository.save(m);

            } else if (op == OperationType.TURN_OFF) {
                Thread.sleep(delayMs);
                var m = machineRepository.findById(machineId).orElse(null);
                if (m == null) return;
                m.setState("Off");
                machineRepository.save(m);

            } else if (op == OperationType.RESTART) {
                Thread.sleep(delayMs / 2);
                var m1 = machineRepository.findById(machineId).orElse(null);
                if (m1 == null) return;
                m1.setState("Off");
                machineRepository.save(m1);

                Thread.sleep(delayMs / 2);
                var m2 = machineRepository.findById(machineId).orElse(null);
                if (m2 == null) return;
                m2.setState("On");
                machineRepository.save(m2);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {

            var mm = machineRepository.findById(machineId).orElse(null);
            if (mm != null) {
                mm.setBusy(false);
                machineRepository.save(mm);
            }

            if (scheduledOpId != null) {
                var so = scheduledOperationRepository.findById(scheduledOpId).orElse(null);
                if (so != null && so.getStatus() == ScheduleStatus.RUNNING) {
                    so.setStatus(ScheduleStatus.DONE);
                    scheduledOperationRepository.save(so);
                }
            }
        }
    }
}
