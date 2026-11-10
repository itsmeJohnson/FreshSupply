import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. List Notifications Log
router.get('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { channel, recipientType } = req.query;
    let query = `
      SELECT n.*,
        CASE 
          WHEN n.recipient_type = 'CUSTOMER' THEN (SELECT business_name FROM customers WHERE id = n.recipient_id)
          WHEN n.recipient_type = 'STAFF' THEN (SELECT name FROM staff_users WHERE id = n.recipient_id)
          ELSE 'System'
        END as recipient_name
      FROM notifications n
      WHERE 1=1
    `;
    const params: any[] = [];
    if (channel && channel !== 'ALL') {
      params.push(channel);
      query += ` AND n.channel = $${params.length}`;
    }
    if (recipientType && recipientType !== 'ALL') {
      params.push(recipientType);
      query += ` AND n.recipient_type = $${params.length}`;
    }
    query += ` ORDER BY n.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. Dispatch / Send Notification
router.post('/send', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { recipientType, recipientId, channel, eventType, title, message, payload } = req.body;
    if (!recipientType || !recipientId || !title || !message) {
      res.status(400).json({ success: false, error: 'Recipient type, recipient ID, title, and message are required' });
      return;
    }

    const insertRes = await pool.query(`
      INSERT INTO notifications (recipient_type, recipient_id, channel, event_type, title, message, status, payload)
      VALUES ($1, $2, $3, $4, $5, $6, 'DELIVERED', $7)
      RETURNING *;
    `, [recipientType, recipientId, channel || 'IN_APP', eventType || 'SYSTEM_ALERT', title, message, payload ? JSON.stringify(payload) : null]);

    res.json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

