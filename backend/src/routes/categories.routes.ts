import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// List categories
router.get('/', async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    const query = showAll
      ? `SELECT c.*, COUNT(p.id) as product_count 
         FROM categories c 
         LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true 
         GROUP BY c.id 
         ORDER BY c.sort_order ASC, c.name ASC`
      : `SELECT c.*, COUNT(p.id) as product_count 
         FROM categories c 
         LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true 
         WHERE c.is_active = true 
         GROUP BY c.id 
         ORDER BY c.sort_order ASC, c.name ASC`;

    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get single category
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id 
      WHERE c.id = $1 
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Create Category (Staff)
router.post('/', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, slug, description, imageUrl, sortOrder, isActive } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, error: 'Name and slug are required' });
      return;
    }

    const ins = await pool.query(`
      INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [name, slug.toLowerCase().trim(), description || null, imageUrl || null, sortOrder || 0, isActive !== false]);

    res.status(201).json({ success: true, message: 'Category created', data: ins.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Update Category (Staff)
router.put('/:id', requireStaff, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, description, imageUrl, sortOrder, isActive } = req.body;

    const upd = await pool.query(`
      UPDATE categories
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          image_url = COALESCE($4, image_url),
          sort_order = COALESCE($5, sort_order),
          is_active = COALESCE($6, is_active)
      WHERE id = $7
      RETURNING *;
    `, [name, slug?.toLowerCase().trim(), description, imageUrl, sortOrder, isActive, id]);

    if (upd.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    res.json({ success: true, message: 'Category updated', data: upd.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
