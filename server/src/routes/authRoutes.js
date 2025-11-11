import express from "express";
import { loginUser, registerUser, logoutUser, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateToken, getMe);

export default router;