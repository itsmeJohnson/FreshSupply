import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireCustomer, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get customer cart
router.get('/', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;

    const result = await pool.query(`
      SELECT ci.id, ci.product_id, ci.quantity, ci.updated_at,
             p.name, p.sku, p.unit, p.pack_size, p.min_order_qty, p.price,
             p.stock_quantity, p.image_url, p.is_active,
             c.name as category_name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE ci.customer_id = $1
      ORDER BY ci.updated_at DESC
    `, [customerId]);

    let subtotal = 0;
    const items = result.rows.map((row) => {
      const unitPrice = parseFloat(row.price);
      const lineTotal = Math.round(unitPrice * row.quantity * 100) / 100;
      if (row.is_active) {
        subtotal += lineTotal;
      }
      return {
        id: row.id,
        productId: row.product_id,
        name: row.name,
        sku: row.sku,
        unit: row.unit,
        packSize: row.pack_size,
        minOrderQty: row.min_order_qty,
        price: unitPrice,
        stockQuantity: row.stock_quantity,
        imageUrl: row.image_url,
        isActive: row.is_active,
        categoryName: row.category_name,
        quantity: row.quantity,
        lineTotal,
        hasStock: row.stock_quantity >= row.quantity,
        meetsMoq: row.quantity >= row.min_order_qty,
      };
    });

    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryCharge = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
    const totalAmount = subtotal + taxAmount + deliveryCharge;

    res.json({
      success: true,
      data: {
        items,
        summary: {
          itemCount: items.length,
          subtotal,
          taxAmount,
          deliveryCharge,
          totalAmount,
          freeDeliveryThreshold: 5000,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Add or update cart item
router.post('/items', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      res.status(400).json({ success: false, error: 'Valid productId and positive quantity are required' });
      return;
    }

    // Verify product exists and check MOQ
    const prodRes = await pool.query('SELECT id, name, unit, min_order_qty, is_active FROM products WHERE id = $1', [productId]);
    if (prodRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const prod = prodRes.rows[0];
    if (!prod.is_active) {
      res.status(400).json({ success: false, error: 'Product is currently not available' });
      return;
    }

    // Upsert into cart_items
    const upsert = await pool.query(`
      INSERT INTO cart_items (customer_id, product_id, quantity, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (customer_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()
      RETURNING *;
    `, [customerId, productId, quantity]);

    res.json({ success: true, message: 'Cart updated', data: upsert.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Remove item from cart
router.delete('/items/:productId', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    const productId = parseInt(req.params.productId, 10);

    await pool.query('DELETE FROM cart_items WHERE customer_id = $1 AND product_id = $2', [customerId, productId]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
});

// Clear entire cart
router.delete('/', requireCustomer, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = req.customer!.customerId;
    await pool.query('DELETE FROM cart_items WHERE customer_id = $1', [customerId]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

export default router;
