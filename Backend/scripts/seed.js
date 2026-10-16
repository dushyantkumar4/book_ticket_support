import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Book from "../models/Book.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the supplied dataset.
const dataPath = path.join(__dirname, "../data/book_sample_data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Temporary password for newly seeded author accounts.
// Change this before any real deployment.
const DEMO_PASSWORD = "password";

const seedData = async () => {
  try {
    await connectDB();

    if (!Array.isArray(data.authors)) {
      throw new Error("Dataset must contain an authors array.");
    }

    let authorsCreated = 0;
    let booksCreated = 0;

    for (const authorData of data.authors) {
      const {
        author_id,
        name,
        email,
        phone,
        city,
        joined_date,
        books = [],
      } = authorData;

      // Find an existing account to avoid duplicates.
      let user = await User.findOne({
        $or: [{ authorId: author_id }, { email: email.toLowerCase().trim() }],
      });

      if (!user) {
        // User.save() triggers the bcrypt password hook.
        user = new User({
          authorId: author_id,
          name,
          email,
          phone,
          city,
          joinedDate: joined_date || undefined,
          password: DEMO_PASSWORD,
          role: "author",
        });

        await user.save();
        authorsCreated++;
      } else {
        // Update dataset fields without resetting an existing password.
        user.authorId = author_id;
        user.name = name;
        user.email = email.toLowerCase().trim();
        user.phone = phone || "";
        user.city = city || "";
        user.joinedDate = joined_date || undefined;

        await user.save();
      }

      // Import this author's books and connect each to their User.
      for (const bookData of books) {
        const {
          book_id,
          title,
          isbn,
          genre,
          publication_date,
          status,
          mrp,
          author_royalty_per_copy,
          total_copies_sold,
          total_royalty_earned,
          royalty_paid,
          royalty_pending,
          last_royalty_payout_date,
          print_partner,
          available_on,
        } = bookData;

        const result = await Book.findOneAndUpdate(
          { bookId: book_id },
          {
            $set: {
              author: user._id,
              title,
              isbn,
              genre,
              publicationDate: publication_date || null,
              status,
              mrp,
              authorRoyaltyPerCopy: author_royalty_per_copy ?? 0,
              totalCopiesSold: total_copies_sold ?? 0,
              totalRoyaltyEarned: total_royalty_earned ?? 0,
              royaltyPaid: royalty_paid ?? 0,
              royaltyPending: royalty_pending ?? 0,
              lastRoyaltyPayoutDate: last_royalty_payout_date || null,
              printPartner: print_partner || "",
              availableOn: available_on || [],
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            runValidators: true,
          },
        );

        // A new document has no previous creation timestamp in memory,
        // so count inserts separately using an existence check if needed.
        if (result) booksCreated++;
      }
    }

    console.log("Dataset imported successfully.");
    console.log(`Authors created: ${authorsCreated}`);
    console.log(`Books processed: ${booksCreated}`);
    console.log("New author demo password:", DEMO_PASSWORD);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.connection.close();
  }
};

seedData();
