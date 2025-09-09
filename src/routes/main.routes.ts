import express, { type Request, type Response, type Router } from "express";

import authRouter from "./auth/auth.routes";
const router: Router = express.Router();
// Auth Router
router.use("/auth", authRouter);

export default router;
