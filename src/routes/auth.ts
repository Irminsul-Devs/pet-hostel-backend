import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db';

const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, mobile, dob, address, role = 'customer' } = req.body;

  try {
    // Check if email exists
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate required fields
    if ((role === 'customer' || role === 'staff') && (!name || !mobile || !dob || !address)) {
      return res.status(400).json({ message: `Missing required fields for ${role}` });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, mobile, dob, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, mobile, dob, address, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data (without password)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        dob: user.dob,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

export default router;