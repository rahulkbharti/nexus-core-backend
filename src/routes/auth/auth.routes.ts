import express, { Router } from "express";

import adminRouter from "./users/admin.routes.ts";
import staffRouter from "./users/staff.routes.ts";
import memberRouter from "./users/member.routes.ts";
import groupRouter from "./group.routes.ts";
import orgRouter from "./org.routes.ts";
import { login } from "../../controllers/auth/auth.controllers.ts";

const router: Router = express.Router();

router.use("/admin", adminRouter); // Admin routes
router.use("/staff", staffRouter); // Staff routes
router.use("/member", memberRouter); // Member routes
router.use("/group", groupRouter); // Group routes
router.use("/org", orgRouter); // Organization routes

router.post("/:role/login", login); // Login route

export default router;
