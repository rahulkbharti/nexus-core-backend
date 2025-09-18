import express, { type Router } from "express";
import {
  CreateBook,
  DeleteBook,
  GetBooks,
  UpdateBook,
} from "../../controllers/books/book.controller";
import bookCopyRouter from "./bookCopy.routes";
import bookReservationRouter from "./bookReservation.routes";
const router: Router = express.Router();
router.get("/", GetBooks);
router.post("/", CreateBook);
router.put("/:id", UpdateBook);
router.delete("/:id", DeleteBook);

router.use("/:id/copies", bookCopyRouter);
router.use("/reservations", bookReservationRouter);
export default router;
