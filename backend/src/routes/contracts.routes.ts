import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. List All Commercial Contracts
router.get('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT cc.*, c.business_name, c.contact_person, c.email as customer_email,
        (SELECT COUNT(*) FROM contract_sku_terms cst WHERE cst.contract_id = cc.id) as contracted_skus_count
      FROM customer_contracts cc
      JOIN customers c ON c.id = cc.customer_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND cc.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (cc.contract_number ILIKE $${params.length} OR c.business_name ILIKE $${params.length} OR cc.title ILIKE $${params.length})`;
    }

    query += ` ORDER BY cc.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. Get Single Contract Details with SKU Terms
router.get('/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const contractId = parseInt(req.params.id, 10);
    const contractRes = await pool.query(`
      SELECT cc.*, c.business_name, c.contact_person, c.email, c.phone, c.gst_number
      FROM customer_contracts cc
      JOIN customers c ON c.id = cc.customer_id
      WHERE cc.id = $1
    `, [contractId]);

    if (contractRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Contract not found' });
      return;
    }

    const itemsRes = await pool.query(`
      SELECT cst.*, p.name as product_name, p.sku, p.unit, p.price as catalog_price, p.cost_price
      FROM contract_sku_terms cst
      JOIN products p ON p.id = cst.product_id
      WHERE cst.contract_id = $1
      ORDER BY p.name ASC
    `, [contractId]);

    res.json({
      success: true,
      data: {
        contract: contractRes.rows[0],
        skuTerms: itemsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. Create New Commercial Contract
router.post('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      customerId, title, startDate, endDate, creditPeriodDays, creditLimit,
      minOrderValue, deliveryCharge, freeDeliveryThreshold, paymentTerms,
      specialTerms, skuTerms
    } = req.body;

    if (!customerId || !title || !startDate || !endDate) {
      res.status(400).json({ success: false, error: 'Customer ID, title, start date, and end date are required' });
      client.release();
      return;
    }

    const countRes = await client.query('SELECT COUNT(*) FROM customer_contracts');
    const contractNum = `AGR-${new Date().getFullYear()}-C${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(4, '0')}`;

    const creator = req.staff?.name || 'Commercial Team';

    const insertRes = await client.query(`
      INSERT INTO customer_contracts (
        contract_number, customer_id, title, status, start_date, end_date,
        credit_period_days, credit_limit, min_order_value, delivery_charge,
        free_delivery_threshold, payment_terms, special_terms, version, created_by
      ) VALUES ($1, $2, $3, 'ACTIVE', $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, $13)
      RETURNING *;
    `, [
      contractNum, customerId, title, startDate, endDate,
      creditPeriodDays || 30, creditLimit || 500000.00, minOrderValue || 5000.00,
      deliveryCharge || 0, freeDeliveryThreshold || 10000.00,
      paymentTerms || 'Net 30 Days (Bank Transfer / NEFT)', specialTerms || '',
      creator
    ]);

    const newContract = insertRes.rows[0];

    // Synchronize into Credit Account
    await client.query(`
      INSERT INTO credit_accounts (customer_id, credit_enabled, credit_limit, credit_period_days, payment_terms, status)
      VALUES ($1, true, $2, $3, $4, 'good_standing')
      ON CONFLICT (customer_id) DO UPDATE SET 
        credit_limit = EXCLUDED.credit_limit,
        credit_period_days = EXCLUDED.credit_period_days,
        payment_terms = EXCLUDED.payment_terms;
    `, [customerId, creditLimit || 500000.00, creditPeriodDays || 30, paymentTerms || 'Net 30 Days']);

    // Synchronize Delivery Configurations
    await client.query(`
      INSERT INTO customer_delivery_configs (customer_id, delivery_zone, preferred_time_slot, min_order_value)
      VALUES ($1, 'Contract Preferred Zone', 'Early Morning (05:00 AM - 08:00 AM)', $2)
      ON CONFLICT (customer_id) DO UPDATE SET min_order_value = EXCLUDED.min_order_value;
    `, [customerId, minOrderValue || 5000.00]);

    // Insert SKU rate terms and synchronize with customer_sku_prices
    if (Array.isArray(skuTerms) && skuTerms.length > 0) {
      for (const term of skuTerms) {
        if (term.productId && term.agreedPrice) {
          await client.query(`
            INSERT INTO contract_sku_terms (contract_id, product_id, agreed_price, min_order_qty, benchmark_margin_pct, notes)
            VALUES ($1, $2, $3, $4, $5, $6);
          `, [newContract.id, term.productId, term.agreedPrice, term.minOrderQty || 1, term.marginPct || 12.00, term.notes || '']);

          // Update/Insert into customer_sku_prices for immediate pricing resolution
          await client.query(`
            INSERT INTO customer_sku_prices (customer_id, product_id, custom_price, min_order_qty, notes, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
            ON CONFLICT (customer_id, product_id) DO UPDATE SET 
              custom_price = EXCLUDED.custom_price,
              min_order_qty = EXCLUDED.min_order_qty,
              notes = EXCLUDED.notes;
          `, [customerId, term.productId, term.agreedPrice, term.minOrderQty || 1, `Contracted rate under agreement #${contractNum}`]);
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, data: newContract });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 4. Contract Status Update (Approve, Terminate, Expire)
router.patch('/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const contractId = parseInt(req.params.id, 10);
    const { status, reviewNotes } = req.body;
    const reviewer = req.staff?.name || 'Administrator';

    const result = await pool.query(`
      UPDATE customer_contracts
      SET status = $1, approved_by = $2, approved_at = NOW(), updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `, [status, reviewer, contractId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Contract not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
