import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const TOKEN_EXPIRY = '8h';

// Error messages as constants
const ERRORS = {
  EMAIL_EXISTS: 'Email already registered',
  MISSING_FIELDS: (role: string) => `Missing required fields for ${role}`,
  INVALID_CREDENTIALS: 'Invalid credentials',
  SERVER_ERROR: 'Server error during operation'
};

router.post('/signup', async (req, res) => {
  const { name, email, password, mobile, dob, address, role = 'customer' } = req.body;

  try {
    // Email check
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: ERRORS.EMAIL_EXISTS });
    }

    // Field validation
    if ((role === 'customer' || role === 'staff') && (!name || !mobile || !dob || !address)) {
      return res.status(400).json({ message: ERRORS.MISSING_FIELDS(role) });
    }

    // User creation
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password, mobile, dob, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, mobile, dob, address, role]
    );

    // Get created user without password
    const [newUser]: any = await pool.query(
      'SELECT id, name, email, role, mobile, dob, address FROM users WHERE id = ?',
      [result.insertId]
    );

    // Generate token
    const token = jwt.sign(
      { 
        id: newUser[0].id, 
        email: newUser[0].email, 
        role: newUser[0].role 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0],
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
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
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

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
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: ERRORS.SERVER_ERROR });
  }
});

export default router;