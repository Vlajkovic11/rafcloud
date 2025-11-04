import express from "express";
import {
    getAllUsers,
    deleteUser,
    getUserById,
    updateUser,
    createUser,
} from "../controllers/userController.js";
import { checkPermission } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", checkPermission("read_user"), getAllUsers);
router.get("/:id", checkPermission("update_user"), getUserById);
router.put("/:id", checkPermission("update_user"), updateUser);
router.delete("/:id", checkPermission("delete_user"), deleteUser);
router.post("/", checkPermission("create_user"), createUser);

export default router;
