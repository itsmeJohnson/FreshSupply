import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    // 1. Overall Order and Revenue Metrics
    const metricsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'dispatched' THEN 1 END) as dispatched_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders;
    `);

    // 2. Active Customers
    const custRes = await pool.query(`
      SELECT COUNT(*) as total_customers,
             COUNT(CASE WHEN is_active = true THEN 1 END) as active_customers
      FROM customers;
    `);

    // 3. Inventory Health
    const invRes = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock_quantity <= 30 AND is_active = true THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN stock_quantity = 0 AND is_active = true THEN 1 END) as out_of_stock_count
      FROM products;
    `);

    // 4. Recent Orders
    const recentOrdersRes = await pool.query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.delivery_date, o.delivery_slot, o.created_at,
             c.business_name,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.created_at DESC
      LIMIT 6;
    `);

    // 5. Category Breakdown
    const catBreakdownRes = await pool.query(`
      SELECT c.name, COUNT(p.id) as product_count,
             COALESCE(SUM(oi.line_total), 0) as category_revenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY c.id
      ORDER BY category_revenue DESC
      LIMIT 8;
    `);

    // 6. Low stock alert items
    const lowStockItemsRes = await pool.query(`
      SELECT p.id, p.sku, p.name, p.unit, p.stock_quantity, p.min_order_qty, c.name as category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.stock_quantity <= 30 AND p.is_active = true
      ORDER BY p.stock_quantity ASC
      LIMIT 8;
    `);

    res.json({
      success: true,
      data: {
        metrics: metricsRes.rows[0],
        customers: custRes.rows[0],
        inventory: invRes.rows[0],
        recentOrders: recentOrdersRes.rows,
        categoryBreakdown: catBreakdownRes.rows,
        lowStockItems: lowStockItemsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
