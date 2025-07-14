// analytics.routes.ts
import { Router } from "express";
import AnalyticsController from "../controllers/analytics.controller";
import { authenticateToken } from "../controllers/middlewares/auth.middleware";

const router = Router();

// Protect all analytics routes
router.use(authenticateToken);

// Route for admin dashboard analytics
router.get("/admin-dashboard", AnalyticsController.getAdminDashboardStats);
router.get("/bookings/all", AnalyticsController.getAllBookingsWithDetails);


export default router;
