import express, { type Router } from "express";
import {
  CreateBookReservation,
  GetAllBookReservations,
  UpdateBookReservation,
  DeleteBookReservation,
} from "../../controllers/books/bookReservation.controller";
const router: Router = express.Router({ mergeParams: true }); //BookId
router.get("/", GetAllBookReservations);
router.post("/", CreateBookReservation);
router.put("/:id", UpdateBookReservation);
router.delete("/:id", DeleteBookReservation);
export default router;
