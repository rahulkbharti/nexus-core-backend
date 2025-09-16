import express, { Router } from "express";

import adminRouter from "./users/admin.routes";
import staffRouter from "./users/staff.routes";
import memberRouter from "./users/member.routes";
import roleRouter from "./role.routes";
import orgRouter from "./org.routes";
import {
  changePassword,
  GetPermissions,
  login,
  logout,
  refreshToken,
  sendOtp,
  updateRolePermissions,
  updateStaffPermissions,
  verifyOtp,
} from "../../controllers/auth/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";
import adminMiddleware from "../../middlewares/admin.middlewares";
import superAdminMiddleware from "../../middlewares/superAdmin.middleware";

const router: Router = express.Router();

router.use("/admin", superAdminMiddleware, adminRouter); // Admin routes
router.use("/staff", authMiddleware, adminMiddleware, staffRouter); // Staff routes
router.use("/member", memberRouter); // Member routes
router.use("/role", authMiddleware, adminMiddleware, roleRouter); // Role routes // Only Admin
router.use("/org", authMiddleware, adminMiddleware, orgRouter); // Organization routes // Only Admin

router.post("/login", login); // Login route
router.post("/refresh", refreshToken); // Refresh route

router.get("/permissions", authMiddleware, GetPermissions);
router.post(
  "/permissions/update-permissions",
  authMiddleware,
  updateStaffPermissions
); // Update Permissions route
router.post(
  "/permissions/update-permissions-role",
  authMiddleware,
  updateRolePermissions
); // Update Permissions route
router.post("/logout", logout); // Logout route

// Change Password route
router.post("/change-password", authMiddleware, changePassword);
// Forget Password route
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
export default router;
