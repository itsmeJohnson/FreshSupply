import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Dispatch Board (Orders awaiting logistics & transportation)
router.get('/dispatch-board', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id as order_id,
        o.order_number,
        o.customer_id,
        c.business_name,
        c.contact_person,
        c.phone as contact_phone,
        o.delivery_date,
        o.delivery_slot,
        o.total_amount,
        o.status,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
        COALESCE(
          (SELECT SUM(oi.quantity * 25.0) FROM order_items oi WHERE oi.order_id = o.id),
          150.0
        ) as estimated_weight_kg,
        o.address_snapshot->>'address_line1' as delivery_address,
        o.address_snapshot->>'city' as delivery_city,
        o.address_snapshot->>'postal_code' as postal_code,
        t.trip_number as assigned_trip_number,
        t.vehicle_number as assigned_vehicle,
        t.driver_name as assigned_driver,
        tro.delivery_status
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      LEFT JOIN trip_orders tro ON tro.order_id = o.id
      LEFT JOIN delivery_trips t ON t.id = tro.trip_id
      WHERE o.status IN ('confirmed', 'processing', 'dispatched')
      ORDER BY o.delivery_date ASC, o.id DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 2. List Delivery Trips
router.get('/trips', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT dt.*, w.name as warehouse_name,
        (SELECT COUNT(*) FROM trip_orders tro WHERE tro.trip_id = dt.id) as orders_assigned_count,
        (SELECT COUNT(*) FROM trip_orders tro WHERE tro.trip_id = dt.id AND tro.delivery_status = 'DELIVERED') as orders_delivered_count
      FROM delivery_trips dt
      JOIN warehouses w ON w.id = dt.warehouse_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND dt.status = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND dt.planned_date = $${params.length}`;
    }
    query += ` ORDER BY dt.planned_date DESC, dt.departure_time ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// 3. Create Delivery Trip
router.post('/trips', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { warehouseId, vehicleNumber, vehicleType, driverName, driverPhone, routeZone, plannedDate, departureTime, transportCost } = req.body;
    if (!vehicleNumber || !driverName || !driverPhone) {
      res.status(400).json({ success: false, error: 'Vehicle number, driver name, and driver phone are required' });
      return;
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM delivery_trips');
    const tripNum = `TRIP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(2, '0')}`;

    const insertRes = await pool.query(`
      INSERT INTO delivery_trips (
        trip_number, warehouse_id, vehicle_number, vehicle_type, driver_name,
        driver_phone, route_zone, planned_date, departure_time, status, transport_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PLANNED', $10)
      RETURNING *;
    `, [
      tripNum, warehouseId || 1, vehicleNumber, vehicleType || 'Refrigerated 3.5T Reefer',
      driverName, driverPhone, routeZone || 'Bangalore Central Hub Corridor',
      plannedDate || new Date().toISOString().split('T')[0], departureTime || '05:30 AM',
      transportCost || 1850.00
    ]);

    res.json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

// 4. Assign Orders to Trip
router.post('/trips/:id/assign-orders', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripId = parseInt(req.params.id, 10);
    const { orderIds } = req.body; // array of order IDs

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({ success: false, error: 'Array of order IDs required' });
      client.release();
      return;
    }

    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      await client.query(`
        INSERT INTO trip_orders (trip_id, order_id, stop_sequence, delivery_status)
        VALUES ($1, $2, $3, 'LOADED')
        ON CONFLICT DO NOTHING;
      `, [tripId, orderId, i + 1]);

      // Update order status to 'processing'
      await client.query(`
        UPDATE orders SET status = 'processing', updated_at = NOW() WHERE id = $1 AND status = 'confirmed'
      `, [orderId]);
    }

    // Update total count on trip
    await client.query(`
      UPDATE delivery_trips 
      SET total_orders_count = (SELECT COUNT(*) FROM trip_orders WHERE trip_id = $1),
          updated_at = NOW()
      WHERE id = $1;
    `, [tripId]);

    await client.query('COMMIT');
    res.json({ success: true, message: `Assigned ${orderIds.length} orders to trip #${tripId}` });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 5. Update Trip Status (e.g. Dispatched, Completed)
router.patch('/trips/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const tripRes = await client.query(`
      UPDATE delivery_trips SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;
    `, [status, tripId]);

    if (status === 'DISPATCHED') {
      // Transition assigned orders to dispatched
      await client.query(`
        UPDATE orders SET status = 'dispatched', updated_at = NOW()
        WHERE id IN (SELECT order_id FROM trip_orders WHERE trip_id = $1)
      `, [tripId]);

      await client.query(`
        UPDATE trip_orders SET delivery_status = 'OUT_FOR_DELIVERY' WHERE trip_id = $1
      `, [tripId]);
    } else if (status === 'COMPLETED') {
      // Transition orders to delivered
      await client.query(`
        UPDATE orders SET status = 'delivered', updated_at = NOW()
        WHERE id IN (SELECT order_id FROM trip_orders WHERE trip_id = $1)
      `, [tripId]);

      await client.query(`
        UPDATE trip_orders SET delivery_status = 'DELIVERED', delivered_at = NOW() WHERE trip_id = $1
      `, [tripId]);
    }

    await client.query('COMMIT');
    res.json({ success: true, data: tripRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;

