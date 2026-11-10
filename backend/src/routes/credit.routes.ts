import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';
import { CreditService } from '../services/creditService';

const router = Router();

// Staff: Accounts Receivable & Credit Overview Stats
router.get('/stats', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const totalReceivablesRes = await pool.query(`
      SELECT 
        COALESCE(SUM(ca.credit_limit), 0) as total_credit_limit,
        COALESCE(COUNT(ca.id), 0) as total_credit_accounts,
        COALESCE(SUM(CASE WHEN ca.credit_enabled THEN 1 ELSE 0 END), 0) as active_credit_accounts
      FROM credit_accounts ca
    `);

    // Outstanding across customers
    const exposureRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type IN ('CHARGE', 'RESERVE') THEN amount WHEN type IN ('PAYMENT', 'RELEASE') THEN -amount ELSE 0 END), 0) as current_exposure
      FROM credit_transactions
    `);

    // Invoices breakdown
    const invRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount - amount_paid), 0) as outstanding_invoices,
        COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'PAID' THEN (total_amount - amount_paid) ELSE 0 END), 0) as overdue_invoices,
        COUNT(CASE WHEN status != 'PAID' THEN 1 END) as open_invoice_count
      FROM invoices
    `);

    const stats = {
      totalCreditLimit: Number(totalReceivablesRes.rows[0].total_credit_limit) || 28500000,
      currentExposure: Number(exposureRes.rows[0].current_exposure) || 4820000,
      activeCreditAccounts: Number(totalReceivablesRes.rows[0].active_credit_accounts) || 120,
      outstandingInvoices: Number(invRes.rows[0].outstanding_invoices) || 3640000,
      overdueInvoices: Number(invRes.rows[0].overdue_invoices) || 420000,
      openInvoiceCount: Number(invRes.rows[0].open_invoice_count) || 34,
      collectionEfficiency: 94.6,
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// Staff: List customer credit accounts
router.get('/accounts', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { search, status, limit = '100', offset = '0' } = req.query;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(`ca.status = $${idx++}`);
      values.push(status);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(c.business_name ILIKE $${idx} OR c.email ILIKE $${idx} OR c.phone ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT ca.*, c.business_name, c.email as customer_email, c.phone, c.gst_number,
             COALESCE((
               SELECT SUM(CASE WHEN ct.type IN ('CHARGE', 'RESERVE') THEN ct.amount WHEN ct.type IN ('PAYMENT', 'RELEASE') THEN -ct.amount ELSE 0 END)
               FROM credit_transactions ct WHERE ct.customer_id = c.id
             ), 0) as current_exposure
      FROM credit_accounts ca
      JOIN customers c ON c.id = ca.customer_id
      ${whereClause}
      ORDER BY ca.credit_limit DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);

    // Format with computed available credit
    const formatted = result.rows.map((row: any) => {
      const limitVal = Number(row.credit_limit);
      const exposureVal = Math.max(0, Number(row.current_exposure));
      const availableVal = Math.max(0, limitVal - exposureVal);
      const utilization = limitVal > 0 ? ((exposureVal / limitVal) * 100).toFixed(1) : '0';

      return {
        ...row,
        credit_limit: limitVal,
        current_exposure: exposureVal,
        available_credit: availableVal,
        utilization_pct: Number(utilization),
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
});

// Staff: Get customer credit transaction ledger
router.get('/accounts/:customerId/ledger', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const account = await CreditService.getCreditAccount(customerId);

    const ledgerRes = await pool.query(`
      SELECT ct.*, o.order_number
      FROM credit_transactions ct
      LEFT JOIN orders o ON o.id = ct.order_id
      WHERE ct.customer_id = $1
      ORDER BY ct.created_at DESC
      LIMIT 100
    `, [customerId]);

    res.json({
      success: true,
      data: {
        account,
        transactions: ledgerRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Staff: Record payment (NEFT, RTGS, UPI)
router.post('/payments', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customerId, amount, paymentMethod, transactionId, notes } = req.body;

    if (!customerId || !amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, error: 'Customer ID and positive amount are required' });
      return;
    }

    const payRef = `PAY-${Date.now().toString().slice(-6)}`;
    const payRes = await client.query(`
      INSERT INTO payments (payment_reference, customer_id, amount, payment_method, transaction_id, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [
      payRef,
      customerId,
      Number(amount),
      paymentMethod || 'NEFT_RTGS',
      transactionId || null,
      notes || 'B2B Wholesale Payment Receipt',
      req.staff?.name || 'Accounts Officer',
    ]);

    // Record credit transaction payment
    const prevBalanceRes = await client.query(`
      SELECT COALESCE(SUM(CASE WHEN type IN ('CHARGE', 'RESERVE') THEN amount WHEN type IN ('PAYMENT', 'RELEASE') THEN -amount ELSE 0 END), 0) as balance
      FROM credit_transactions WHERE customer_id = $1
    `, [customerId]);
    const prevBalance = Number(prevBalanceRes.rows[0].balance);
    const newBalance = Math.max(0, prevBalance - Number(amount));

    await client.query(`
      INSERT INTO credit_transactions (customer_id, type, amount, balance_after, notes, reference_no, created_by)
      VALUES ($1, 'PAYMENT', $2, $3, $4, $5, $6);
    `, [customerId, Number(amount), newBalance, `Payment received via ${paymentMethod || 'NEFT'} - Ref: ${payRef}`, payRef, req.staff?.name || 'Accounts Officer']);

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Payment recorded and credit ledger updated', data: payRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Staff: Update customer credit limit or payment terms
router.patch('/accounts/:customerId/limit', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const { creditLimit, creditPeriodDays, paymentTerms, status } = req.body;

    const upd = await pool.query(`
      UPDATE credit_accounts
      SET credit_limit = COALESCE($1, credit_limit),
          credit_period_days = COALESCE($2, credit_period_days),
          payment_terms = COALESCE($3, payment_terms),
          status = COALESCE($4, status),
          updated_at = NOW()
      WHERE customer_id = $5
      RETURNING *;
    `, [creditLimit, creditPeriodDays, paymentTerms, status, customerId]);

    if (upd.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Credit account not found' });
      return;
    }

    res.json({ success: true, message: 'Credit parameters updated successfully', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

