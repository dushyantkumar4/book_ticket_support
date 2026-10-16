
import express from "express";
import {
  getAdminTickets,
  updateTicketStatus,
  assignTicket,
} from "../controllers/adminTicketController.js";
import {
  protect,
  allowRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/", getAdminTickets);
router.patch("/:ticketId/status", updateTicketStatus);
router.patch("/:ticketId/assign", assignTicket);

export default router;
