import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';
import { OrderService } from '../services/orderService';

const router = Router();

// Staff: List inventory overview
router.get('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { lowStockOnly, search } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (lowStockOnly === 'true') {
      conditions.push(`p.stock_quantity <= 30`);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT p.id, p.sku, p.name, p.unit, p.pack_size, p.stock_quantity, p.min_order_qty,
             p.price, p.cost_price, p.is_active,
             (p.stock_quantity * p.cost_price) as stock_valuation,
             c.name as category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY p.stock_quantity ASC, p.name ASC
    `;

    const result = await pool.query(query, values);

    // Summary calculation
    const summaryRes = await pool.query(`
      SELECT 
        COUNT(*) as total_skus,
        COUNT(CASE WHEN stock_quantity <= 30 THEN 1 END) as low_stock_skus,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_skus,
        COALESCE(SUM(stock_quantity * cost_price), 0) as total_inventory_valuation
      FROM products
      WHERE is_active = true
    `);

    res.json({
      success: true,
      data: result.rows,
      summary: summaryRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// Staff: Get inventory movements log
router.get('/logs', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId, limit = '100' } = req.query;

    let query = `
      SELECT il.*, p.name as product_name, p.sku, p.unit
      FROM inventory_logs il
      JOIN products p ON p.id = il.product_id
    `;
    const values: any[] = [];

    if (productId) {
      query += ` WHERE il.product_id = $1`;
      values.push(parseInt(productId as string, 10));
    }

    query += ` ORDER BY il.created_at DESC LIMIT $${values.length + 1}`;
    values.push(parseInt(limit as string, 10));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Staff: Adjust inventory
router.post('/adjust', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId, newQuantity, reason, notes } = req.body;

    if (!productId || newQuantity === undefined || newQuantity < 0) {
      res.status(400).json({ success: false, error: 'Valid productId and non-negative newQuantity are required' });
      return;
    }

    const updated = await OrderService.adjustStock(
      productId,
      newQuantity,
      reason || 'manual_adjustment',
      notes,
      req.staff?.name || 'Staff'
    );

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to adjust stock' });
  }
});

export default router;
