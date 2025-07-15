import { Request, Response } from "express";
import db from "../utils/db";

class AnalyticsController {
  // Admin Dashboard Stats (existing)
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
// analytics.controller.ts

const [petsInCareRows] = await db.query(`
  SELECT 
    pet_type AS type, 
    COUNT(*) AS count
  FROM bookings
  WHERE DATE(booking_from) <= CURRENT_DATE() 
    AND DATE(booking_to) >= CURRENT_DATE()
  GROUP BY pet_type;
`);

console.log("Pets in Care:", petsInCareRows);

const petsInCare = petsInCareRows as Array<{ type: string; count: number }>;


      // 3. Most Preferred Service
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

      // 4. Monthly Bookings Count
      const [bookingsThisMonth]: any = await db.query(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE MONTH(booking_date) = MONTH(CURDATE())
          AND YEAR(booking_date) = YEAR(CURDATE())
      `);

      // 5. Monthly Revenue
      const [revenueThisMonth]: any = await db.query(`
        SELECT SUM(amount) AS total
        FROM bookings
        WHERE MONTH(booking_date) = MONTH(CURDATE())
          AND YEAR(booking_date) = YEAR(CURDATE())
      `);

   // 6. Top Pet Type
const [topPetTypesResult]: any = await db.query(`
  SELECT pet_type
  FROM (
    SELECT pet_type, COUNT(*) AS count
    FROM bookings
    GROUP BY pet_type
  ) AS counts
  WHERE count = (
    SELECT MAX(count)
    FROM (
      SELECT COUNT(*) AS count
      FROM bookings
      GROUP BY pet_type
    ) AS inner_counts
  );
`);

const topPetTypes = topPetTypesResult.map((row: any) => row.pet_type);




      // 7. Upcoming Pet Birthdays
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
   topPetType: topPetTypes.join(", ") || null,
});

    } catch (error) {
      console.error("Admin Dashboard Stats Error:", error);
      res.status(500).json({ message: "Error fetching admin stats" });
    }
  }

  // ✅ NEW: Full Booking Details for Modal
  static async getAllBookingsWithDetails(req: Request, res: Response) {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           b.*, 
           u.name AS customerName, 
           u.email AS customerEmail, 
           u.mobile AS customerMobile,
           GROUP_CONCAT(bs.service_name) AS services
         FROM bookings b
         LEFT JOIN users u ON b.customer_id = u.id
         LEFT JOIN booking_services bs ON b.id = bs.booking_id
         GROUP BY b.id
         ORDER BY b.booking_date DESC`
      );

      const bookings = rows.map((b: any) => ({
        id: b.id,
        amount: b.amount,
        bookingDate: b.booking_date,
        bookingFrom: b.booking_from,
        bookingTo: b.booking_to,
        user_id: b.user_id,
        customer: {
          name: b.customerName,
          email: b.customerEmail,
          mobile: b.customerMobile,
        },
        services: b.services ? b.services.split(",") : [],
        petName: b.pet_name,
        petType: b.pet_type,
        petAge: b.pet_age,
        petVaccinated: b.pet_vaccinated,
        petFood: b.pet_food,
        remarks: b.remarks,
        vaccinationCertificate: b.vaccination_certificate,
      }));

      res.json(bookings);
    } catch (err) {
      console.error("Error fetching bookings with details:", err);
      res.status(500).json({ message: "Error fetching detailed bookings" });
    }
  }
}

export default AnalyticsController;
