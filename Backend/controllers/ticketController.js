
import mongoose from "mongoose";
import Book from "../models/Book.js";
import Ticket from "../models/Ticket.js";
import TicketMessage from "../models/TicketMessage.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

// GET /api/tickets/mine
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      author: req.user._id,
    })
      .select("-aiDraft")
      .populate("book", "bookId title isbn")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tickets
export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, bookId, attachments } = req.body;

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required.",
      });
    }

    if (subject.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Subject cannot exceed 200 characters.",
      });
    }

    if (description.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 10000 characters.",
      });
    }

    let book = null;

    // If a book is selected, verify that it belongs to this author.
    if (bookId) {
      book = await Book.findOne({
        bookId: bookId,
        author: req.user._id,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found in your library.",
        });
      }
    }

    if (
      attachments !== undefined &&
      (!Array.isArray(attachments) ||
        !attachments.every(
          (item) => typeof item === "string" && item.trim()
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Attachments must be an array of valid references.",
      });
    }

    // These are references/URLs, not uploaded files.
    // Add a real upload flow before accepting file attachments.
    const ticket = await Ticket.create({
      author: req.user._id,
      book: book?._id || null,
      subject: subject.trim(),
      description: description.trim(),
      attachments: attachments || [],
      category: "General Inquiry",
      priority: "Medium",
      status: "Open",
      aiStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tickets/:ticketId
export const getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    if (!isValidId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const isAdmin = req.user.role === "admin";

    const filter = { _id: ticketId };

    // Authors may access only their own tickets.
    if (!isAdmin) {
      filter.author = req.user._id;
    }

    const ticket = await Ticket.findOne(filter)
      .select(isAdmin ? "+aiDraft" : "-aiDraft")
      .populate("author", "name email authorId")
      .populate("book", "bookId title isbn")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const messageFilter = { ticket: ticket._id };

    // Authors must never receive internal notes.
    if (!isAdmin) {
      messageFilter.visibility = "public";
    }

    const messages = await TicketMessage.find(messageFilter)
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      ticket,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tickets/:ticketId/messages
// Public replies from authors or admins.
export const addTicketMessage = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { body } = req.body;

    if (!isValidId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (body.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 10000 characters.",
      });
    }

    const filter = { _id: ticketId };

    if (req.user.role !== "admin") {
      filter.author = req.user._id;
    }

    const ticket = await Ticket.findOne(filter);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "This ticket is closed and cannot receive replies.",
      });
    }

    const message = await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      body: body.trim(),
      visibility: "public",
      messageType: "reply",
    });

    const populatedMessage = await TicketMessage.findById(message._id)
      .populate("sender", "name role");

    return res.status(201).json({
      success: true,
      message: "Reply added successfully.",
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tickets/:ticketId/notes
// Admin-only internal notes.
export const addInternalNote = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { body } = req.body;

    if (!isValidId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Internal note cannot be empty.",
      });
    }

    if (body.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Internal note cannot exceed 10000 characters.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const note = await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      body: body.trim(),
      visibility: "internal",
      messageType: "note",
    });

    const populatedNote = await TicketMessage.findById(note._id)
      .populate("sender", "name role");

    return res.status(201).json({
      success: true,
      message: "Internal note added successfully.",
      data: populatedNote,
    });
  } catch (error) {
    next(error);
  }
};
