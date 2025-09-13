import express, { type Router } from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../../controllers/auth/role.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";
const router: Router = express.Router();
router.post("/create", createRole);
router.get("/", authMiddleware, getRoles);
router.get("/:id", authMiddleware, getRoleById);
router.put("/:id", authMiddleware, updateRole);
router.delete("/:id", authMiddleware, deleteRole);
export default router;
