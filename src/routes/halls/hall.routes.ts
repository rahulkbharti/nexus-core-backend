import express, { type Router } from "express";
import {
  createHall,
  getHalls,
  updateHall,
  deleteHall,
} from "../../controllers/halls/hall.controller";
import seatRouter from "./seat.routes";
import seatReservationRouter from "./seatReservations.routes";
const router: Router = express.Router({ mergeParams: true }); //BookId
router.post("/", createHall);
router.get("/", getHalls);
router.put("/:id", updateHall);
router.delete("/:id", deleteHall);

router.use("/:hallId/seats", seatRouter);
router.use("/reservations", seatReservationRouter);
export default router;
