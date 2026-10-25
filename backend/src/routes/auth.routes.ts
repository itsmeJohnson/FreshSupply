import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { config } from '../config';
import { requireCustomer, requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Customer Registration
router.post('/customer/register', async (req, res, next) => {
  try {
    const { email, password, businessName, contactPerson, phone, gstNumber } = req.body;

    if (!email || !password || !businessName || !contactPerson || !phone) {
      res.status(400).json({ success: false, error: 'Missing required registration fields' });
      return;
    }

    // Check existing
    const existing = await pool.query('SELECT id FROM customers WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(400).json({ success: false, error: 'An account with this email address already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insertRes = await pool.query(`
      INSERT INTO customers (email, password_hash, business_name, contact_person, phone, gst_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, business_name, contact_person, phone, gst_number, created_at;
    `, [email.toLowerCase().trim(), passwordHash, businessName.trim(), contactPerson.trim(), phone.trim(), gstNumber?.trim() || null]);

    const customer = insertRes.rows[0];
    const token = jwt.sign(
      { customerId: customer.id, email: customer.email, businessName: customer.business_name, type: 'customer' },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Business registered successfully',
      data: {
        token,
        customer,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Customer Login
router.post('/customer/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const custRes = await pool.query(`
      SELECT * FROM customers WHERE email = $1
    `, [email.toLowerCase().trim()]);

    if (custRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const customer = custRes.rows[0];
    if (!customer.is_active) {
      res.status(403).json({ success: false, error: 'Your business account is suspended. Please contact FreshSupply operations.' });
      return;
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { customerId: customer.id, email: customer.email, businessName: customer.business_name, type: 'customer' },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    const { password_hash, ...safeCustomer } = customer;
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        customer: safeCustomer,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Customer Me Profile
router.get('/customer/me', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const custRes = await pool.query(`
      SELECT id, email, business_name, contact_person, phone, gst_number, is_active, created_at
      FROM customers WHERE id = $1
    `, [req.customer!.customerId]);

    if (custRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    const addressesRes = await pool.query(`
      SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, id ASC
    `, [req.customer!.customerId]);

    res.json({
      success: true,
      data: {
        customer: custRes.rows[0],
        addresses: addressesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update Customer Profile
router.put('/customer/profile', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { businessName, contactPerson, phone, gstNumber } = req.body;

    const upd = await pool.query(`
      UPDATE customers
      SET business_name = COALESCE($1, business_name),
          contact_person = COALESCE($2, contact_person),
          phone = COALESCE($3, phone),
          gst_number = COALESCE($4, gst_number),
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, email, business_name, contact_person, phone, gst_number;
    `, [businessName, contactPerson, phone, gstNumber, req.customer!.customerId]);

    res.json({ success: true, message: 'Profile updated successfully', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Staff / Admin Login
router.post('/staff/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const staffRes = await pool.query(`
      SELECT * FROM staff_users WHERE email = $1
    `, [email.toLowerCase().trim()]);

    if (staffRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid staff credentials' });
      return;
    }

    const user = staffRes.rows[0];
    if (!user.is_active) {
      res.status(403).json({ success: false, error: 'Staff account has been deactivated' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid staff credentials' });
      return;
    }

    const token = jwt.sign(
      { staffId: user.id, email: user.email, name: user.name, role: user.role, type: 'staff' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Staff login authorized',
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Staff Me
router.get('/staff/me', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: req.staff,
  });
});

export default router;
