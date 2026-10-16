
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      required: true,
      trim: true,
    },

    genre: {
      type: String,
      default: "Uncategorized",
    },

    publicationDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      required: true,
      trim: true,
    },

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    authorRoyaltyPerCopy: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCopiesSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRoyaltyEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    royaltyPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    royaltyPending: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastRoyaltyPayoutDate: {
      type: Date,
      default: null,
    },

    printPartner: {
      type: String,
      default: "",
    },

    availableOn: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

bookSchema.index({ author: 1, status: 1 });

export default mongoose.model("Book", bookSchema);
