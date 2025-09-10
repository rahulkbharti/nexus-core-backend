import express, { Router } from "express";

import adminRouter from "./users/admin.routes";
import staffRouter from "./users/staff.routes";
import memberRouter from "./users/member.routes";
import groupRouter from "./group.routes";
import orgRouter from "./org.routes";
import {
  login,
  logout,
  refreshToken,
  updatePermissions,
} from "../../controllers/auth/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";
import adminMiddleware from "../../middlewares/admin.middlewares";
import superAdminMiddleware from "../../middlewares/superAdmin.middleware";

const router: Router = express.Router();

router.use("/admin", superAdminMiddleware, adminRouter); // Admin routes
router.use("/staff", authMiddleware, adminMiddleware, staffRouter); // Staff routes
router.use("/member", memberRouter); // Member routes
router.use("/group", authMiddleware, adminMiddleware, groupRouter); // Group routes // Only Admin
router.use("/org", authMiddleware, adminMiddleware, orgRouter); // Organization routes // Only Admin

router.post("/:role/login", login); // Login route
router.post("/:role/refresh", refreshToken); // Refresh route
router.post(
  "/permissions/update-permissions",
  authMiddleware,
  updatePermissions
); // Update Permissions route
router.post("/logout", logout); // Logout route

export default router;
