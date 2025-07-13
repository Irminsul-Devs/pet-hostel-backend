import { Request, Response } from "express";
import BookingModel from "../models/booking.model";
import { IBooking } from "../interfaces/booking.interface";

class BookingController {
  static async createBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const bookingData: IBooking = req.body;

      // Add certificate validation
      if (bookingData.vaccinationCertificate) {
        console.log(
          "Certificate size:",
          Math.round(bookingData.vaccinationCertificate.length / 1024),
          "KB"
        );

        // 1MB file becomes ~1.33MB as base64
        if (bookingData.vaccinationCertificate.length > 1.4 * 1024 * 1024) {
          return res.status(400).json({
            message: "Vaccination certificate too large (max 1MB file)",
          });
        }

        // Validate base64 format
        if (!bookingData.vaccinationCertificate.startsWith("data:")) {
          return res.status(400).json({
            message: "Invalid certificate format",
          });
        }
      }

      // Convert services array to JSON string
      const servicesJson = JSON.stringify(bookingData.services);

      const newBooking = await BookingModel.create({
        booking_date:
          bookingData.bookingDate || new Date().toISOString().split("T")[0],
        remarks: bookingData.remarks,
        pet_name: bookingData.petName,
        pet_type: bookingData.petType,
        booking_from: bookingData.bookingFrom,
        booking_to: bookingData.bookingTo,
        services: servicesJson,
        pet_dob: bookingData.petDob,
        pet_age: bookingData.petAge,
        pet_food: bookingData.petFood,
        vaccination_certificate: bookingData.vaccinationCertificate,
        pet_vaccinated: bookingData.petVaccinated,
        amount: bookingData.amount || 0.0,
        user_id: userId,
        customer_id: bookingData.customerId || userId, // If no customer ID provided, assume booking for self
      });

      res.status(201).json({
        ...newBooking,
        services: JSON.parse(newBooking.services),
      });
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  }

  static async getBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.role === "admin" ? undefined : req.user?.id;
      const bookings = await BookingModel.findAll(userId);

      // Convert services from JSON string to array
      const formattedBookings = bookings.map((booking) => ({
        ...booking,
        services: JSON.parse(booking.services),
      }));

      res.json(formattedBookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      // Check if user is staff or admin
      if (req.user?.role !== "admin" && req.user?.role !== "staff") {
        return res
          .status(403)
          .json({ message: "Access denied. Staff or admin role required" });
      }

      // Fetch all bookings without user filter
      const bookings = await BookingModel.findAll();

      // Convert services from JSON string to array
      const formattedBookings = bookings.map((booking) => ({
        ...booking,
        services: JSON.parse(booking.services),
      }));

      res.json(formattedBookings);
    } catch (error) {
      console.error("Get all bookings error:", error);
      res.status(500).json({ message: "Failed to fetch all bookings" });
    }
  }

  static async getBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.role === "admin" ? undefined : req.user?.id;
      const booking = await BookingModel.findById(
        parseInt(req.params.id),
        userId
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        ...booking,
        services: JSON.parse(booking.services),
      });
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  }

  static async updateBooking(req: Request, res: Response) {
    try {
      // Allow staff and admin to update any booking, only restrict customers
      const userId = req.user?.role === "customer" ? req.user?.id : undefined;
      const bookingId = parseInt(req.params.id);
      const bookingData: IBooking = req.body;

      // Add certificate validation
      if (bookingData.vaccinationCertificate) {
        console.log(
          "Certificate size:",
          Math.round(bookingData.vaccinationCertificate.length / 1024),
          "KB"
        );

        // 1MB file becomes ~1.33MB as base64
        if (bookingData.vaccinationCertificate.length > 1.4 * 1024 * 1024) {
          return res.status(400).json({
            message: "Vaccination certificate too large (max 1MB file)",
          });
        }

        // Validate base64 format
        if (!bookingData.vaccinationCertificate.startsWith("data:")) {
          return res.status(400).json({
            message: "Invalid certificate format",
          });
        }
      }

      // Check if booking exists
      const existingBooking = await BookingModel.findById(bookingId, userId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Convert services array to JSON string if provided
      const servicesJson = bookingData.services
        ? JSON.stringify(bookingData.services)
        : existingBooking.services;

      const updatedBooking = await BookingModel.update(
        bookingId,
        {
          booking_date: bookingData.bookingDate || existingBooking.booking_date,
          remarks: bookingData.remarks || existingBooking.remarks,
          pet_name: bookingData.petName || existingBooking.pet_name,
          pet_type: bookingData.petType || existingBooking.pet_type,
          booking_from: bookingData.bookingFrom || existingBooking.booking_from,
          booking_to: bookingData.bookingTo || existingBooking.booking_to,
          services: servicesJson,
          pet_dob: bookingData.petDob || existingBooking.pet_dob,
          pet_age: bookingData.petAge || existingBooking.pet_age,
          pet_food: bookingData.petFood || existingBooking.pet_food,
          vaccination_certificate:
            bookingData.vaccinationCertificate ??
            existingBooking.vaccination_certificate,
          pet_vaccinated:
            bookingData.petVaccinated ?? existingBooking.pet_vaccinated,
          amount: bookingData.amount ?? existingBooking.amount,
          customer_id: bookingData.customerId || existingBooking.customer_id,
        },
        userId
      );

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        ...updatedBooking,
        services: JSON.parse(updatedBooking.services),
      });
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  }

  static async deleteBooking(req: Request, res: Response) {
    try {
      // Allow staff and admin to delete any booking, only restrict customers
      const userId = req.user?.role === "customer" ? req.user?.id : undefined;
      const deleted = await BookingModel.delete(
        parseInt(req.params.id),
        userId
      );

      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Delete booking error:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  }
}

export default BookingController;
