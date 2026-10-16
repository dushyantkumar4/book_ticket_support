
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const ADMIN_NAME = "Admin";
const ADMIN_EMAIL = "admin@bookticket.com";
const ADMIN_PASSWORD = "adminPassword";

async function seedAdmin() {
  try {
    await connectDB();

    let admin = await User.findOne({
      email: ADMIN_EMAIL,
    }).select("+password");

    if (admin) {
      // Do not overwrite an existing admin's password.
      admin.role = "admin";
      admin.name = ADMIN_NAME;
      await admin.save();

      console.log("Existing account updated to admin role.");
    } else {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
        isActive: true,
      });

      console.log("Admin account created successfully.");
    }

    console.log("Admin email:", ADMIN_EMAIL);
    console.log("If this account was newly created, password:", ADMIN_PASSWORD);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
