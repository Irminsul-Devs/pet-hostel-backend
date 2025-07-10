import { RowDataPacket } from "mysql2";
import db from "../utils/db"; // Adjust the import path as necessary

interface Booking extends RowDataPacket {
  id: number;
  booking_date: string;
  remarks: string;
  owner_name: string;
  owner_mobile: string;
  owner_dob: string;
  owner_email: string;
  owner_address: string;
  pet_name: string;
  pet_type: string;
  booking_from: string;
  booking_to: string;
  services: string;
  pet_dob: string;
  pet_age: string;
  pet_food: string;
  vaccination_certificate: string | null;
  pet_vaccinated: boolean;
  amount: number;
  user_id: number;
}

class BookingModel {
  static async create(bookingData: any): Promise<Booking> {
    const [result] = await db.query(`INSERT INTO bookings SET ?`, [
      bookingData,
    ]);
    const [rows] = await db.query<Booking[]>(
      "SELECT * FROM bookings WHERE id = ?",
      [(result as any).insertId]
    );
    return rows[0];
  }

  static async findAll(userId?: number): Promise<Booking[]> {
    let query = "SELECT * FROM bookings";
    const params = [];

    if (userId) {
      query += " WHERE user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY booking_from DESC";

    const [rows] = await db.query<Booking[]>(query, params);
    return rows;
  }

  static async findById(id: number, userId?: number): Promise<Booking | null> {
    let query = "SELECT * FROM bookings WHERE id = ?";
    const params = [id];

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    const [rows] = await db.query<Booking[]>(query, params);
    return rows[0] || null;
  }

  static async update(
    id: number,
    bookingData: any,
    userId?: number
  ): Promise<Booking | null> {
    // Explicitly handle vaccination certificate
    const updateData = {
      ...bookingData,
      // Force NULL if pet is not vaccinated
      vaccination_certificate: bookingData.pet_vaccinated
        ? bookingData.vaccination_certificate
        : null,
    };

    let query = "UPDATE bookings SET ? WHERE id = ?";
    const params = [updateData, id]; // Use updateData instead of bookingData

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    await db.query(query, params);
    return this.findById(id, userId);
  }

  static async delete(id: number, userId?: number): Promise<boolean> {
    let query = "DELETE FROM bookings WHERE id = ?";
    const params = [id];

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    const [result] = await db.query(query, params);
    return (result as any).affectedRows > 0;
  }

  static async updateCertificate(
    id: number,
    certificate: string
  ): Promise<void> {
    await db.query(
      "UPDATE bookings SET vaccination_certificate = ? WHERE id = ?",
      [certificate, id]
    );
  }
}

export default BookingModel;
