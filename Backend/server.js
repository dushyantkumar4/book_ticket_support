import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import app from "./app.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});
app.set("io", io);
// Authenticate every socket connection using the HTTP-only JWT cookie.
io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjust userId if your JWT payload uses a different property.
    const user = await User.findById(decoded.userId);

    if (!user || user.isActive === false) {
      return next(new Error("Invalid user"));
    }

    socket.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    next(new Error("Socket authentication failed"));
  }
});

io.on("connection", (socket) => {
  if (socket.user.role === "admin") {
    socket.join("admins");
  } else {
    socket.join(`author:${socket.user.id}`);
  }

  console.log("Authenticated socket connected:", socket.user.id);
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () =>
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`,
      ),
    );
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION!  Shutting down server...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};
startServer();
