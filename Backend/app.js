import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

import userRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import adminTicketRoutes from "./routes/adminTicketRoutes.js";

app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin/tickets", adminTicketRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Cannot find ${req.originalUrl} on this server.`,
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
