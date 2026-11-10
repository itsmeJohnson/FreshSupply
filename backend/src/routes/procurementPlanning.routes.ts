import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Multi-Supplier Quotation Comparison for a specific SKU
router.get('/quote-comparison/:productId', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const prodId = parseInt(req.params.productId, 10);
    const prodRes = await pool.query('SELECT * FROM products WHERE id = $1', [prodId]);
    if (prodRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    const product = prodRes.rows[0];

    const quotesRes = await pool.query(`
      SELECT 
        sq.*,
        v.business_name as vendor_name,
        v.vendor_code,
        v.city as vendor_city,
        v.business_type,
        v.verification_status,
        COALESCE(
          (SELECT ROUND(AVG(qc_score), 1) FROM goods_received_notes grn WHERE grn.vendor_id = v.id),
          95.0
        ) as historical_qc_score,
        (SELECT COUNT(*) FROM purchase_orders po WHERE po.vendor_id = v.id) as total_past_pos
      FROM supplier_quotations sq
      JOIN vendors v ON v.id = sq.vendor_id
      WHERE sq.product_id = $1 AND sq.valid_until >= CURRENT_DATE
      ORDER BY sq.quoted_price ASC
    `, [prodId]);

    // Compute optimal purchase recommendation: lowest cost with QC >= 90
    const quotes = quotesRes.rows;
    let recommendedQuoteId = quotes.length > 0 ? quotes[0].id : null;
    let recommendationReason = 'Lowest available wholesale quotation price';

    if (quotes.length > 1) {
      // Find highest QC if price difference is small (< 5%)
      const minPrice = parseFloat(quotes[0].quoted_price);
      const highQcQuote = quotes.find(q => parseFloat(q.historical_qc_score) >= 95.0 && parseFloat(q.quoted_price) <= minPrice * 1.05);
      if (highQcQuote && highQcQuote.id !== quotes[0].id) {
        recommendedQuoteId = highQcQuote.id;
        recommendationReason = 'Optimal trade-off: Superior QC track record (95%+) within 5% of lowest price';
      }
    }

    res.json({
      success: true,
      data: {
        product,
        quotations: quotes,
        recommendedQuoteId,
        recommendationReason,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Intelligent Reorder Recommendations (Inventory & Demand Driven)
router.get('/reorder-recommendations', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.unit,
        p.price,
        p.cost_price,
        p.stock_quantity as current_stock,
        COALESCE(
          (SELECT ROUND(SUM(oi.quantity) / 14.0, 1) 
           FROM order_items oi 
           JOIN orders o ON o.id = oi.order_id 
           WHERE oi.product_id = p.id AND o.created_at >= NOW() - INTERVAL '14 days' AND o.status != 'cancelled'),
          5.0
        ) as daily_burn_rate,
        ROUND(
          p.stock_quantity / NULLIF(
            COALESCE(
              (SELECT SUM(oi.quantity) / 14.0 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = p.id AND o.created_at >= NOW() - INTERVAL '14 days' AND o.status != 'cancelled'),
              5.0
            ), 0
          ), 1
        ) as days_of_cover,
        CASE 
          WHEN p.stock_quantity <= 15 THEN 'CRITICAL'
          WHEN p.stock_quantity <= 35 THEN 'HIGH'
          WHEN p.stock_quantity <= 60 THEN 'MODERATE'
          ELSE 'SAFE'
        END as stock_risk,
        GREATEST(50, ROUND((60 - p.stock_quantity) * 1.2)) as recommended_reorder_qty,
        (
          SELECT v.business_name FROM supplier_quotations sq 
          JOIN vendors v ON v.id = sq.vendor_id 
          WHERE sq.product_id = p.id ORDER BY sq.quoted_price ASC LIMIT 1
        ) as primary_supplier,
        (
          SELECT sq.quoted_price FROM supplier_quotations sq 
          WHERE sq.product_id = p.id ORDER BY sq.quoted_price ASC LIMIT 1
        ) as best_supplier_quote
      FROM products p
      WHERE p.is_active = true
      ORDER BY days_of_cover ASC
      LIMIT 25
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 3. List & Create Purchase Requisitions
router.get('/requisitions', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, p.name as product_name, p.sku, p.unit, w.name as warehouse_name, v.business_name as vendor_name
      FROM purchase_requisitions pr
      JOIN products p ON p.id = pr.product_id
      JOIN warehouses w ON w.id = pr.warehouse_id
      LEFT JOIN vendors v ON v.id = pr.recommended_vendor_id
      ORDER BY pr.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/requisitions', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { warehouseId, productId, requestedQuantity, urgency, reason, recommendedVendorId } = req.body;
    if (!productId || !requestedQuantity) {
      res.status(400).json({ success: false, error: 'Product and requested quantity are required' });
      return;
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM purchase_requisitions');
    const prNum = `PR-${new Date().getFullYear()}-${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(4, '0')}`;
    const requester = req.staff?.name || 'Inventory Supervisor';

    const insertRes = await pool.query(`
      INSERT INTO purchase_requisitions (
        pr_number, warehouse_id, product_id, requested_quantity, urgency,
        reason, status, recommended_vendor_id, requested_by
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8)
      RETURNING *;
    `, [prNum, warehouseId || 1, productId, requestedQuantity, urgency || 'MEDIUM', reason || 'REORDER_POINT_TRIGGERED', recommendedVendorId || 1, requester]);

    res.json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

// 4. Convert Approved Requisition into Official Purchase Order (PO)
router.post('/requisitions/:id/convert-po', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prId = parseInt(req.params.id, 10);
    const prRes = await client.query('SELECT * FROM purchase_requisitions WHERE id = $1', [prId]);
    if (prRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Requisition not found' });
      client.release();
      return;
    }
    const pr = prRes.rows[0];

    const prodRes = await client.query('SELECT name, cost_price FROM products WHERE id = $1', [pr.product_id]);
    const costPrice = parseFloat(prodRes.rows[0]?.cost_price || 100);
    const lineTotal = costPrice * pr.requested_quantity;

    const countRes = await client.query('SELECT COUNT(*) FROM purchase_orders');
    const poNum = `PO-FS-${new Date().getFullYear()}-${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(4, '0')}`;
    const creator = req.staff?.name || 'Procurement Lead';

    // Insert PO
    const poRes = await client.query(`
      INSERT INTO purchase_orders (po_number, vendor_id, warehouse_id, total_amount, status, delivery_due_date, notes, created_by)
      VALUES ($1, $2, $3, $4, 'CONFIRMED', CURRENT_DATE + INTERVAL '3 days', $5, $6)
      RETURNING *;
    `, [poNum, pr.recommended_vendor_id || 1, pr.warehouse_id, lineTotal, `Generated from Requisition #${pr.pr_number}`, creator]);
    const po = poRes.rows[0];

    // Insert PO Item
    await client.query(`
      INSERT INTO purchase_order_items (po_id, product_id, unit_price, ordered_quantity, line_total)
      VALUES ($1, $2, $3, $4, $5);
    `, [po.id, pr.product_id, costPrice, pr.requested_quantity, lineTotal]);

    // Update Requisition
    await client.query(`
      UPDATE purchase_requisitions SET status = 'CONVERTED_PO', po_id = $1 WHERE id = $2
    `, [po.id, prId]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Requisition converted to Purchase Order', data: po });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
