import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. List All Claims & Quality Tickets
router.get('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, type } = req.query;
    let query = `
      SELECT ct.*, c.business_name, c.contact_person, c.phone, o.order_number, o.delivery_date
      FROM claim_tickets ct
      JOIN customers c ON c.id = ct.customer_id
      JOIN orders o ON o.id = ct.order_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND ct.status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND ct.claim_type = $${params.length}`;
    }
    query += ` ORDER BY ct.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. Get Single Claim Details with Quality Control History
router.get('/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const claimId = parseInt(req.params.id, 10);
    const claimRes = await pool.query(`
      SELECT ct.*, c.business_name, c.contact_person, c.phone, c.email,
        o.order_number, o.delivery_date, o.delivery_slot, o.created_at as order_created_at
      FROM claim_tickets ct
      JOIN customers c ON c.id = ct.customer_id
      JOIN orders o ON o.id = ct.order_id
      WHERE ct.id = $1
    `, [claimId]);

    if (claimRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Claim ticket not found' });
      return;
    }

    const claim = claimRes.rows[0];

    // Fetch warehouse dispatch record and QC record
    const qcRes = await pool.query(`
      SELECT grn.*, v.business_name as supplier_name, w.name as warehouse_name
      FROM goods_received_notes grn
      JOIN vendors v ON v.id = grn.vendor_id
      JOIN warehouses w ON w.id = grn.warehouse_id
      ORDER BY grn.received_at DESC LIMIT 1
    `);

    res.json({
      success: true,
      data: {
        claim,
        warehouseQC: qcRes.rows[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. Resolve Claim (Approve Refund, Approve Replacement, or Reject)
router.post('/:id/resolve', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const claimId = parseInt(req.params.id, 10);
    const { action, resolutionNotes } = req.body; // action: 'APPROVED_REFUND' | 'APPROVED_REPLACEMENT' | 'REJECTED'

    if (!action || !['APPROVED_REFUND', 'APPROVED_REPLACEMENT', 'REJECTED'].includes(action)) {
      res.status(400).json({ success: false, error: 'Valid resolution action required' });
      client.release();
      return;
    }

    const claimRes = await client.query('SELECT * FROM claim_tickets WHERE id = $1', [claimId]);
    if (claimRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Claim not found' });
      client.release();
      return;
    }
    const claim = claimRes.rows[0];
    const reviewer = req.staff?.name || 'Operations Lead';

    let creditNoteRef = claim.credit_note_ref;

    if (action === 'APPROVED_REFUND') {
      const countRes = await client.query('SELECT COUNT(*) FROM payments');
      creditNoteRef = `CN-${new Date().getFullYear()}-${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(4, '0')}`;

      // Credit the customer account via double-entry transaction
      const credRes = await client.query(`
        SELECT COALESCE(SUM(CASE WHEN type IN ('CHARGE', 'RESERVE') THEN amount WHEN type IN ('PAYMENT', 'REVERSAL', 'RELEASE') THEN -amount ELSE 0 END), 0) as balance
        FROM credit_transactions WHERE customer_id = $1
      `, [claim.customer_id]);
      const currentOutstanding = Math.max(0, parseFloat(credRes.rows[0]?.balance || 0));
      const balanceAfter = Math.max(0, currentOutstanding - parseFloat(claim.claim_value));

      await client.query(`
        INSERT INTO credit_transactions (customer_id, type, amount, balance_after, notes, reference_no, created_by)
        VALUES ($1, 'RELEASE', $2, $3, $4, $5, $6);
      `, [
        claim.customer_id, claim.claim_value, balanceAfter,
        `Credit Note issued for Quality Claim #${claim.claim_number}: ${resolutionNotes || 'Defective produce reimbursement'}`,
        creditNoteRef, reviewer
      ]);

      // Record in payments as CREDIT_NOTE
      await client.query(`
        INSERT INTO payments (payment_reference, customer_id, amount, payment_method, notes, recorded_by)
        VALUES ($1, $2, $3, 'CREDIT_NOTE', $4, $5);
      `, [creditNoteRef, claim.customer_id, claim.claim_value, `Claim settlement #${claim.claim_number}`, reviewer]);
    }

    const updateRes = await client.query(`
      UPDATE claim_tickets
      SET status = $1, resolution_notes = $2, credit_note_ref = $3, reviewed_by = $4, reviewed_at = NOW(), updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `, [action, resolutionNotes || '', creditNoteRef, reviewer, claimId]);

    await client.query('COMMIT');
    res.json({
      success: true,
      message: `Claim successfully ${action.toLowerCase().replace('_', ' ')}`,
      data: updateRes.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
