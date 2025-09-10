import express, { type Router } from "express";
import {
  createOrg,
  getOrgById,
  getOrgs,
} from "../../controllers/auth/org.controller";

const router: Router = express.Router();
router.post("/register", createOrg);
router.get("/", getOrgs);
router.get("/:id", getOrgById);
// router.get("/:id", getOrgById);
export default router;
