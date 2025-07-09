import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../utils/db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const TOKEN_EXPIRY = "8h";

// Error messages as constants
const ERRORS = {
  EMAIL_EXISTS: "Email already registered",
  MISSING_FIELDS: (role: string) => `Missing required fields for ${role}`,
  INVALID_CREDENTIALS: "Invalid credentials",
  SERVER_ERROR: "Server error during operation",
};

router.post("/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    mobile,
    dob,
    address,
    role = "customer",
  } = req.body;

  try {
    // Email check
    const [existing]: any = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: ERRORS.EMAIL_EXISTS });
    }

    // Field validation
    if (
      (role === "customer" || role === "staff") &&
      (!name || !mobile || !dob || !address)
    ) {
      return res.status(400).json({ message: ERRORS.MISSING_FIELDS(role) });
    }

    // User creation
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password, mobile, dob, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, mobile, dob, address, role]
    );

    // Get created user without password
    const [newUser]: any = await pool.query(
      "SELECT id, name, email, role, mobile, dob, address FROM users WHERE id = ?",
      [result.insertId]
    );

    // Generate token
    const token = jwt.sign(
      {
        id: newUser[0].id,
        email: newUser[0].email,
        role: newUser[0].role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser[0],
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: ERRORS.INVALID_CREDENTIALS });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: ERRORS.INVALID_CREDENTIALS });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        dob: user.dob,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

router.post("/add-staff", async (req, res) => {
  const { name, email, password, mobile, dob, address } = req.body;
  const role = "staff"; // Forcefully set to staff regardless of input

  try {
    const [existing]: any = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password, mobile, dob, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, mobile, dob, address, role]
    );

    const [newStaff]: any = await pool.query(
      "SELECT id, name, email, mobile, dob, address FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Staff added successfully",
      staff: newStaff[0],
    });
  } catch (err) {
    console.error("Add staff error:", err);
    res.status(500).json({ message: "Server error while adding staff" });
  }
});

router.put("/update-staff/:id", async (req, res) => {
  const { id } = req.params;
  const { name, dob, mobile, email, address } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE users SET name = ?, dob = ?, mobile = ?, email = ?, address = ?
       WHERE id = ? AND role = 'staff'`,
      [name, dob, mobile, email, address, id]
    );

    res.json({ message: "Staff updated successfully" });
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ message: "Failed to update staff" });
  }
});

// GET /api/auth/staff – Get all staff users
router.get("/staff", async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT id, name, dob, address, email, mobile FROM users WHERE role = 'staff'"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/auth/delete-staff/:id
router.delete("/delete-staff/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role = "staff"',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Staff not found or already deleted" });
    }

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: "Server error while deleting staff" });
  }
});

// Change Password Route
router.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword, userId } = req.body;

  if (!currentPassword || !newPassword || !userId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get the user
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

// Reset password route (for admins to reset staff passwords)
router.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  // Validate request
  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "User ID and new password are required" });
  }

  try {
    // Check if the user exists
    const [user]: any = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

// Reset password by email (for users who forgot password)
router.post("/reset-password-by-email", async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate request
  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  try {
    // Check if the user exists
    const [user]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res
        .status(404)
        .json({ message: "User not found with that email" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

export default router;
