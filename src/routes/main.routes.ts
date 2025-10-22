import express, { type Request, type Response, type Router } from "express";
import authRouter from "./auth/auth.routes";
import bookRouter from "./books/book.routes";
import hallRouter from "./halls/hall.routes";
import feeRouter from "./fees/fee.routes";

import { authMiddleware } from "../middlewares/auth.middlewares";
import prisma from "../utils/prisma";
import sendFeedbackEmail from "../services/feedBackEmailService";
const router: Router = express.Router({ mergeParams: true });
// Auth Router
router.use("/auth", authRouter);
router.use("/books", authMiddleware, bookRouter);
router.use("/halls", authMiddleware, hallRouter);
router.use("/fees", authMiddleware, feeRouter);

router.post(
  "/feedback",
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const {
        easeOfUseRating,
        featuresRating,
        performanceRating,
        supportRating,
        suggestions,
      } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          member: {
            include: { organization: true },
          },
        },
      });
      const name = user?.name ?? null;
      const organization = user?.member?.organization?.name ?? null;

      const feedBack = {
        userId: req.user.id,
        easeOfUseRating,
        featuresRating,
        performanceRating,
        supportRating,
        suggestions,
        ...req.user,
        name,
        organization,
      };
      await sendFeedbackEmail({ feedbackData: feedBack });
      res.status(200).json({ message: "Feedback submitted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
export default router;
