import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireCustomer, requireStaff, AuthenticatedRequest } from '../middleware/auth';
import { OrderService } from '../services/orderService';

const router = Router();

// Customer: Place an order
router.post('/', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const { deliveryAddressId, deliveryDate, deliverySlot, poReference, notes, items } = req.body;

    if (!deliveryAddressId || !deliveryDate || !deliverySlot || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required order details: deliveryAddressId, deliveryDate, deliverySlot, items',
      });
      return;
    }

    const order = await OrderService.createOrder({
      customerId,
      deliveryAddressId,
      deliveryDate,
      deliverySlot,
      poReference,
      notes,
      items,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully and inventory reserved',
      data: order,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to place order' });
  }
});

// Customer: List customer's orders
router.get('/', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const { status, limit = '50', offset = '0' } = req.query;

    const conditions: string[] = ['customer_id = $1'];
    const values: any[] = [customerId];
    let idx = 2;

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const query = `
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      WHERE ${conditions.join(' AND ')}
      ORDER BY o.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Customer: Get order details
router.get('/:id', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const orderId = parseInt(req.params.id, 10);

    const orderRes = await pool.query(`
      SELECT o.*, c.business_name, c.email as customer_email
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1 AND o.customer_id = $2
    `, [orderId, customerId]);

    if (orderRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const itemsRes = await pool.query(`
      SELECT oi.*, p.image_url, p.stock_quantity as current_stock, p.is_active as current_active
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `, [orderId]);

    const historyRes = await pool.query(`
      SELECT * FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at ASC
    `, [orderId]);

    res.json({
      success: true,
      data: {
        order: orderRes.rows[0],
        items: itemsRes.rows,
        history: historyRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Customer: Request cancellation
router.post('/:id/cancel', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const orderId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1 AND customer_id = $2', [orderId, customerId]);
    if (orderCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (orderCheck.rows[0].status !== 'pending') {
      res.status(400).json({
        success: false,
        error: `Order cannot be cancelled because it is already in "${orderCheck.rows[0].status}" status. Please contact operations.`,
      });
      return;
    }

    const updated = await OrderService.updateOrderStatus(
      orderId,
      'cancelled',
      `Cancelled by customer: ${reason || 'Customer request'}`,
      { type: 'customer', id: customerId.toString(), name: req.customer?.businessName },
      reason || 'Customer requested cancellation'
    );

    res.json({ success: true, message: 'Order cancelled successfully and inventory restored', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to cancel order' });
  }
});

// Staff: List all orders with filters
router.get('/admin/all', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, search, date, limit = '100', offset = '0' } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(`o.status = $${idx++}`);
      values.push(status);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(o.order_number ILIKE $${idx} OR c.business_name ILIKE $${idx} OR o.contact_person ILIKE $${idx} OR o.po_reference ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    if (date && typeof date === 'string') {
      conditions.push(`o.delivery_date = $${idx++}`);
      values.push(date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT o.*, c.business_name, c.email as customer_email,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values.slice(0, values.length - 2));

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countRes.rows[0].total, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Staff: Get single order
router.get('/admin/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);

    const orderRes = await pool.query(`
      SELECT o.*, c.business_name, c.email as customer_email, c.phone as customer_phone, c.gst_number
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1
    `, [orderId]);

    if (orderRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const itemsRes = await pool.query(`
      SELECT oi.*, p.image_url, p.stock_quantity as current_stock
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `, [orderId]);

    const historyRes = await pool.query(`
      SELECT * FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at ASC
    `, [orderId]);

    res.json({
      success: true,
      data: {
        order: orderRes.rows[0],
        items: itemsRes.rows,
        history: historyRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Staff: Update order status
router.patch('/admin/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, notes, cancellationReason } = req.body;

    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required' });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: `Invalid status: ${status}` });
      return;
    }

    const updated = await OrderService.updateOrderStatus(
      orderId,
      status,
      notes || `Status transitioned to ${status} by ${req.staff?.name}`,
      { type: 'staff', id: req.staff!.staffId.toString(), name: req.staff?.name },
      cancellationReason
    );

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update order status' });
  }
});

export default router;
