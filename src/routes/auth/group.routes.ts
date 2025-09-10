import express, { type Router } from "express";
import {
  deleteGroup,
  getGroupById,
  getGroups,
  groupCreate,
  updateGroup,
} from "../../controllers/auth/group.controllers";
import { authMiddleware } from "../../middlewares/auth.middlewares";
const router: Router = express.Router();
router.post("/create", groupCreate);
router.get("/", authMiddleware, getGroups);
router.get("/:id", authMiddleware, getGroupById);
router.put("/:id", authMiddleware, updateGroup);
router.delete("/:id", authMiddleware, deleteGroup);
export default router;
