
import express from "express";
import {
  getMyBooks,
  getMyBookById,
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMyBooks);
router.get("/:bookId", protect, getMyBookById);

export default router;
