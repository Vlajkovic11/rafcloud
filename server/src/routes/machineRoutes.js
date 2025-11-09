import express from "express";
import { getMachines, createMachine, getMachineById, turnOn, turnOff, restart, createError, destroyError } from "../controllers/machineController.js";
import { verifyTokenMachine } from "../utils/jwt.js";

const router = express.Router();

// GET /api/machines
router.post("/", verifyTokenMachine, createMachine);
router.get("/", verifyTokenMachine, getMachines);
router.get("/:id", verifyTokenMachine, getMachineById);
router.post("/:id/turn-on", turnOn);
router.post("/:id/turn-off", turnOff);
router.post("/:id/restart", restart);
router.post("/:id/create-error", createError);
router.post("/:id/destroy", destroyError);

export default router;
