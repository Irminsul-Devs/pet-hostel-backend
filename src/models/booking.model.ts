import { RowDataPacket } from "mysql2";
import db from "../utils/db"; // Adjust the import path as necessary

interface Booking extends RowDataPacket {
  id: number;
  booking_date: string;
  remarks: string;
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
  customer_id: number;
}

interface BookingWithCustomer extends Booking {
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_dob: string;
  customer_address: string;
}

class BookingModel {
  static async create(bookingData: any): Promise<BookingWithCustomer> {
    const [result] = await db.query(`INSERT INTO bookings SET ?`, [
      bookingData,
    ]);
    const [rows] = await db.query<BookingWithCustomer[]>(
      `SELECT b.*, 
        u.name as customer_name, 
        u.email as customer_email,
        u.mobile as customer_mobile,
        u.dob as customer_dob,
        u.address as customer_address
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      WHERE b.id = ?`,
      [(result as any).insertId]
    );
    return rows[0];
  }

  static async findAll(
    userId?: number,
    isStaff: boolean = false
  ): Promise<BookingWithCustomer[]> {
    let query = `
      SELECT b.*, 
        u.id as customer_id,
        u.name as customer_name, 
        u.email as customer_email,
        u.mobile as customer_mobile,
        u.dob as customer_dob,
        u.address as customer_address
      FROM bookings b
      JOIN users u ON b.customer_id = u.id`;
    const params = [];

    if (userId && !isStaff) {
      // If not staff, only show bookings where user is the customer
      query += " WHERE b.customer_id = ?";
      params.push(userId);
    }

    query += " ORDER BY b.booking_from DESC";

    const [rows] = await db.query<BookingWithCustomer[]>(query, params);

    // Transform the flat structure into nested customer object
    return rows.map((row) => ({
      ...row,
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        email: row.customer_email,
        mobile: row.customer_mobile,
        dob: row.customer_dob,
        address: row.customer_address,
      },
    }));
  }

  static async findById(
    id: number,
    userId?: number
  ): Promise<BookingWithCustomer | null> {
    let query = `
      SELECT b.*, 
        u.id as customer_id,
        u.name as customer_name, 
        u.email as customer_email,
        u.mobile as customer_mobile,
        u.dob as customer_dob,
        u.address as customer_address
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      WHERE b.id = ?`;
    const params = [id];

    if (userId) {
      query += " AND b.user_id = ?";
      params.push(userId);
    }

    const [rows] = await db.query<BookingWithCustomer[]>(query, params);
    if (!rows[0]) return null;

    // Transform to include nested customer object
    return {
      ...rows[0],
      customer: {
        id: rows[0].customer_id,
        name: rows[0].customer_name,
        email: rows[0].customer_email,
        mobile: rows[0].customer_mobile,
        dob: rows[0].customer_dob,
        address: rows[0].customer_address,
      },
    };
  }

  static async update(
    id: number,
    bookingData: any,
    userId?: number
  ): Promise<BookingWithCustomer | null> {
    // Explicitly handle vaccination certificate
    const updateData = {
      ...bookingData,
      // Force NULL if pet is not vaccinated
      vaccination_certificate: bookingData.pet_vaccinated
        ? bookingData.vaccination_certificate
        : null,
    };

    let query = "UPDATE bookings SET ? WHERE id = ?";
    const params = [updateData, id];

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
