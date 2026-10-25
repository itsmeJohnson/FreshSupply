import { pool } from '../db/pool';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderParams {
  customerId: number;
  deliveryAddressId: number;
  deliveryDate: string; // YYYY-MM-DD
  deliverySlot: string;
  poReference?: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export class OrderService {
  /**
   * Transactional order placement:
   * - Validates customer & address
   * - Locks requested product rows
   * - Checks active status, MOQ, and available inventory
   * - Computes authoritative prices, subtotal, 5% tax, and delivery fee
   * - Decrements inventory atomically and logs stock movements
   * - Generates unique order number
   * - Creates order and historical snapshots for items
   * - Clears customer cart
   */
  static async createOrder(params: CreateOrderParams) {
    if (!params.items || params.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch customer and address
      const custRes = await client.query(`
        SELECT id, business_name, contact_person, phone, is_active 
        FROM customers WHERE id = $1
      `, [params.customerId]);

      if (custRes.rows.length === 0 || !custRes.rows[0].is_active) {
        throw new Error('Customer account not found or is currently inactive');
      }
      const customer = custRes.rows[0];

      const addrRes = await client.query(`
        SELECT * FROM customer_addresses 
        WHERE id = $1 AND customer_id = $2
      `, [params.deliveryAddressId, params.customerId]);

      if (addrRes.rows.length === 0) {
        throw new Error('Delivery address not found for this customer');
      }
      const address = addrRes.rows[0];
      const addressSnapshot = {
        label: address.label,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        contact_phone: address.contact_phone || customer.phone,
      };

      // 2. Fetch and lock products
      const productIds = params.items.map((it) => it.productId);
      const productRowsRes = await client.query(`
        SELECT id, sku, name, unit, pack_size, min_order_qty, price, stock_quantity, is_active
        FROM products
        WHERE id = ANY($1::int[])
        FOR UPDATE
      `, [productIds]);

      const productMap = new Map<number, any>();
      for (const row of productRowsRes.rows) {
        productMap.set(row.id, row);
      }

      // 3. Validate items, stock, MOQs, and calculate totals
      let subtotal = 0;
      const orderItemsToInsert: Array<{
        productId: number;
        name: string;
        sku: string;
        unit: string;
        packSize: string;
        price: number;
        quantity: number;
        lineTotal: number;
      }> = [];

      for (const item of params.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} was not found`);
        }
        if (!product.is_active) {
          throw new Error(`Product "${product.name}" (${product.sku}) is currently deactivated`);
        }
        if (item.quantity < product.min_order_qty) {
          throw new Error(
            `Minimum order quantity for "${product.name}" is ${product.min_order_qty} ${product.unit}. Requested: ${item.quantity}`
          );
        }
        if (product.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`
          );
        }

        const unitPrice = parseFloat(product.price);
        const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
        subtotal += lineTotal;

        orderItemsToInsert.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          packSize: product.pack_size,
          price: unitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }

      // 4. Calculate Tax and Delivery Charges
      const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      const deliveryCharge = subtotal >= 5000 ? 0 : 250; // Free delivery above 5000
      const totalAmount = subtotal + taxAmount + deliveryCharge;

      // 5. Generate unique order number (e.g., FS-YYYYMMDD-XXXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const countRes = await client.query(`
        SELECT COUNT(*) as count FROM orders WHERE order_number LIKE $1
      `, [`FS-${dateStr}-%`]);
      const nextSeq = (parseInt(countRes.rows[0].count, 10) + 1).toString().padStart(4, '0');
      const orderNumber = `FS-${dateStr}-${nextSeq}`;

      // 6. Insert Order
      const insertOrderRes = await client.query(`
        INSERT INTO orders (
          order_number, customer_id, delivery_address_id, address_snapshot,
          contact_person, contact_phone, po_reference, delivery_date, delivery_slot,
          subtotal, tax_amount, delivery_charge, discount_amount, total_amount,
          status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, $13, 'pending', $14)
        RETURNING *;
      `, [
        orderNumber,
        params.customerId,
        params.deliveryAddressId,
        JSON.stringify(addressSnapshot),
        customer.contact_person,
        customer.phone,
        params.poReference || null,
        params.deliveryDate,
        params.deliverySlot,
        subtotal,
        taxAmount,
        deliveryCharge,
        totalAmount,
        params.notes || null,
      ]);

      const createdOrder = insertOrderRes.rows[0];

      // 7. Insert Order Items and Decrement Inventory
      for (const it of orderItemsToInsert) {
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name_snapshot, sku_snapshot,
            unit_snapshot, pack_size_snapshot, unit_price, quantity, line_total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [
          createdOrder.id,
          it.productId,
          it.name,
          it.sku,
          it.unit,
          it.packSize,
          it.price,
          it.quantity,
          it.lineTotal,
        ]);

        // Decrement product stock
        const updatedProduct = await client.query(`
          UPDATE products
          SET stock_quantity = stock_quantity - $1, updated_at = NOW()
          WHERE id = $2
          RETURNING stock_quantity
        `, [it.quantity, it.productId]);

        const newBalance = updatedProduct.rows[0].stock_quantity;

        // Log inventory movement
        await client.query(`
          INSERT INTO inventory_logs (
            product_id, change_qty, balance_after, reason, reference_id, notes, created_by
          ) VALUES ($1, $2, $3, 'order_fulfillment', $4, $5, $6);
        `, [
          it.productId,
          -it.quantity,
          newBalance,
          orderNumber,
          `Reserved for order ${orderNumber}`,
          customer.business_name,
        ]);
      }

      // 8. Order Status History
      await client.query(`
        INSERT INTO order_status_history (order_id, status, notes, updated_by_type, updated_by_id)
        VALUES ($1, 'pending', 'Order submitted by customer via application', 'customer', $2);
      `, [createdOrder.id, params.customerId.toString()]);

      // 9. Clear customer's server cart
      await client.query(`DELETE FROM cart_items WHERE customer_id = $1`, [params.customerId]);

      await client.query('COMMIT');
      return createdOrder;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update order status with inventory rollback if cancelled
   */
  static async updateOrderStatus(
    orderId: number,
    newStatus: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled',
    notes: string,
    updatedBy: { type: 'staff' | 'customer'; id: string; name?: string },
    cancellationReason?: string
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderRes = await client.query(`
        SELECT * FROM orders WHERE id = $1 FOR UPDATE
      `, [orderId]);

      if (orderRes.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderRes.rows[0];
      const prevStatus = order.status;

      if (prevStatus === 'cancelled') {
        throw new Error('Cannot update status of an already cancelled order');
      }

      if (prevStatus === 'delivered' && newStatus !== 'delivered') {
        throw new Error('Delivered orders cannot be reverted');
      }

      // If cancelling, restore inventory
      if (newStatus === 'cancelled' && prevStatus !== 'cancelled') {
        const itemsRes = await client.query(`
          SELECT product_id, quantity FROM order_items WHERE order_id = $1
        `, [orderId]);

        for (const item of itemsRes.rows) {
          const upd = await client.query(`
            UPDATE products
            SET stock_quantity = stock_quantity + $1, updated_at = NOW()
            WHERE id = $2
            RETURNING stock_quantity
          `, [item.quantity, item.product_id]);

          const balanceAfter = upd.rows[0]?.stock_quantity ?? 0;

          await client.query(`
            INSERT INTO inventory_logs (
              product_id, change_qty, balance_after, reason, reference_id, notes, created_by
            ) VALUES ($1, $2, $3, 'order_cancellation_return', $4, $5, $6);
          `, [
            item.product_id,
            item.quantity,
            balanceAfter,
            order.order_number,
            `Inventory returned due to cancellation of ${order.order_number}`,
            updatedBy.name || 'System / Staff',
          ]);
        }
      }

      // Update Order
      const updOrder = await client.query(`
        UPDATE orders
        SET status = $1,
            cancellation_reason = COALESCE($2, cancellation_reason),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *;
      `, [newStatus, cancellationReason || null, orderId]);

      // Add to status history
      await client.query(`
        INSERT INTO order_status_history (order_id, status, notes, updated_by_type, updated_by_id)
        VALUES ($1, $2, $3, $4, $5);
      `, [orderId, newStatus, notes, updatedBy.type, updatedBy.id]);

      await client.query('COMMIT');
      return updOrder.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Adjust stock manually
   */
  static async adjustStock(
    productId: number,
    newQuantity: number,
    reason: string,
    notes: string,
    staffName: string
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const pRes = await client.query(`
        SELECT id, name, sku, stock_quantity FROM products WHERE id = $1 FOR UPDATE
      `, [productId]);

      if (pRes.rows.length === 0) {
        throw new Error('Product not found');
      }

      const p = pRes.rows[0];
      const prevStock = p.stock_quantity;
      const diff = newQuantity - prevStock;

      if (diff === 0) {
        await client.query('COMMIT');
        return p;
      }

      const upd = await client.query(`
        UPDATE products
        SET stock_quantity = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `, [newQuantity, productId]);

      await client.query(`
        INSERT INTO inventory_logs (
          product_id, change_qty, balance_after, reason, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6);
      `, [
        productId,
        diff,
        newQuantity,
        reason || 'manual_adjustment',
        notes || `Stock adjusted from ${prevStock} to ${newQuantity}`,
        staffName,
      ]);

      await client.query('COMMIT');
      return upd.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
