import express, { type Router } from "express";
import {
  getSeatReservations,
  createSeatReservation,
  updateSeatReservation,
  deleteSeatReservation,
} from "../../controllers/halls/seatReservation.controller";
const router: Router = express.Router(); //BookId
router.get("/", getSeatReservations);
router.post("/", createSeatReservation);
router.put("/:id", updateSeatReservation);
router.delete("/:id", deleteSeatReservation);
export default router;
