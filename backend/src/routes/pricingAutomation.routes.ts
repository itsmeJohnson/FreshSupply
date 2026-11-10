import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Customer-wise and SKU-wise Margin Analysis
router.get('/margins', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { categoryId, customerId, lowMarginOnly } = req.query;

    let query = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.unit,
        p.cost_price,
        p.price as catalog_price,
        c.id as customer_id,
        c.business_name,
        COALESCE(csp.custom_price, p.price) as effective_price,
        ROUND(((COALESCE(csp.custom_price, p.price) - p.cost_price) / NULLIF(COALESCE(csp.custom_price, p.price), 0) * 100), 2) as margin_percentage,
        ROUND((COALESCE(csp.custom_price, p.price) - p.cost_price), 2) as margin_amount,
        CASE 
          WHEN csp.custom_price IS NOT NULL THEN 'CUSTOM_OVERRIDE'
          ELSE 'CATALOG_DEFAULT'
        END as pricing_tier
      FROM products p
      CROSS JOIN (
        SELECT id, business_name FROM customers WHERE is_active = true LIMIT 30
      ) c
      LEFT JOIN customer_sku_prices csp ON csp.customer_id = c.id AND csp.product_id = p.id AND csp.is_active = true
      WHERE p.is_active = true
    `;
    const params: any[] = [];

    if (categoryId) {
      params.push(categoryId);
      query += ` AND p.category_id = $${params.length}`;
    }

    if (customerId) {
      params.push(customerId);
      query += ` AND c.id = $${params.length}`;
    }

    if (lowMarginOnly === 'true') {
      query += ` AND ((COALESCE(csp.custom_price, p.price) - p.cost_price) / NULLIF(COALESCE(csp.custom_price, p.price), 0) * 100) < 10.0`;
    }

    query += ` ORDER BY margin_percentage ASC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. Product-wise Customer Price Comparison
router.get('/comparison/:productId', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const prodId = parseInt(req.params.productId, 10);
    const prodRes = await pool.query('SELECT * FROM products WHERE id = $1', [prodId]);
    if (prodRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    const product = prodRes.rows[0];

    const ratesRes = await pool.query(`
      SELECT 
        c.id as customer_id,
        c.business_name,
        c.email,
        pl.name as assigned_price_list,
        COALESCE(csp.custom_price, pli.price, p.price) as effective_price,
        p.cost_price,
        ROUND(((COALESCE(csp.custom_price, pli.price, p.price) - p.cost_price) / NULLIF(COALESCE(csp.custom_price, pli.price, p.price), 0) * 100), 2) as margin_percentage,
        CASE 
          WHEN csp.custom_price IS NOT NULL THEN 'Customer Override'
          WHEN pli.price IS NOT NULL THEN 'Price List (' || pl.name || ')'
          ELSE 'Catalog Standard'
        END as rate_source,
        csp.notes as contract_notes
      FROM customers c
      CROSS JOIN products p
      LEFT JOIN customer_pricing_assignments cpa ON cpa.customer_id = c.id
      LEFT JOIN price_lists pl ON pl.id = cpa.price_list_id
      LEFT JOIN price_list_items pli ON pli.price_list_id = pl.id AND pli.product_id = p.id
      LEFT JOIN customer_sku_prices csp ON csp.customer_id = c.id AND csp.product_id = p.id AND csp.is_active = true
      WHERE p.id = $1 AND c.is_active = true
      ORDER BY effective_price ASC
      LIMIT 50
    `, [prodId]);

    res.json({
      success: true,
      data: {
        product,
        customerComparisons: ratesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. Pricing Simulator Engine
router.post('/simulator', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId, priceListId, categoryId, proposedPrice, percentageAdjustment } = req.body;

    if (!productId && !categoryId && !priceListId) {
      res.status(400).json({ success: false, error: 'Either productId, categoryId, or priceListId required for simulation' });
      return;
    }

    let affectedCustomersCount = 0;
    let currentAvgPrice = 0;
    let proposedAvgPrice = 0;
    let estimatedMonthlyVolume = 0;
    let costPrice = 0;

    if (productId) {
      const prodRes = await pool.query('SELECT price, cost_price FROM products WHERE id = $1', [productId]);
      if (prodRes.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }
      costPrice = parseFloat(prodRes.rows[0].cost_price || 0);
      const basePrice = parseFloat(prodRes.rows[0].price);

      // Fetch current effective prices across active buyers
      const curRes = await pool.query(`
        SELECT COALESCE(csp.custom_price, pli.price, p.price) as rate
        FROM customers c
        CROSS JOIN products p
        LEFT JOIN customer_pricing_assignments cpa ON cpa.customer_id = c.id
        LEFT JOIN price_lists pl ON pl.id = cpa.price_list_id
        LEFT JOIN price_list_items pli ON pli.price_list_id = pl.id AND pli.product_id = p.id
        LEFT JOIN customer_sku_prices csp ON csp.customer_id = c.id AND csp.product_id = p.id AND csp.is_active = true
        WHERE p.id = $1 AND c.is_active = true
      `, [productId]);

      affectedCustomersCount = curRes.rows.length;
      const sumRates = curRes.rows.reduce((acc, r) => acc + parseFloat(r.rate), 0);
      currentAvgPrice = affectedCustomersCount > 0 ? Math.round((sumRates / affectedCustomersCount) * 100) / 100 : basePrice;

      if (proposedPrice) {
        proposedAvgPrice = parseFloat(proposedPrice);
      } else if (percentageAdjustment) {
        proposedAvgPrice = Math.round(currentAvgPrice * (1 + parseFloat(percentageAdjustment) / 100) * 100) / 100;
      }

      // Past 30 days demand volume
      const demandRes = await pool.query(`
        SELECT COALESCE(SUM(quantity), 500) as total_qty
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id = $1 AND o.created_at >= NOW() - INTERVAL '30 days'
      `, [productId]);
      estimatedMonthlyVolume = parseInt(demandRes.rows[0].total_qty, 10) || 500;
    }

    const priceDelta = proposedAvgPrice - currentAvgPrice;
    const percentageDelta = currentAvgPrice > 0 ? Math.round((priceDelta / currentAvgPrice) * 10000) / 100 : 0;
    const estimatedRevenueImpact = Math.round(priceDelta * estimatedMonthlyVolume * 100) / 100;
    const currentGrossProfit = (currentAvgPrice - costPrice) * estimatedMonthlyVolume;
    const proposedGrossProfit = (proposedAvgPrice - costPrice) * estimatedMonthlyVolume;
    const estimatedMarginImpact = Math.round((proposedGrossProfit - currentGrossProfit) * 100) / 100;
    const currentMarginPct = currentAvgPrice > 0 ? Math.round(((currentAvgPrice - costPrice) / currentAvgPrice) * 10000) / 100 : 0;
    const proposedMarginPct = proposedAvgPrice > 0 ? Math.round(((proposedAvgPrice - costPrice) / proposedAvgPrice) * 10000) / 100 : 0;

    res.json({
      success: true,
      data: {
        affectedCustomersCount,
        estimatedMonthlyVolume,
        currentAvgPrice,
        proposedAvgPrice,
        priceDelta,
        percentageDelta,
        estimatedRevenueImpact,
        estimatedMarginImpact,
        currentMarginPct,
        proposedMarginPct,
        minMarginWarning: proposedMarginPct < 10.0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 4. List Price Change Requests (Approval Queue)
router.get('/requests', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT pcr.*, p.name as product_name, p.sku as product_sku
      FROM price_change_requests pcr
      LEFT JOIN products p ON p.id = pcr.entity_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND pcr.status = $${params.length}`;
    }
    query += ` ORDER BY pcr.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 5. Submit Price Change Request
router.post('/requests', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { requestType, entityId, proposedPrice, reason } = req.body;
    if (!entityId || !proposedPrice || !reason) {
      res.status(400).json({ success: false, error: 'Entity ID, proposed price, and reason are required' });
      return;
    }

    const prodRes = await pool.query('SELECT price FROM products WHERE id = $1', [entityId]);
    const previousPrice = prodRes.rows[0]?.price ? parseFloat(prodRes.rows[0].price) : 0;
    const pctChange = previousPrice > 0 ? Math.round(((proposedPrice - previousPrice) / previousPrice) * 10000) / 100 : 0;

    const countRes = await pool.query('SELECT COUNT(*) FROM price_change_requests');
    const reqNum = `PCR-${new Date().getFullYear()}-${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(3, '0')}`;

    const requester = req.staff?.name || 'Category Manager';

    const insertRes = await pool.query(`
      INSERT INTO price_change_requests (
        request_number, request_type, entity_id, proposed_price, previous_price,
        percentage_change, reason, status, requested_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8)
      RETURNING *;
    `, [reqNum, requestType || 'CUSTOMER_SKU', entityId, proposedPrice, previousPrice, pctChange, reason, requester]);

    res.json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

// 6. Review & Apply Price Change Request (Approval Workflow)
router.patch('/requests/:id/review', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const requestId = parseInt(req.params.id, 10);
    const { action, reviewNotes } = req.body; // action: 'APPROVED' | 'REJECTED'

    if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
      res.status(400).json({ success: false, error: 'Valid action (APPROVED or REJECTED) required' });
      client.release();
      return;
    }

    const reqRes = await client.query('SELECT * FROM price_change_requests WHERE id = $1', [requestId]);
    if (reqRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Request not found' });
      client.release();
      return;
    }

    const pcr = reqRes.rows[0];
    const reviewer = req.staff?.name || 'Administrator';

    if (action === 'APPROVED') {
      // Apply the price change to products table or price lists
      await client.query(`
        UPDATE products SET price = $1, updated_at = NOW() WHERE id = $2
      `, [pcr.proposed_price, pcr.entity_id]);

      // Record audit log in price_change_logs
      await client.query(`
        INSERT INTO price_change_logs (change_type, entity_id, old_price, new_price, reason, changed_by)
        VALUES ('PRODUCT_BASE', $1, $2, $3, $4, $5)
      `, [pcr.entity_id, pcr.previous_price, pcr.proposed_price, `Approved PCR #${pcr.request_number}: ${pcr.reason}`, reviewer]);
    }

    const updateRes = await client.query(`
      UPDATE price_change_requests
      SET status = $1, reviewed_by = $2, review_notes = $3, reviewed_at = NOW()
      WHERE id = $4
      RETURNING *;
    `, [action, reviewer, reviewNotes || '', requestId]);

    await client.query('COMMIT');
    res.json({ success: true, data: updateRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
