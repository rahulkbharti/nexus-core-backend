import express, { type Router } from "express";
import {
  getSeatsByHall,
  createSeat,
  updateSeat,
  deleteSeat,
} from "../../controllers/halls/seat.controller";
const router: Router = express.Router({ mergeParams: true }); // BookId
router.get("/", getSeatsByHall);
router.post("/", createSeat);
router.put("/:seatId", updateSeat);
router.delete("/:seatId", deleteSeat);
export default router;
