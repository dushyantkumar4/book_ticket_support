
import express from "express";
import {
  getAdminTickets,
  updateTicketStatus,
  assignTicket,
  updateTicketClassification,
} from "../controllers/adminTicketController.js";
import { regenerateTicketAI } from "../controllers/ticketController.js";
import {
  protect,
  allowRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/", getAdminTickets);
router.patch("/:ticketId/status", updateTicketStatus);
router.patch("/:ticketId/assign", assignTicket);
router.patch("/:ticketId/classification", updateTicketClassification);
router.post("/:ticketId/ai-draft", regenerateTicketAI);

export default router;
