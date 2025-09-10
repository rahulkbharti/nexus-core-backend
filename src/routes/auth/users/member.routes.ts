import express, { type Router } from "express";
import {
  getMemmbers,
  registerMember,
  getMemberById,
  updateMember,
  deleteMember,
} from "../../../controllers/auth/member.controller";
import { authMiddleware } from "../../../middlewares/auth.middlewares";

const router: Router = express.Router();
router.post("/register", authMiddleware, registerMember);
router.get("/", authMiddleware, getMemmbers);
router.get("/:userId", authMiddleware, getMemberById);
router.put("/:userId", authMiddleware, updateMember);
router.delete("/:userId", authMiddleware, deleteMember);
export default router;
