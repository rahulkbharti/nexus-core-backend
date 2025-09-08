import express, { type Router } from "express";
import { createOrg, getOrgs } from "../../controllers/auth/org.controllers.ts";

const router: Router = express.Router();
router.post("/register", createOrg);
router.get("/", getOrgs);
export default router;
