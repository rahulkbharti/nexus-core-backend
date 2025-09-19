import express, { type Router } from "express";
import {
  verifyEmail,
  verifyOTP,
  registerAdmin,
  getAdmins,
  getAdminByUserId,
  updateAdmin,
  deleteAdmin,
} from "../../../controllers/auth/admin.controller";

const router: Router = express.Router();
router.post("/verify-email", verifyEmail); // VERIFY EMAIL
router.post("/verify-otp", verifyOTP); // VERIFY OTP
router.post("/register", registerAdmin);
router.get("/", getAdmins);
router.get("/:userId", getAdminByUserId);
router.put("/:userId", updateAdmin);
router.delete("/:userId", deleteAdmin);
export default router;
