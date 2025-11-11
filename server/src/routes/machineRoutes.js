import express from "express";
import { getMachines, createMachine, getMachineById, turnOn, turnOff, restart, destroy } from "../controllers/machineController.js";
import { verifyTokenMachine } from "../utils/jwt.js";
import { checkPermission } from "../middleware/permissions.js";

const router = express.Router();

router.post("/", verifyTokenMachine, createMachine);
router.get("/", verifyTokenMachine, getMachines);
router.get("/:id", verifyTokenMachine, getMachineById);
router.post("/:id/turn-on", checkPermission("turnon_machine"), turnOn);
router.post("/:id/turn-off", checkPermission("turnoff_machine"), turnOff);
router.post("/:id/restart", checkPermission("restart_machine"), restart);
router.post("/:id/destroy", checkPermission("destroy_machine"), destroy);
export default router;
