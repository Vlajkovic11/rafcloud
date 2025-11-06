import express from "express";
import { getMachines, createMachine } from "../controllers/machineController.js";
import { verifyTokenMachine } from "../utils/jwt.js";

const router = express.Router();

// GET /api/machines
router.post("/", verifyTokenMachine, createMachine);
router.get("/", verifyTokenMachine, getMachines);

export default router;
