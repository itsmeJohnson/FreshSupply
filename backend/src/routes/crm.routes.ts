import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Get all CRM Leads
router.get('/leads', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT l.*, s.name as rep_name,
        (SELECT COUNT(*) FROM crm_activities a WHERE a.lead_id = l.id) as activities_count,
        (SELECT a.summary FROM crm_activities a WHERE a.lead_id = l.id ORDER BY a.created_at DESC LIMIT 1) as last_activity_summary,
        (SELECT a.created_at FROM crm_activities a WHERE a.lead_id = l.id ORDER BY a.created_at DESC LIMIT 1) as last_activity_date
      FROM crm_leads l
      LEFT JOIN staff_users s ON s.id = l.assigned_rep_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND l.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (l.business_name ILIKE $${params.length} OR l.contact_person ILIKE $${params.length} OR l.email ILIKE $${params.length})`;
    }

    query += ` ORDER BY l.updated_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. Register New Lead
router.post('/leads', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { businessName, contactPerson, email, phone, businessType, city, estimatedMonthlyValue, assignedRepId, source, notes } = req.body;
    if (!businessName || !contactPerson || !email || !phone) {
      res.status(400).json({ success: false, error: 'Business name, contact person, email, and phone are required' });
      return;
    }

    const repId = assignedRepId || req.staff?.staffId || 1;

    const result = await pool.query(`
      INSERT INTO crm_leads (
        business_name, contact_person, email, phone, business_type, city,
        estimated_monthly_value, status, assigned_rep_id, source, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'NEW', $8, $9, $10)
      RETURNING *;
    `, [businessName, contactPerson, email, phone, businessType || 'Restaurant', city || 'Bangalore', estimatedMonthlyValue || 0, repId, source || 'Field Sales', notes || '']);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// 3. Record Sales Activity (Call, Meeting, Proposal, Note)
router.post('/leads/:id/activity', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { activityType, summary, details, scheduledAt, outcome, newLeadStatus } = req.body;

    if (!summary || !activityType) {
      res.status(400).json({ success: false, error: 'Activity type and summary are required' });
      return;
    }

    const performer = req.staff?.name || 'Sales Representative';

    const actRes = await pool.query(`
      INSERT INTO crm_activities (lead_id, activity_type, summary, details, scheduled_at, completed_at, performed_by, outcome)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING *;
    `, [leadId, activityType, summary, details || '', scheduledAt || null, performer, outcome || 'COMPLETED']);

    if (newLeadStatus) {
      await pool.query('UPDATE crm_leads SET status = $1, updated_at = NOW() WHERE id = $2', [newLeadStatus, leadId]);
    }

    res.json({ success: true, data: actRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

// 4. Convert Lead to Registered Wholesale Customer
router.post('/leads/:id/convert', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const leadId = parseInt(req.params.id, 10);
    const leadRes = await client.query('SELECT * FROM crm_leads WHERE id = $1', [leadId]);
    if (leadRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      client.release();
      return;
    }
    const lead = leadRes.rows[0];

    // Check if customer already exists with this email
    const existCust = await client.query('SELECT id FROM customers WHERE email = $1', [lead.email]);
    let custId: number;

    if (existCust.rows.length > 0) {
      custId = existCust.rows[0].id;
    } else {
      // Create new customer account with default temp hash
      const custInsert = await client.query(`
        INSERT INTO customers (email, password_hash, business_name, contact_person, phone, is_active)
        VALUES ($1, 'scrypt:converted_lead_account', $2, $3, $4, true)
        RETURNING id;
      `, [lead.email, lead.business_name, lead.contact_person, lead.phone]);
      custId = custInsert.rows[0].id;

      // Assign Default Price List (Standard Wholesale)
      await client.query(`
        INSERT INTO customer_pricing_assignments (customer_id, price_list_id, assigned_by)
        VALUES ($1, 1, 'CRM Lead Conversion')
        ON CONFLICT (customer_id) DO NOTHING;
      `, [custId]);

      // Assign Starter Credit Account (Net 15 Days, ₹1.5L)
      await client.query(`
        INSERT INTO credit_accounts (customer_id, credit_enabled, credit_limit, credit_period_days, payment_terms, status)
        VALUES ($1, true, 150000.00, 15, 'Net 15', 'good_standing')
        ON CONFLICT (customer_id) DO NOTHING;
      `, [custId]);

      // Add default Bangalore receiving bay address
      await client.query(`
        INSERT INTO customer_addresses (customer_id, label, address_line1, city, state, postal_code, is_default, contact_phone)
        VALUES ($1, 'Main Kitchen / Receiving Bay', 'Commercial Bay, Industrial Suburb', 'Bangalore', 'Karnataka', '560001', true, $2);
      `, [custId, lead.phone]);
    }

    // Mark lead as CONVERTED
    await client.query('UPDATE crm_leads SET status = $1, customer_id = $2, updated_at = NOW() WHERE id = $3', ['CONVERTED', custId, leadId]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Lead converted into wholesale customer account', customerId: custId });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 5. Customer 360-Degree Comprehensive Profile
router.get('/customer-360/:customerId', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const custId = parseInt(req.params.customerId, 10);
    const custRes = await pool.query('SELECT * FROM customers WHERE id = $1', [custId]);
    if (custRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    const customer = custRes.rows[0];

    // Total Purchases & Order Metrics
    const orderMetricsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as lifetime_spend,
        COALESCE(AVG(total_amount), 0) as average_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        MAX(created_at) as last_order_date
      FROM orders
      WHERE customer_id = $1
    `, [custId]);
    const metrics = orderMetricsRes.rows[0];

    // Top 5 Most Purchased Products
    const topProdsRes = await pool.query(`
      SELECT 
        oi.product_name_snapshot as name,
        oi.sku_snapshot as sku,
        SUM(oi.quantity) as total_qty,
        SUM(oi.line_total) as total_spent,
        COUNT(DISTINCT oi.order_id) as order_frequency
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.customer_id = $1 AND o.status != 'cancelled'
      GROUP BY oi.product_name_snapshot, oi.sku_snapshot
      ORDER BY total_spent DESC
      LIMIT 5
    `, [custId]);

    // Credit Profile & Exposure
    const creditRes = await pool.query('SELECT * FROM credit_accounts WHERE customer_id = $1', [custId]);
    const credit = creditRes.rows[0] || { credit_limit: 0, credit_period_days: 0, payment_terms: 'Advance / COD', status: 'unconfigured' };

    const outstandingRes = await pool.query(`
      SELECT COALESCE(SUM(CASE WHEN type IN ('CHARGE', 'RESERVE') THEN amount WHEN type IN ('PAYMENT', 'REVERSAL', 'RELEASE') THEN -amount ELSE 0 END), 0) as balance
      FROM credit_transactions WHERE customer_id = $1
    `, [custId]);
    const outstanding = Math.max(0, parseFloat(outstandingRes.rows[0]?.balance || 0));
    const creditLimit = parseFloat(credit.credit_limit || 0);
    const availableCredit = Math.max(0, creditLimit - outstanding);
    const creditUtilizationPct = creditLimit > 0 ? Math.min(100, Math.round((outstanding / creditLimit) * 100)) : 0;

    // Active Commercial Contract
    const contractRes = await pool.query(`
      SELECT * FROM customer_contracts WHERE customer_id = $1 AND status = 'ACTIVE' LIMIT 1
    `, [custId]);

    // Negotiated SKU Pricing Overrides
    const skuPricesRes = await pool.query(`
      SELECT csp.*, p.name as product_name, p.sku, p.unit, p.price as catalog_price
      FROM customer_sku_prices csp
      JOIN products p ON p.id = csp.product_id
      WHERE csp.customer_id = $1 AND csp.is_active = true
    `, [custId]);

    // Recent Invoices
    const invoicesRes = await pool.query(`
      SELECT id, invoice_number, total_amount, amount_paid, due_date, status, created_at
      FROM invoices WHERE customer_id = $1
      ORDER BY created_at DESC LIMIT 5
    `, [custId]);

    // Recent Payments
    const paymentsRes = await pool.query(`
      SELECT payment_reference, amount, payment_method, transaction_id, recorded_at
      FROM payments WHERE customer_id = $1
      ORDER BY recorded_at DESC LIMIT 5
    `, [custId]);

    // Claims & Complaints
    const claimsRes = await pool.query(`
      SELECT claim_number, claim_type, defect_grade, claim_value, status, created_at
      FROM claim_tickets WHERE customer_id = $1
      ORDER BY created_at DESC LIMIT 5
    `, [custId]);

    // Sales Rep and Recent CRM Activity
    const crmLeadRes = await pool.query(`
      SELECT l.*, s.name as rep_name
      FROM crm_leads l
      LEFT JOIN staff_users s ON s.id = l.assigned_rep_id
      WHERE l.customer_id = $1 OR l.email = $2
      LIMIT 1
    `, [custId, customer.email]);

    res.json({
      success: true,
      data: {
        customer,
        metrics: {
          totalOrders: parseInt(metrics.total_orders, 10),
          lifetimeSpend: parseFloat(metrics.lifetime_spend),
          averageOrderValue: Math.round(parseFloat(metrics.average_order_value)),
          deliveredOrders: parseInt(metrics.delivered_orders, 10),
          cancelledOrders: parseInt(metrics.cancelled_orders, 10),
          lastOrderDate: metrics.last_order_date,
        },
        topProducts: topProdsRes.rows,
        creditProfile: {
          creditLimit,
          outstandingBalance: outstanding,
          availableCredit,
          utilizationPercentage: creditUtilizationPct,
          creditPeriodDays: credit.credit_period_days,
          paymentTerms: credit.payment_terms,
          status: credit.status,
        },
        commercialContract: contractRes.rows[0] || null,
        negotiatedPrices: skuPricesRes.rows,
        recentInvoices: invoicesRes.rows,
        recentPayments: paymentsRes.rows,
        claims: claimsRes.rows,
        salesRep: crmLeadRes.rows[0]?.rep_name || 'Accounts Manager',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
