import express, { type Router } from "express";
import {
  getGroups,
  groupCreate,
} from "../../controllers/auth/group.controllers";
const router: Router = express.Router();
router.post("/create", groupCreate);
router.get("/", getGroups);
export default router;
