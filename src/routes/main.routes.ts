import express, { type Request, type Response, type Router } from "express";
import authRouter from "./auth/auth.routes";
import bookRouter from "./books/book.routes";
import hallRouter from "./halls/hall.routes";
import feeRouter from "./fees/fee.routes";

import { authMiddleware } from "../middlewares/auth.middlewares";
const router: Router = express.Router({ mergeParams: true });
// Auth Router
router.use("/auth", authRouter);
router.use("/books", authMiddleware, bookRouter);
router.use("/halls", authMiddleware, hallRouter);
router.use("/fees", authMiddleware, feeRouter);

export default router;
