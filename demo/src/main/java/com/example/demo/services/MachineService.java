package com.example.demo.services;

import com.example.demo.model.*;
import com.example.demo.repositories.ErrorLogRepository;
import com.example.demo.repositories.MachineRepository;
import com.example.demo.repositories.ScheduledOperationRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class MachineService {

    private final MachineRepository machineRepository;
    private final ErrorLogRepository errorLogRepository;
    private final UserRepository userRepository;
    private final ScheduledOperationRepository scheduledOperationRepository;
    private final MachineOperationExecutor executor;

    public MachineService(MachineRepository machineRepository,
                          ErrorLogRepository errorLogRepository,
                          UserRepository userRepository,
                          ScheduledOperationRepository scheduledOperationRepository,
                          MachineOperationExecutor executor) {
        this.machineRepository = machineRepository;
        this.errorLogRepository = errorLogRepository;
        this.userRepository = userRepository;
        this.scheduledOperationRepository = scheduledOperationRepository;
        this.executor = executor;
    }

    private boolean isAdmin(String email) {
        return "admin@rafcloud".equals(email);
    }

    private Machine getAccessibleMachine(Long machineId, Long authUserId, String authEmail) {
        if (isAdmin(authEmail)) {
            return machineRepository.findById(machineId).orElse(null);
        }
        return machineRepository.findByIdAndCreatedById(machineId, authUserId).orElse(null);
    }

    public List<Machine> getMachines(Long authUserId, String authEmail) {
        if (isAdmin(authEmail)) return machineRepository.findAll();
        return machineRepository.findByCreatedById(authUserId);
    }

    public Machine createMachine(String name, Long userId) {
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) return null;

        Machine m = new Machine();
        m.setName(name);
        m.setState("Off");
        m.setCreatedBy(u);
        m.setActive(true);
        m.setBusy(false);
        return machineRepository.save(m);
    }

    public Machine getByIdForUser(Long id, Long authUserId, String authEmail) {
        return getAccessibleMachine(id, authUserId, authEmail);
    }


    // Manual operations (user)


    public Machine turnOnForUser(Long id, Long uid, String email) {
        Machine m = getAccessibleMachine(id, uid, email);
        if (m == null) return null;

        if (m.isBusy()) return null;
        if (!m.isActive()) return null;
        if (!"Off".equals(m.getState())) return null;

        m.setBusy(true);
        m = machineRepository.save(m);

        executor.run(m.getId(), OperationType.TURN_ON, null);
        return m;
    }

    public Machine turnOffForUser(Long id, Long uid, String email) {
        Machine m = getAccessibleMachine(id, uid, email);
        if (m == null) return null;

        if (m.isBusy()) return null;
        if (!m.isActive()) return null;
        if (!"On".equals(m.getState())) return null;

        m.setBusy(true);
        m = machineRepository.save(m);

        executor.run(m.getId(), OperationType.TURN_OFF, null);
        return m;
    }

    public boolean restartForUser(Long id, Long uid, String email) {
        Machine m = getAccessibleMachine(id, uid, email);
        if (m == null) return false;

        if (m.isBusy()) return false;
        if (!m.isActive()) return false;
        if (!"On".equals(m.getState())) return false;

        m.setBusy(true);
        machineRepository.save(m);

        executor.run(m.getId(), OperationType.RESTART, null);
        return true;
    }

    public Machine destroyForUser(Long id, Long authUserId, String authEmail) {
        Machine m = getAccessibleMachine(id, authUserId, authEmail);
        if (m == null) return null;

        m.setActive(false);
        m = machineRepository.save(m);

        errorLogRepository.save(new ErrorLog("Error while destroying", m));
        return m;
    }


    // Scheduling: start operation


    public String tryStartScheduledOperation(Long machineId, OperationType op, Long scheduledOpId) {
        Machine m = machineRepository.findById(machineId).orElse(null);
        if (m == null) return "Machine not found";
        if (!m.isActive()) return "Machine is inactive";
        if (m.isBusy()) return "Machine is busy";

        String state = m.getState();
        if (op == OperationType.TURN_ON && !"Off".equals(state)) return "TURN_ON requires state Off";
        if (op == OperationType.TURN_OFF && !"On".equals(state)) return "TURN_OFF requires state On";
        if (op == OperationType.RESTART && !"On".equals(state)) return "RESTART requires state On";

        m.setBusy(true);
        machineRepository.save(m);

        executor.run(machineId, op, scheduledOpId);
        return null;
    }


    // Scheduling: create scheduled operation (API)


    public ScheduledOperation createScheduledOperationForUser(
            Long machineId,
            Long authUserId,
            String authEmail,
            OperationType op,
            Instant executeAt
    ) {
        Machine m = getAccessibleMachine(machineId, authUserId, authEmail);
        if (m == null) return null;
        if (!m.isActive()) return null;

        if (executeAt == null || executeAt.isBefore(Instant.now())) return null;

        User u = userRepository.findById(authUserId).orElse(null);
        if (u == null) return null;

        String neededPerm =
                (op == OperationType.TURN_ON) ? "turnon_machine" :
                        (op == OperationType.TURN_OFF) ? "turnoff_machine" :
                                "restart_machine";

        boolean has = u.getPermissions().stream().anyMatch(p -> p.getName().equals(neededPerm));
        if (!has) return null;

        ScheduledOperation so = new ScheduledOperation();
        so.setMachine(m);
        so.setCreatedBy(u);
        so.setOperation(op);
        so.setExecuteAt(executeAt);
        so.setStatus(ScheduleStatus.PENDING);

        return scheduledOperationRepository.save(so);
    }
}
