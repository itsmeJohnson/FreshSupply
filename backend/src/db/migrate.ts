import { pool } from './pool';

export async function runMigrations() {
  console.log('Running FreshSupply database migrations...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create staff_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        gst_number VARCHAR(50),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create customer delivery addresses
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        label VARCHAR(100) NOT NULL DEFAULT 'Outlet / Main Kitchen',
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        landmark VARCHAR(255),
        city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
        state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
        postal_code VARCHAR(20) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        contact_phone VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON customer_addresses(customer_id);
    `);

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        image_url TEXT,
        unit VARCHAR(50) NOT NULL,
        pack_size VARCHAR(100) NOT NULL DEFAULT '1 Unit',
        min_order_qty INTEGER NOT NULL DEFAULT 1 CHECK (min_order_qty >= 1),
        price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
        cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
    `);

    // Create inventory logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        change_qty INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        reason VARCHAR(100) NOT NULL,
        reference_id VARCHAR(100),
        notes TEXT,
        created_by VARCHAR(150) NOT NULL DEFAULT 'system',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_inv_logs_product_id ON inventory_logs(product_id);
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        delivery_address_id INTEGER REFERENCES customer_addresses(id) ON DELETE SET NULL,
        address_snapshot JSONB NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50) NOT NULL,
        po_reference VARCHAR(100),
        delivery_date DATE NOT NULL,
        delivery_slot VARCHAR(100) NOT NULL DEFAULT 'Early Morning (05:00 AM - 08:00 AM)',
        subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
        tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
        delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
        discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
        total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
        status VARCHAR(50) NOT NULL DEFAULT 'pending' 
          CHECK (status IN ('pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled')),
        cancellation_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    `);

    // Create order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        product_name_snapshot VARCHAR(255) NOT NULL,
        sku_snapshot VARCHAR(100) NOT NULL,
        unit_snapshot VARCHAR(50) NOT NULL,
        pack_size_snapshot VARCHAR(100) NOT NULL,
        unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
        quantity INTEGER NOT NULL CHECK (quantity >= 1),
        line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `);

    // Create order status history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        updated_by_type VARCHAR(50) NOT NULL DEFAULT 'system',
        updated_by_id VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_status_history_order_id ON order_status_history(order_id);
    `);

    // Create customer cart items (server-synced cart)
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity >= 1),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(customer_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_cart_customer_id ON cart_items(customer_id);
    `);

    // Create audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_type VARCHAR(50) NOT NULL,
        user_id INTEGER,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100),
        details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('Migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
