import express, { type Router } from "express";
import {
  getStaffs,
  registerStaff,
} from "../../../controllers/auth/staff.controllers";
import {
  authMiddleware,
  authorization,
} from "../../../middlewares/auth.middlewares";

const router: Router = express.Router();
router.post("/register", registerStaff);
router.get("/", authMiddleware, authorization(["GET_STAFFS"]), getStaffs);
export default router;
