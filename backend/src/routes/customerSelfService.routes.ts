import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireCustomer, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Get Customer Saved Shopping Lists
router.get('/shopping-lists', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer?.customerId;
    const listsRes = await pool.query(`
      SELECT sl.*, 
        (SELECT COUNT(*) FROM customer_shopping_list_items sli WHERE sli.list_id = sl.id) as items_count
      FROM customer_shopping_lists sl
      WHERE sl.customer_id = $1
      ORDER BY sl.is_frequent DESC, sl.created_at DESC
    `, [customerId]);

    const listsWithItems = [];
    for (const list of listsRes.rows) {
      const itemsRes = await pool.query(`
        SELECT sli.*, p.name as product_name, p.sku, p.price as default_price
        FROM customer_shopping_list_items sli
        JOIN products p ON p.id = sli.product_id
        WHERE sli.list_id = $1
      `, [list.id]);
      listsWithItems.push({
        ...list,
        items: itemsRes.rows,
      });
    }

    res.json({ success: true, data: listsWithItems });
  } catch (err) {
    next(err);
  }
});

// 2. Create Saved Shopping List
router.post('/shopping-lists', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const customerId = req.customer?.customerId;
    const { name, description, items } = req.body;

    if (!name) {
      res.status(400).json({ success: false, error: 'Shopping list name is required' });
      client.release();
      return;
    }

    const listRes = await client.query(`
      INSERT INTO customer_shopping_lists (customer_id, name, description, is_frequent)
      VALUES ($1, $2, $3, false)
      RETURNING *;
    `, [customerId, name, description || '']);
    const list = listRes.rows[0];

    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        if (it.productId) {
          await client.query(`
            INSERT INTO customer_shopping_list_items (list_id, product_id, default_quantity, unit, packaging)
            VALUES ($1, $2, $3, $4, $5);
          `, [list.id, it.productId, it.quantity || 1, it.unit || 'Unit', it.packaging || 'Standard']);
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, data: list });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 3. Repeat Previous Order (Load items into draft cart)
router.post('/repeat-order/:orderId', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer?.customerId;
    const orderId = parseInt(req.params.orderId, 10);

    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [orderId, customerId]);
    if (orderRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found for this account' });
      return;
    }

    const itemsRes = await pool.query(`
      SELECT oi.*, p.name as product_name, p.sku, p.unit, p.price as catalog_price
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
    `, [orderId]);

    // Insert items into customer cart
    for (const it of itemsRes.rows) {
      await pool.query(`
        INSERT INTO cart_items (customer_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (customer_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity;
      `, [customerId, it.product_id, it.quantity]);
    }

    res.json({
      success: true,
      message: `Loaded ${itemsRes.rows.length} products from Order #${orderRes.rows[0].order_number} into active cart`,
      items: itemsRes.rows,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Request Order Cancellation
router.post('/cancel-request/:orderId', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer?.customerId;
    const orderId = parseInt(req.params.orderId, 10);
    const { reason } = req.body;

    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [orderId, customerId]);
    if (orderRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const order = orderRes.rows[0];
    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400).json({
        success: false,
        error: `Order cannot be cancelled because it is already ${order.status.toUpperCase()}. Please contact fulfillment hotline.`,
      });
      return;
    }

    // Cancel order and record history
    await pool.query(`
      UPDATE orders SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW() WHERE id = $2
    `, [reason || 'Customer self-service cancellation request', orderId]);

    await pool.query(`
      INSERT INTO order_status_history (order_id, status, notes, updated_by_type, updated_by_id)
      VALUES ($1, 'cancelled', $2, 'customer', $3)
    `, [orderId, reason || 'Cancelled via buyer storefront', customerId]);

    // Release reserved credit
    const credRes = await pool.query(`
      SELECT amount FROM credit_transactions WHERE customer_id = $1 AND order_id = $2 AND type = 'RESERVE' LIMIT 1
    `, [customerId, orderId]);
    if (credRes.rows.length > 0) {
      const reservedAmt = parseFloat(credRes.rows[0].amount);
      await pool.query(`
        INSERT INTO credit_transactions (customer_id, order_id, type, amount, balance_after, notes, reference_no, created_by)
        VALUES ($1, $2, 'RELEASE', $3, 0, 'Released upon customer order cancellation', $4, 'buyer_storefront')
      `, [customerId, orderId, reservedAmt, `CANCEL-${orderId}`]);
    }

    res.json({ success: true, message: 'Order successfully cancelled and credit hold released' });
  } catch (err) {
    next(err);
  }
});

export default router;
