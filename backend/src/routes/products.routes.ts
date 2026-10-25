import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// List Products
router.get('/', async (req, res, next) => {
  try {
    const { category, search, featured, sort, activeOnly = 'true', limit = '100', offset = '0' } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (activeOnly === 'true') {
      conditions.push(`p.is_active = true`);
    }

    if (category) {
      if (!isNaN(Number(category))) {
        conditions.push(`p.category_id = $${idx++}`);
        values.push(Number(category));
      } else {
        conditions.push(`c.slug = $${idx++}`);
        values.push(category);
      }
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    if (featured === 'true') {
      conditions.push(`p.is_featured = true`);
    }

    let orderBy = 'p.is_featured DESC, p.id ASC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'name_asc') orderBy = 'p.name ASC';
    else if (sort === 'stock_desc') orderBy = 'p.stock_quantity DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, values);

    // Also get count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total, 10),
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Export CSV of products
router.get('/export/csv', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.sku, p.name, c.name as category, p.unit, p.pack_size, p.min_order_qty, 
             p.price, p.cost_price, p.stock_quantity, p.is_active, p.is_featured
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.id ASC
    `);

    let csv = 'ID,SKU,Name,Category,Unit,Pack Size,Min Order Qty,Price,Cost Price,Stock Quantity,Active,Featured\n';
    for (const row of result.rows) {
      const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      csv += [
        row.id,
        escape(row.sku),
        escape(row.name),
        escape(row.category),
        escape(row.unit),
        escape(row.pack_size),
        row.min_order_qty,
        row.price,
        row.cost_price,
        row.stock_quantity,
        row.is_active,
        row.is_featured,
      ].join(',') + '\n';
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('freshsupply_products_catalogue.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Create product (Staff)
router.post('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const {
      sku, name, description, categoryId, imageUrl, unit, packSize,
      minOrderQty, price, costPrice, stockQuantity, isFeatured
    } = req.body;

    if (!sku || !name || !categoryId || !unit || price === undefined) {
      res.status(400).json({ success: false, error: 'SKU, Name, Category, Unit and Price are required' });
      return;
    }

    // Check unique SKU
    const existing = await pool.query('SELECT id FROM products WHERE sku = $1', [sku.trim()]);
    if (existing.rows.length > 0) {
      res.status(400).json({ success: false, error: `SKU "${sku}" is already in use by another product` });
      return;
    }

    const ins = await pool.query(`
      INSERT INTO products (
        sku, name, description, category_id, image_url, unit, pack_size,
        min_order_qty, price, cost_price, stock_quantity, is_active, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
      RETURNING *;
    `, [
      sku.trim().toUpperCase(),
      name.trim(),
      description || null,
      categoryId,
      imageUrl || null,
      unit.trim(),
      packSize?.trim() || '1 Unit',
      minOrderQty || 1,
      price,
      costPrice || 0,
      stockQuantity || 0,
      isFeatured === true,
    ]);

    const created = ins.rows[0];

    // Log initial stock
    if (stockQuantity > 0) {
      await pool.query(`
        INSERT INTO inventory_logs (product_id, change_qty, balance_after, reason, notes, created_by)
        VALUES ($1, $2, $2, 'initial_stock_creation', 'Initial inventory on product onboarding', $3)
      `, [created.id, stockQuantity, req.staff?.name || 'Staff']);
    }

    res.status(201).json({ success: true, message: 'Product created successfully', data: created });
  } catch (err) {
    next(err);
  }
});

// Update product (Staff)
router.put('/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      sku, name, description, categoryId, imageUrl, unit, packSize,
      minOrderQty, price, costPrice, isFeatured, isActive
    } = req.body;

    const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    if (sku) {
      const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1 AND id != $2', [sku.trim(), id]);
      if (skuCheck.rows.length > 0) {
        res.status(400).json({ success: false, error: `SKU "${sku}" is already in use by another product` });
        return;
      }
    }

    const upd = await pool.query(`
      UPDATE products
      SET sku = COALESCE($1, sku),
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          category_id = COALESCE($4, category_id),
          image_url = COALESCE($5, image_url),
          unit = COALESCE($6, unit),
          pack_size = COALESCE($7, pack_size),
          min_order_qty = COALESCE($8, min_order_qty),
          price = COALESCE($9, price),
          cost_price = COALESCE($10, cost_price),
          is_featured = COALESCE($11, is_featured),
          is_active = COALESCE($12, is_active),
          updated_at = NOW()
      WHERE id = $13
      RETURNING *;
    `, [
      sku ? sku.trim().toUpperCase() : null,
      name ? name.trim() : null,
      description,
      categoryId,
      imageUrl,
      unit,
      packSize,
      minOrderQty,
      price,
      costPrice,
      isFeatured,
      isActive,
      id
    ]);

    res.json({ success: true, message: 'Product updated successfully', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Toggle active (Staff)
router.patch('/:id/toggle-active', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const upd = await pool.query(`
      UPDATE products
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, sku, is_active;
    `, [id]);

    if (upd.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, message: `Product ${upd.rows[0].is_active ? 'activated' : 'deactivated'}`, data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
