import express, { type Router } from "express";
import payMentRouter from "./payment.routes";
import {
  createFee,
  getFees,
  deleteFee,
  updateFee,
} from "../../controllers/fees/fee.controller";
const router: Router = express.Router({ mergeParams: true });
router.post("/", createFee);
router.get("/", getFees);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);

router.use("/payments", payMentRouter);
export default router;
