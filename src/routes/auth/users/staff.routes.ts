import express, { type Router } from "express";
import {
  getStaffs,
  registerStaff,
} from "../../../controllers/auth/staff.controllers.ts";
import {
  authMiddleware,
  authorization,
} from "../../../middlewares/auth.middlewares.ts";

const router: Router = express.Router();
router.post("/register", registerStaff);
router.get("/", authMiddleware, authorization(["GET_STAFFS"]), getStaffs);
export default router;
