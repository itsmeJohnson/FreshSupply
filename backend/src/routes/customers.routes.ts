import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireCustomer, requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Customer: List saved addresses
router.get('/addresses', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const result = await pool.query(`
      SELECT * FROM customer_addresses 
      WHERE customer_id = $1 
      ORDER BY is_default DESC, id ASC
    `, [customerId]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Customer: Add address
router.post('/addresses', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const { label, addressLine1, addressLine2, landmark, city, state, postalCode, isDefault, contactPhone } = req.body;

    if (!addressLine1 || !postalCode) {
      res.status(400).json({ success: false, error: 'Address line and postal code are required' });
      return;
    }

    if (isDefault) {
      await pool.query('UPDATE customer_addresses SET is_default = false WHERE customer_id = $1', [customerId]);
    }

    const ins = await pool.query(`
      INSERT INTO customer_addresses (
        customer_id, label, address_line1, address_line2, landmark, city, state, postal_code, is_default, contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      customerId,
      label || 'Outlet / Kitchen',
      addressLine1,
      addressLine2 || null,
      landmark || null,
      city || 'Bangalore',
      state || 'Karnataka',
      postalCode,
      isDefault === true,
      contactPhone || null,
    ]);

    res.status(201).json({ success: true, message: 'Delivery address added', data: ins.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Customer: Update address
router.put('/addresses/:id', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const addressId = parseInt(req.params.id, 10);
    const { label, addressLine1, addressLine2, landmark, city, state, postalCode, isDefault, contactPhone } = req.body;

    if (isDefault) {
      await pool.query('UPDATE customer_addresses SET is_default = false WHERE customer_id = $1', [customerId]);
    }

    const upd = await pool.query(`
      UPDATE customer_addresses
      SET label = COALESCE($1, label),
          address_line1 = COALESCE($2, address_line1),
          address_line2 = COALESCE($3, address_line2),
          landmark = COALESCE($4, landmark),
          city = COALESCE($5, city),
          state = COALESCE($6, state),
          postal_code = COALESCE($7, postal_code),
          is_default = COALESCE($8, is_default),
          contact_phone = COALESCE($9, contact_phone)
      WHERE id = $10 AND customer_id = $11
      RETURNING *;
    `, [label, addressLine1, addressLine2, landmark, city, state, postalCode, isDefault, contactPhone, addressId, customerId]);

    if (upd.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Address not found' });
      return;
    }

    res.json({ success: true, message: 'Delivery address updated', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Customer: Delete address
router.delete('/addresses/:id', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const addressId = parseInt(req.params.id, 10);

    await pool.query('DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2', [addressId, customerId]);
    res.json({ success: true, message: 'Address removed' });
  } catch (err) {
    next(err);
  }
});

// Staff: List all customer businesses
router.get('/admin/all', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { search, limit = '100', offset = '0' } = req.query;

    let query = `
      SELECT c.id, c.email, c.business_name, c.contact_person, c.phone, c.gst_number, c.is_active, c.created_at,
             COUNT(DISTINCT o.id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spend,
             MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status != 'cancelled'
    `;
    const values: any[] = [];

    if (search && typeof search === 'string' && search.trim().length > 0) {
      query += ` WHERE (c.business_name ILIKE $1 OR c.email ILIKE $1 OR c.contact_person ILIKE $1 OR c.phone ILIKE $1)`;
      values.push(`%${search.trim()}%`);
    }

    query += ` GROUP BY c.id ORDER BY total_spend DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Staff: Get customer detail
router.get('/admin/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);

    const custRes = await pool.query(`
      SELECT id, email, business_name, contact_person, phone, gst_number, is_active, created_at, updated_at
      FROM customers WHERE id = $1
    `, [customerId]);

    if (custRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    const addresses = await pool.query(`
      SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, id ASC
    `, [customerId]);

    const orders = await pool.query(`
      SELECT id, order_number, total_amount, status, delivery_date, created_at
      FROM orders WHERE customer_id = $1 ORDER BY created_at DESC
    `, [customerId]);

    res.json({
      success: true,
      data: {
        customer: custRes.rows[0],
        addresses: addresses.rows,
        orders: orders.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Staff: Toggle customer active status
router.patch('/admin/:id/toggle-status', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);

    const upd = await pool.query(`
      UPDATE customers
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING id, business_name, is_active;
    `, [customerId]);

    if (upd.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    res.json({
      success: true,
      message: `Customer account ${upd.rows[0].is_active ? 'activated' : 'deactivated'}`,
      data: upd.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
