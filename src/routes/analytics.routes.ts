import { Router } from "express";
import AnalyticsController from "../controllers/analytics.controller";
import { authenticateToken } from "../controllers/middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/admin-dashboard", AnalyticsController.getAdminDashboardStats);
router.get("/bookings/all", AnalyticsController.getAllBookingsWithDetails);

export default router;