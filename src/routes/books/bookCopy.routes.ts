import express, { type Router } from "express";
import {
  CreateBookCopy,
  GetAllBookCopies,
  UpdateBookCopy,
  DeleteBookCopy,
} from "../../controllers/books/bookCopy.controller";
const router: Router = express.Router({ mergeParams: true }); //BookId
router.post("/", CreateBookCopy);
router.get("/", GetAllBookCopies);
router.put("/:copyId", UpdateBookCopy); // CopyId
router.delete("/:copyId", DeleteBookCopy); // CopyID
export default router;
