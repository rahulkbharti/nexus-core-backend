import express, { type Router } from "express";
import {
  registerAdmin,
  getAdmins,
  getAdminByUserId,
  updateAdmin,
  deleteAdmin,
} from "../../../controllers/auth/admin.controllers";

const router: Router = express.Router();
router.post("/register", registerAdmin);
router.get("/", getAdmins);
router.get("/:userId", getAdminByUserId);
router.put("/:userId", updateAdmin);
router.delete("/:userId", deleteAdmin);
export default router;
