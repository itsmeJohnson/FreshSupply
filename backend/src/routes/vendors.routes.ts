import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Public / Vendor self-registration or staff registration
router.post('/register', async (req, res, next) => {
  try {
    const {
      businessName,
      contactPerson,
      email,
      phone,
      gstin,
      pan,
      businessType,
      city,
      address,
      storageTemperature,
      warehouseLocation,
    } = req.body;

    if (!businessName || !contactPerson || !email || !phone) {
      res.status(400).json({ success: false, error: 'Business name, contact person, email, and phone are required' });
      return;
    }

    const codeSuffix = Math.floor(100 + Math.random() * 900);
    const vendorCode = `VEND-${codeSuffix}`;

    const insertRes = await pool.query(`
      INSERT INTO vendors (
        vendor_code, business_name, contact_person, email, phone,
        gstin, pan, business_type, city, address, storage_temperature,
        warehouse_location, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'VERIFIED')
      RETURNING *;
    `, [
      vendorCode,
      businessName.trim(),
      contactPerson.trim(),
      email.toLowerCase().trim(),
      phone.trim(),
      gstin?.trim() || null,
      pan?.trim() || null,
      businessType || 'Direct Producer / Farmer FPO',
      city || 'Bangalore',
      address?.trim() || 'Central Distribution Bay',
      storageTemperature || '0°C - 8°C (Cold Storage)',
      warehouseLocation?.trim() || 'Cold Storage & Distribution Center',
    ]);

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully and verified',
      data: insertRes.rows[0],
    });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(400).json({ success: false, error: 'A vendor with this code or email already exists' });
      return;
    }
    next(err);
  }
});

// Staff: List all registered suppliers
router.get('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { search, status, limit = '50', offset = '0' } = req.query;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(`verification_status = $${idx++}`);
      values.push(status.toUpperCase());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(business_name ILIKE $${idx} OR vendor_code ILIKE $${idx} OR contact_person ILIKE $${idx} OR city ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT v.*,
             COUNT(DISTINCT po.id) as total_purchase_orders,
             COALESCE(SUM(po.total_amount), 0) as total_procured_value
      FROM vendors v
      LEFT JOIN purchase_orders po ON po.vendor_id = v.id
      ${whereClause}
      GROUP BY v.id
      ORDER BY v.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Staff: Get single vendor detail with POs and GRNs
router.get('/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const vendorRes = await pool.query('SELECT * FROM vendors WHERE id = $1', [vendorId]);

    if (vendorRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Vendor not found' });
      return;
    }

    const pos = await pool.query(`
      SELECT po.*, w.name as warehouse_name
      FROM purchase_orders po
      LEFT JOIN warehouses w ON w.id = po.warehouse_id
      WHERE po.vendor_id = $1
      ORDER BY po.created_at DESC
      LIMIT 20
    `, [vendorId]);

    const grns = await pool.query(`
      SELECT grn.*, w.name as warehouse_name
      FROM goods_received_notes grn
      LEFT JOIN warehouses w ON w.id = grn.warehouse_id
      WHERE grn.vendor_id = $1
      ORDER BY grn.received_at DESC
      LIMIT 20
    `, [vendorId]);

    res.json({
      success: true,
      data: {
        vendor: vendorRes.rows[0],
        purchaseOrders: pos.rows,
        goodsReceivedNotes: grns.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Staff: Toggle / Update vendor verification status
router.patch('/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid verification status' });
      return;
    }

    const upd = await pool.query(`
      UPDATE vendors
      SET verification_status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `, [status, vendorId]);

    if (upd.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Vendor not found' });
      return;
    }

    res.json({ success: true, message: `Vendor status updated to ${status}`, data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Staff: List purchase orders
router.get('/procurement/purchase-orders', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(`po.status = $${idx++}`);
      values.push(status.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT po.*, v.business_name as vendor_name, v.vendor_code, w.name as warehouse_name
      FROM purchase_orders po
      JOIN vendors v ON v.id = po.vendor_id
      LEFT JOIN warehouses w ON w.id = po.warehouse_id
      ${whereClause}
      ORDER BY po.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Staff: Create Purchase Order
router.post('/procurement/purchase-orders', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { vendorId, warehouseId, deliveryDueDate, notes, items } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Vendor ID and line items are required' });
      return;
    }

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    let totalAmount = 0;

    for (const it of items) {
      totalAmount += Number(it.unitPrice) * Number(it.quantity);
    }

    const poRes = await client.query(`
      INSERT INTO purchase_orders (po_number, vendor_id, warehouse_id, total_amount, status, delivery_due_date, notes, created_by)
      VALUES ($1, $2, $3, $4, 'CONFIRMED', $5, $6, $7)
      RETURNING *;
    `, [poNumber, vendorId, warehouseId || null, totalAmount, deliveryDueDate || null, notes || null, req.staff?.name || 'Procurement Manager']);

    const poId = poRes.rows[0].id;

    for (const it of items) {
      const lineTotal = Number(it.unitPrice) * Number(it.quantity);
      await client.query(`
        INSERT INTO purchase_order_items (po_id, product_id, unit_price, ordered_quantity, line_total)
        VALUES ($1, $2, $3, $4, $5);
      `, [poId, it.productId, it.unitPrice, it.quantity, lineTotal]);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Purchase Order created successfully', data: poRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Staff: Record Goods Received Note (GRN) with QC inspection
router.post('/procurement/grn', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { poId, vendorId, warehouseId, transitTemperature, qcGrade, qcScore, inspectorNotes, items } = req.body;

    if (!vendorId || !warehouseId) {
      res.status(400).json({ success: false, error: 'Vendor ID and Warehouse ID are required' });
      return;
    }

    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;
    const grnRes = await client.query(`
      INSERT INTO goods_received_notes (
        grn_number, po_id, vendor_id, warehouse_id, transit_temperature,
        qc_grade, qc_score, inspector_notes, received_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `, [
      grnNumber,
      poId || null,
      vendorId,
      warehouseId,
      transitTemperature || '12°C - 14°C',
      qcGrade || 'Grade-A',
      qcScore || 95.0,
      inspectorNotes || 'Visual inspection passed; temperature in cold chain specification',
      req.staff?.name || 'Warehouse In-charge',
    ]);

    // Update product stock if items passed
    if (items && Array.isArray(items)) {
      for (const it of items) {
        await client.query(`
          UPDATE products
          SET stock_quantity = stock_quantity + $1, updated_at = NOW()
          WHERE id = $2;
        `, [Number(it.receivedQty), it.productId]);

        await client.query(`
          INSERT INTO inventory_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, created_by)
          VALUES ($1, $2, 'PURCHASE_RECEIPT', $3, $4, $5, $6);
        `, [it.productId, warehouseId, Number(it.receivedQty), grnNumber, `Received via GRN ${grnNumber}`, req.staff?.name || 'Warehouse Staff']);
      }
    }

    // Update PO status to RECEIVED if poId provided
    if (poId) {
      await client.query(`UPDATE purchase_orders SET status = 'RECEIVED', updated_at = NOW() WHERE id = $1`, [poId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Goods Received Note recorded and inventory updated', data: grnRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;

