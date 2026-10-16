import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/db.js";
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () =>
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
