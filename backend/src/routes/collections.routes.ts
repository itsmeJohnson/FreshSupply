import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Receivables Summary & Aging Report
router.get('/aging-report', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    // Group invoices into the 5 standard B2B aging buckets
    const agingQuery = await pool.query(`
      WITH invoice_aging AS (
        SELECT 
          i.id as invoice_id,
          i.invoice_number,
          i.customer_id,
          c.business_name,
          c.contact_person,
          c.phone as contact_phone,
          c.email as customer_email,
          i.total_amount,
          i.amount_paid,
          (i.total_amount - i.amount_paid) as balance_due,
          i.due_date,
          (CURRENT_DATE - i.due_date) as days_overdue,
          CASE 
            WHEN CURRENT_DATE <= i.due_date THEN 'NOT_DUE'
            WHEN (CURRENT_DATE - i.due_date) BETWEEN 1 AND 30 THEN 'DAYS_1_30'
            WHEN (CURRENT_DATE - i.due_date) BETWEEN 31 AND 60 THEN 'DAYS_31_60'
            WHEN (CURRENT_DATE - i.due_date) BETWEEN 61 AND 90 THEN 'DAYS_61_90'
            ELSE 'DAYS_90_PLUS'
          END as aging_bucket
        FROM invoices i
        JOIN customers c ON c.id = i.customer_id
        WHERE i.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')
      )
      SELECT * FROM invoice_aging
      ORDER BY days_overdue DESC
    `);

    const invoices = agingQuery.rows;

    // Bucket Aggregations
    let notDueTotal = 0;
    let days1To30Total = 0;
    let days31To60Total = 0;
    let days61To90Total = 0;
    let days90PlusTotal = 0;
    let totalReceivables = 0;

    for (const inv of invoices) {
      const bal = parseFloat(inv.balance_due);
      totalReceivables += bal;
      if (inv.aging_bucket === 'NOT_DUE') notDueTotal += bal;
      else if (inv.aging_bucket === 'DAYS_1_30') days1To30Total += bal;
      else if (inv.aging_bucket === 'DAYS_31_60') days31To60Total += bal;
      else if (inv.aging_bucket === 'DAYS_61_90') days61To90Total += bal;
      else if (inv.aging_bucket === 'DAYS_90_PLUS') days90PlusTotal += bal;
    }

    const totalOverdue = days1To30Total + days31To60Total + days61To90Total + days90PlusTotal;

    res.json({
      success: true,
      data: {
        summary: {
          totalReceivables: Math.round(totalReceivables * 100) / 100,
          totalOverdue: Math.round(totalOverdue * 100) / 100,
          notDueTotal: Math.round(notDueTotal * 100) / 100,
          days1To30Total: Math.round(days1To30Total * 100) / 100,
          days31To60Total: Math.round(days31To60Total * 100) / 100,
          days61To90Total: Math.round(days61To90Total * 100) / 100,
          days90PlusTotal: Math.round(days90PlusTotal * 100) / 100,
          overdueInvoicesCount: invoices.filter(i => i.aging_bucket !== 'NOT_DUE').length,
          totalOpenInvoicesCount: invoices.length,
        },
        invoices,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Customer Outstanding Balances with Credit Exposure
router.get('/customer-receivables', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id as customer_id,
        c.business_name,
        c.contact_person,
        c.phone,
        ca.credit_limit,
        ca.credit_period_days,
        ca.status as credit_status,
        COALESCE(
          (SELECT SUM(total_amount - amount_paid) FROM invoices i WHERE i.customer_id = c.id AND i.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')),
          0
        ) as total_invoice_due,
        COALESCE(
          (SELECT SUM(total_amount - amount_paid) FROM invoices i WHERE i.customer_id = c.id AND i.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE') AND CURRENT_DATE > i.due_date),
          0
        ) as overdue_amount,
        COALESCE(
          (SELECT COUNT(*) FROM invoices i WHERE i.customer_id = c.id AND i.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')),
          0
        ) as open_invoices_count,
        ROUND((
          COALESCE(
            (SELECT SUM(total_amount - amount_paid) FROM invoices i WHERE i.customer_id = c.id AND i.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')),
            0
          ) / NULLIF(ca.credit_limit, 0) * 100
        ), 1) as credit_utilization_pct
      FROM customers c
      JOIN credit_accounts ca ON ca.customer_id = c.id
      ORDER BY total_invoice_due DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 3. Allocate Payment Against Invoices
router.post('/allocate-payment', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customerId, amount, paymentMethod, transactionId, invoiceAllocations, notes } = req.body;

    if (!customerId || !amount || amount <= 0) {
      res.status(400).json({ success: false, error: 'Customer ID and positive amount are required' });
      client.release();
      return;
    }

    const countRes = await client.query('SELECT COUNT(*) FROM payments');
    const payRef = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(4, '0')}`;
    const recorder = req.staff?.name || 'Accounts Specialist';

    // 1. Record in payments table
    const payRes = await client.query(`
      INSERT INTO payments (payment_reference, customer_id, amount, payment_method, transaction_id, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [payRef, customerId, amount, paymentMethod || 'NEFT_RTGS', transactionId || `TXN-${Date.now()}`, notes || '', recorder]);
    const payment = payRes.rows[0];

    // 2. Double-entry credit transaction to reduce credit exposure
    const creditRes = await client.query(`
      SELECT COALESCE(SUM(CASE WHEN type IN ('CHARGE', 'RESERVE') THEN amount WHEN type IN ('PAYMENT', 'REVERSAL', 'RELEASE') THEN -amount ELSE 0 END), 0) as balance
      FROM credit_transactions WHERE customer_id = $1
    `, [customerId]);
    const currentOutstanding = Math.max(0, parseFloat(creditRes.rows[0]?.balance || 0));
    const balanceAfter = Math.max(0, currentOutstanding - amount);

    await client.query(`
      INSERT INTO credit_transactions (customer_id, type, amount, balance_after, notes, reference_no, created_by)
      VALUES ($1, 'PAYMENT', $2, $3, $4, $5, $6);
    `, [customerId, amount, balanceAfter, `Payment receipt ${payRef}`, payRef, recorder]);

    // 3. Allocate against specific invoices if provided
    if (Array.isArray(invoiceAllocations) && invoiceAllocations.length > 0) {
      for (const alloc of invoiceAllocations) {
        if (alloc.invoiceId && alloc.amount > 0) {
          await client.query(`
            INSERT INTO payment_allocations (payment_id, invoice_id, allocated_amount)
            VALUES ($1, $2, $3);
          `, [payment.id, alloc.invoiceId, alloc.amount]);

          // Update invoice amount_paid and status
          const invRes = await client.query('SELECT total_amount, amount_paid FROM invoices WHERE id = $1', [alloc.invoiceId]);
          if (invRes.rows.length > 0) {
            const tot = parseFloat(invRes.rows[0].total_amount);
            const newPaid = parseFloat(invRes.rows[0].amount_paid) + parseFloat(alloc.amount);
            const newStatus = newPaid >= tot ? 'PAID' : 'PARTIALLY_PAID';

            await client.query(`
              UPDATE invoices SET amount_paid = $1, status = $2 WHERE id = $3
            `, [newPaid, newStatus, alloc.invoiceId]);
          }
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Payment recorded and reconciled against credit ledger', data: payment });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 4. Send Payment Reminder Notification
router.post('/reminders', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { customerId, invoiceId, channel } = req.body;
    const invRes = await pool.query(`
      SELECT i.*, c.business_name, c.contact_person, c.phone, c.email
      FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      WHERE i.id = $1
    `, [invoiceId]);

    if (invRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Invoice not found' });
      return;
    }
    const inv = invRes.rows[0];
    const balance = parseFloat(inv.total_amount) - parseFloat(inv.amount_paid);

    const title = `FreshSupply Payment Reminder: Invoice #${inv.invoice_number}`;
    const message = `Dear ${inv.business_name}, invoice #${inv.invoice_number} for ₹${balance.toLocaleString('en-IN')} was due on ${inv.due_date}. Please arrange settlement via RTGS to avoid account restriction.`;

    const notifRes = await pool.query(`
      INSERT INTO notifications (recipient_type, recipient_id, channel, event_type, title, message, status, payload)
      VALUES ('CUSTOMER', $1, $2, 'PAYMENT_REMINDER', $3, $4, 'SENT', $5)
      RETURNING *;
    `, [customerId, channel || 'WHATSAPP', title, message, JSON.stringify({ invoice_id: invoiceId, balance })]);

    res.json({ success: true, message: `Payment reminder dispatched via ${channel || 'WHATSAPP'}`, data: notifRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
