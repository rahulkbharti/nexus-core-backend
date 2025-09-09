import express, { Router } from "express";

import adminRouter from "./users/admin.routes";
import staffRouter from "./users/staff.routes";
import memberRouter from "./users/member.routes";
import groupRouter from "./group.routes";
import orgRouter from "./org.routes";
import { login } from "../../controllers/auth/auth.controllers";

const router: Router = express.Router();

router.use("/admin", adminRouter); // Admin routes
router.use("/staff", staffRouter); // Staff routes
router.use("/member", memberRouter); // Member routes
router.use("/group", groupRouter); // Group routes
router.use("/org", orgRouter); // Organization routes

router.post("/:role/login", login); // Login route

export default router;
