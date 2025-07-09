import { Router } from "express";
import BookingController from "../controllers/booking.controller";
import { authenticateToken } from "../controllers/middlewares/auth.middleware";

const router = Router();

// Apply authentication middleware to all booking routes
router.use(authenticateToken);

// Create a new booking
router.post("/", BookingController.createBooking);

// Get all bookings (filtered by user ID for customers)
router.get("/", BookingController.getBookings);

// Get all bookings (for staff/admin)
router.get("/all", BookingController.getAllBookings);

// Get a single booking
router.get("/:id", BookingController.getBooking);

// Update a booking
router.put("/:id", BookingController.updateBooking);

// Delete a booking
router.delete("/:id", BookingController.deleteBooking);

export default router;
