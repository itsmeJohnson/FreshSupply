import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// List all staff (Admin only)
router.get('/users', requireAdmin, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT id, email, name, role, is_active, created_at, updated_at
      FROM staff_users
      ORDER BY id ASC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Create staff (Admin only)
router.post('/users', requireAdmin, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Email, password, and name are required' });
      return;
    }

    const existing = await pool.query('SELECT id FROM staff_users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(400).json({ success: false, error: 'A staff member with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const ins = await pool.query(`
      INSERT INTO staff_users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, email, name, role, is_active, created_at;
    `, [email.toLowerCase().trim(), passwordHash, name.trim(), role === 'admin' ? 'admin' : 'staff']);

    res.status(201).json({ success: true, message: 'Staff user created successfully', data: ins.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Update staff role (Admin only)
router.patch('/users/:id/role', requireAdmin, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (role !== 'admin' && role !== 'staff') {
      res.status(400).json({ success: false, error: 'Role must be either admin or staff' });
      return;
    }

    const upd = await pool.query(`
      UPDATE staff_users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, role;
    `, [role, id]);

    res.json({ success: true, message: 'Staff role updated', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Toggle staff active (Admin only)
router.patch('/users/:id/toggle', requireAdmin, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Prevent deactivating own account
    if (id === req.staff?.staffId) {
      res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
      return;
    }

    const upd = await pool.query(`
      UPDATE staff_users
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, is_active;
    `, [id]);

    res.json({ success: true, message: 'Staff status updated', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
