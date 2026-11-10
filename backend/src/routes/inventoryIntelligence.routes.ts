import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. FEFO Near-Expiry & Batch Traceability
router.get('/expiry-fefo', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        wi.id as inventory_id,
        wi.batch_number,
        wi.stock_quantity,
        wi.expiry_date,
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.unit,
        w.name as warehouse_name,
        w.temperature_zone,
        (wi.expiry_date - CURRENT_DATE) as days_to_expiry,
        CASE 
          WHEN (wi.expiry_date - CURRENT_DATE) <= 7 THEN 'CRITICAL_ACTION_REQUIRED'
          WHEN (wi.expiry_date - CURRENT_DATE) <= 15 THEN 'EXPIRING_SOON'
          WHEN (wi.expiry_date - CURRENT_DATE) <= 30 THEN 'MODERATE_SHELF_LIFE'
          ELSE 'SAFE'
        END as expiry_risk_level,
        ROUND(wi.stock_quantity * p.cost_price, 2) as inventory_exposure_value
      FROM warehouse_inventory wi
      JOIN products p ON p.id = wi.product_id
      JOIN warehouses w ON w.id = wi.warehouse_id
      WHERE wi.stock_quantity > 0 AND wi.expiry_date IS NOT NULL
      ORDER BY wi.expiry_date ASC
      LIMIT 50
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. Inventory Health, Valuation & Movement Velocity
router.get('/stock-health', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    // Inventory Valuation Summary
    const valRes = await pool.query(`
      SELECT 
        COALESCE(SUM(wi.stock_quantity * p.cost_price), 0) as total_valuation_at_cost,
        COALESCE(SUM(wi.stock_quantity * p.price), 0) as total_valuation_at_wholesale,
        COALESCE(SUM(wi.stock_quantity), 0) as total_units_in_stock,
        COUNT(DISTINCT wi.product_id) as total_active_skus
      FROM warehouse_inventory wi
      JOIN products p ON p.id = wi.product_id
    `);
    const valuation = valRes.rows[0];

    // Velocity Breakdown: Fast-moving, Slow-moving, Dead stock
    const velocityRes = await pool.query(`
      WITH product_sales AS (
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.unit,
          p.stock_quantity,
          p.cost_price,
          COALESCE(SUM(oi.quantity), 0) as sold_14d,
          COALESCE(SUM(oi.line_total), 0) as revenue_14d
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at >= NOW() - INTERVAL '14 days' AND o.status != 'cancelled'
        GROUP BY p.id, p.name, p.sku, p.unit, p.stock_quantity, p.cost_price
      )
      SELECT 
        *,
        CASE 
          WHEN sold_14d >= 20 THEN 'FAST_MOVING'
          WHEN sold_14d > 0 THEN 'SLOW_MOVING'
          ELSE 'DEAD_STOCK'
        END as velocity_status,
        ROUND(stock_quantity * cost_price, 2) as locked_capital
      FROM product_sales
      ORDER BY sold_14d DESC
    `);

    const products = velocityRes.rows;
    const fastMoving = products.filter(p => p.velocity_status === 'FAST_MOVING');
    const slowMoving = products.filter(p => p.velocity_status === 'SLOW_MOVING');
    const deadStock = products.filter(p => p.velocity_status === 'DEAD_STOCK');

    res.json({
      success: true,
      data: {
        valuation: {
          totalCostValuation: Math.round(parseFloat(valuation.total_valuation_at_cost)),
          totalWholesaleValuation: Math.round(parseFloat(valuation.total_valuation_at_wholesale)),
          potentialGrossMargin: Math.round(parseFloat(valuation.total_valuation_at_wholesale) - parseFloat(valuation.total_valuation_at_cost)),
          totalUnits: parseInt(valuation.total_units_in_stock, 10),
          activeSkusCount: parseInt(valuation.total_active_skus, 10),
        },
        counts: {
          fastMovingCount: fastMoving.length,
          slowMovingCount: slowMoving.length,
          deadStockCount: deadStock.length,
        },
        fastMoving: fastMoving.slice(0, 10),
        deadStock: deadStock.slice(0, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

