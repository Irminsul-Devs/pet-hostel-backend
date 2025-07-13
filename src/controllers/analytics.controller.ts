// controllers/analytics.controller.ts
import { Request, Response } from "express";
import db from "../utils/db";

class AnalyticsController {
  static async getAdminDashboardStats(req: Request, res: Response) {
    try {
      // 1. Most Regular Customer
      const [topCustomer]: any = await db.query(
        `SELECT u.id, u.name, u.email, COUNT(b.id) AS total_bookings
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         GROUP BY b.customer_id
         ORDER BY total_bookings DESC
         LIMIT 1`
      );

      // 2. Pets Currently in Care (REPLACED Top Staff metric)
const [petsInCareRows] = await db.query(`
  SELECT 
    pet_type as type, 
    COUNT(*) as count
  FROM bookings
  WHERE booking_from <= CURDATE() 
    AND booking_to >= CURDATE()
  GROUP BY pet_type
`);

// Cast the result to our expected type
const petsInCare = (petsInCareRows as Array<{ type: string; count: number }>);

      const [serviceRows]: any = await db.query(`SELECT services FROM bookings`);

      const serviceCount: Record<string, number> = {};
      serviceRows.forEach((row: any) => {
        const services: string[] = JSON.parse(row.services || "[]");
        services.forEach(service => {
          serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
      });

      let mostPreferredService: string | null = null;
      let highestCount = 0;
      for (const [service, count] of Object.entries(serviceCount)) {
        if (count > highestCount) {
          highestCount = count;
          mostPreferredService = service;
        }
      }

      const [bookingsThisMonth]: any = await db.query(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE MONTH(booking_date) = MONTH(CURDATE())
          AND YEAR(booking_date) = YEAR(CURDATE())
      `);

      const [revenueThisMonth]: any = await db.query(`
        SELECT SUM(amount) AS total
        FROM bookings
        WHERE MONTH(booking_date) = MONTH(CURDATE())
          AND YEAR(booking_date) = YEAR(CURDATE())
      `);

      const [topPetType]: any = await db.query(`
        SELECT pet_type, COUNT(*) AS count
        FROM bookings
        GROUP BY pet_type
        ORDER BY count DESC
        LIMIT 1
      `);

      const [upcomingBirthdays]: any = await db.query(`
        SELECT 
          b.pet_name AS petName,
          b.pet_dob AS petDob,
          u.name AS ownerName
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        WHERE 
          b.pet_dob IS NOT NULL
          AND DATE_FORMAT(b.pet_dob, '%m-%d') BETWEEN DATE_FORMAT(CURDATE(), '%m-%d') 
          AND DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), '%m-%d')
        GROUP BY b.pet_name, b.pet_dob, u.name
      `);

      res.json({
        mostRegularCustomer: topCustomer[0] || null,
      petsInCare: petsInCare || [],
        mostPreferredService,
        upcomingPetBirthdays: upcomingBirthdays || [],
        totalBookingsThisMonth: bookingsThisMonth[0]?.total || 0,
        totalRevenueThisMonth: revenueThisMonth[0]?.total || 0,
        topPetType: topPetType[0]?.pet_type || null
      });
    } catch (error) {
      console.error("Admin Dashboard Stats Error:", error);
      res.status(500).json({ message: "Error fetching admin stats" });
    }
  }
}

export default AnalyticsController;