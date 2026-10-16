
import express from "express";
import {
  getMyTickets,
  createTicket,
  getTicketById,
  addTicketMessage,
  addInternalNote,
} from "../controllers/ticketController.js";
import {
  protect,
  allowRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, allowRoles("author"), getMyTickets);
router.post("/", protect, allowRoles("author"), createTicket);

router.get("/:ticketId", protect, getTicketById);

router.post(
  "/:ticketId/messages",
  protect,
  allowRoles("author", "admin"),
  addTicketMessage
);

router.post(
  "/:ticketId/notes",
  protect,
  allowRoles("admin"),
  addInternalNote
);

export default router;
