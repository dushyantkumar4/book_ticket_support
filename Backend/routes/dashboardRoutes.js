
import express from "express";
import { getAuthorDashboard } from "../controllers/dashboardController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/author",
  protect,
  allowRoles("author"),
  getAuthorDashboard
);

export default router;
