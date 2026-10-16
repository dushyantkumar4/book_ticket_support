
import mongoose from "mongoose";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

const allowedStatuses = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

const allowedCategories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const allowedPriorities = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

// GET /api/admin/tickets
// Supports ?status=Open&priority=High&category=Royalty%20%26%20Payments
// Supports ?from=2026-10-01&to=2026-10-31&page=1&limit=10
export const getAdminTickets = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      from,
      to,
      search,
    } = req.query;

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket status filter.",
        });
      }
      filter.status = status;
    }

    if (category) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket category filter.",
        });
      }
      filter.category = category;
    }

    if (priority) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority filter.",
        });
      }
      filter.priority = priority;
    }

    if (from || to) {
      const createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'from' date.",
          });
        }
        createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'to' date.",
          });
        }

        // Include the entire 'to' calendar day for YYYY-MM-DD input.
        if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
          toDate.setUTCHours(23, 59, 59, 999);
        }

        createdAt.$lte = toDate;
      }

      filter.createdAt = createdAt;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { subject: searchRegex },
        { description: searchRegex },
      ];
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .select("-aiDraft")
        .populate("author", "name email authorId")
        .populate("book", "bookId title isbn")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Ticket.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/tickets/:ticketId/status
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    ticket.status = status;

    if (status === "Resolved" || status === "Closed") {
      ticket.resolvedAt = ticket.resolvedAt || new Date();
    } else {
      ticket.resolvedAt = null;
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully.",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/tickets/:ticketId/assign
// Body: { "assignedTo": "<admin MongoDB _id>" }
// To assign to yourself: { "assignedTo": "self" }
// To unassign: { "assignedTo": null }
export const assignTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    let { assignedTo } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (assignedTo === "self") {
      assignedTo = req.user._id;
    }

    if (assignedTo === null) {
      ticket.assignedTo = null;
    } else {
      if (
        typeof assignedTo !== "string" ||
        !mongoose.isValidObjectId(assignedTo)
      ) {
        return res.status(400).json({
          success: false,
          message: "Provide a valid admin ID, 'self', or null.",
        });
      }

      const admin = await User.findOne({
        _id: assignedTo,
        role: "admin",
        isActive: true,
      });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be an active admin.",
        });
      }

      ticket.assignedTo = admin._id;
    }

    await ticket.save();
    await ticket.populate("assignedTo", "name email role");

    return res.status(200).json({
      success: true,
      message: "Ticket assignment updated successfully.",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
