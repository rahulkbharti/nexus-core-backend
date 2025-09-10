import express, { type Router } from "express";
import {
  getStaffs,
  registerStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../../../controllers/auth/staff.controllers";

const router: Router = express.Router();
router.post("/register", registerStaff);
router.get("/", getStaffs);
router.get("/:userId", getStaffById);
router.put("/:userId", updateStaff);
router.delete("/:userId", deleteStaff);
export default router;
