
import Book from "../models/Book.js";

// GET /api/books/mine
// Return only books belonging to the logged-in author.
export const getMyBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      author: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:bookId
// An author can access only their own book.
export const getMyBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      bookId: req.params.bookId,
      author: req.user._id,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};
