import express, { type Router } from "express";
import {
  getMemmbers,
  registerMember,
} from "../../../controllers/auth/member.controllers.ts";

const router: Router = express.Router();
router.post("/register", registerMember);
router.get("/", getMemmbers);
export default router;
