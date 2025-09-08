import express, { type Request, type Response, type Router } from "express";

import authRouter from "./auth/auth.routes.ts";
const router: Router = express.Router();
// Auth Router
router.use("/auth", authRouter);

export default router;
