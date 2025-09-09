import express, { type Router } from "express";
import {
  registerAdmin,
  getAdmins,
} from "../../../controllers/auth/admin.controllers";

const router: Router = express.Router();
router.post("/register", registerAdmin);
router.get("/", getAdmins);
export default router;
