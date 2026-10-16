
import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    visibility: {
      type: String,
      enum: ["public", "internal"],
      required: true,
      default: "public",
    },

    messageType: {
      type: String,
      enum: ["reply", "note"],
      default: "reply",
    },
  },
  { timestamps: true }
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

export default mongoose.model(
  "TicketMessage",
  ticketMessageSchema
);
