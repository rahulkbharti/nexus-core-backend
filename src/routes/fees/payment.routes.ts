import express, { type Router } from "express";
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../../controllers/fees/payment.controller";
const router: Router = express.Router({ mergeParams: true }); //BookId
router.get("/", getPayments);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);
export default router;
