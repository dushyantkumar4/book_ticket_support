
import Book from "../models/Book.js";
import Ticket from "../models/Ticket.js";

export const getAuthorDashboard = async (req, res, next) => {
  try {
    const authorId = req.user._id;

    const [
      bookStats,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    ] = await Promise.all([
      Book.aggregate([
        { $match: { author: authorId } },
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            totalCopiesSold: { $sum: "$totalCopiesSold" },
            totalRoyaltyEarned: { $sum: "$totalRoyaltyEarned" },
            royaltyPaid: { $sum: "$royaltyPaid" },
            royaltyPending: { $sum: "$royaltyPending" },
          },
        },
      ]),
      Ticket.countDocuments({ author: authorId }),
      Ticket.countDocuments({ author: authorId, status: "Open" }),
      Ticket.countDocuments({ author: authorId, status: "In Progress" }),
      Ticket.countDocuments({ author: authorId, status: "Resolved" }),
      Ticket.countDocuments({ author: authorId, status: "Closed" }),
    ]);

    const books = bookStats[0] || {
      totalBooks: 0,
      totalCopiesSold: 0,
      totalRoyaltyEarned: 0,
      royaltyPaid: 0,
      royaltyPending: 0,
    };

    return res.status(200).json({
      success: true,
      dashboard: {
        books: {
          total: books.totalBooks,
          totalCopiesSold: books.totalCopiesSold,
        },
        royalties: {
          totalEarned: books.totalRoyaltyEarned,
          paid: books.royaltyPaid,
          pending: books.royaltyPending,
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
