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

    // ==============================================================
    // B2B Customer-Specific Wholesale Pricing & Credit Schema
    // ==============================================================

    // 1. Reusable Wholesale Price Lists
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_lists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Price List Items (SKU prices per list)
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_list_items (
        id SERIAL PRIMARY KEY,
        price_list_id INTEGER NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
        min_qty INTEGER NOT NULL DEFAULT 1 CHECK (min_qty >= 1),
        discount_pct NUMERIC(5, 2) DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(price_list_id, product_id, min_qty)
      );
      CREATE INDEX IF NOT EXISTS idx_pli_list_id ON price_list_items(price_list_id);
      CREATE INDEX IF NOT EXISTS idx_pli_product_id ON price_list_items(product_id);
    `);

    // 3. Customer to Price List Assignment
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_pricing_assignments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
        price_list_id INTEGER NOT NULL REFERENCES price_lists(id) ON DELETE RESTRICT,
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        assigned_by VARCHAR(150) NOT NULL DEFAULT 'system'
      );
      CREATE INDEX IF NOT EXISTS idx_cpa_customer ON customer_pricing_assignments(customer_id);
      CREATE INDEX IF NOT EXISTS idx_cpa_list ON customer_pricing_assignments(price_list_id);
    `);

    // 4. Customer Individual SKU Price Overrides (Takes highest priority)
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_sku_prices (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        custom_price NUMERIC(12, 2) NOT NULL CHECK (custom_price >= 0),
        min_order_qty INTEGER DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        effective_from TIMESTAMPTZ DEFAULT NOW(),
        effective_to TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(customer_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_csp_cust_prod ON customer_sku_prices(customer_id, product_id);
    `);

    // 5. Customer Category Price Overrides / Discounts
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_category_discounts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        discount_percentage NUMERIC(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(customer_id, category_id)
      );
    `);

    // 6. Customer Credit Accounts & Limits
    await client.query(`
      CREATE TABLE IF NOT EXISTS credit_accounts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
        credit_enabled BOOLEAN NOT NULL DEFAULT false,
        credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
        credit_period_days INTEGER NOT NULL DEFAULT 30 CHECK (credit_period_days >= 0),
        payment_terms VARCHAR(100) NOT NULL DEFAULT 'Net 30',
        status VARCHAR(50) NOT NULL DEFAULT 'good_standing' CHECK (status IN ('good_standing', 'restricted', 'suspended', 'under_review')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_credit_cust ON credit_accounts(customer_id);
    `);

    // 7. Credit Transactions & Ledger (Charges, Payments, Exposure Reserve)
    await client.query(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('CHARGE', 'PAYMENT', 'REVERSAL', 'RESERVE', 'RELEASE')),
        amount NUMERIC(14, 2) NOT NULL,
        balance_after NUMERIC(14, 2) NOT NULL,
        notes TEXT,
        reference_no VARCHAR(100),
        created_by VARCHAR(150) NOT NULL DEFAULT 'system',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_credit_tx_cust ON credit_transactions(customer_id);
    `);

    // 8. Customer Delivery Configurations
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_delivery_configs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
        delivery_zone VARCHAR(100) NOT NULL DEFAULT 'Bangalore Central Hub',
        preferred_days VARCHAR(255) DEFAULT 'Mon, Wed, Fri',
        preferred_time_slot VARCHAR(100) DEFAULT 'Early Morning (05:00 AM - 08:00 AM)',
        transport_charge_type VARCHAR(50) DEFAULT 'free' CHECK (transport_charge_type IN ('free', 'fixed', 'per_quintal', 'actual_freight')),
        transport_rate NUMERIC(10, 2) DEFAULT 0,
        min_order_value NUMERIC(12, 2) DEFAULT 5000,
        special_instructions TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 9. Price Change Audit Trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_change_logs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        price_list_id INTEGER REFERENCES price_lists(id) ON DELETE SET NULL,
        previous_price NUMERIC(12, 2),
        new_price NUMERIC(12, 2) NOT NULL,
        change_type VARCHAR(50) NOT NULL DEFAULT 'SKU_OVERRIDE',
        reason TEXT,
        changed_by VARCHAR(150) NOT NULL DEFAULT 'admin',
        batch_id VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_pcl_customer ON price_change_logs(customer_id);
      CREATE INDEX IF NOT EXISTS idx_pcl_product ON price_change_logs(product_id);
    `);

    // 10. Price Import Batches
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_import_batches (
        id SERIAL PRIMARY KEY,
        batch_number VARCHAR(100) UNIQUE NOT NULL,
        filename VARCHAR(255) NOT NULL,
        total_rows INTEGER NOT NULL DEFAULT 0,
        successful_rows INTEGER NOT NULL DEFAULT 0,
        failed_rows INTEGER NOT NULL DEFAULT 0,
        executed_by VARCHAR(150) NOT NULL,
        summary_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ==============================================================
    // Warehouse & Multi-Hub Inventory Schema
    // ==============================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
        address TEXT NOT NULL,
        temperature_zone VARCHAR(100) DEFAULT 'Ambient (15°C - 25°C)',
        capacity_metric_tons NUMERIC(10, 2) DEFAULT 500.00,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS warehouse_inventory (
        id SERIAL PRIMARY KEY,
        warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        batch_number VARCHAR(100),
        expiry_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(warehouse_id, product_id, batch_number)
      );

      CREATE TABLE IF NOT EXISTS stock_transfers (
        id SERIAL PRIMARY KEY,
        transfer_number VARCHAR(100) UNIQUE NOT NULL,
        source_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
        destination_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
        notes TEXT,
        created_by VARCHAR(150) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        warehouse_id INTEGER REFERENCES warehouses(id),
        movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('PURCHASE_RECEIPT', 'ORDER_DISPATCH', 'STOCK_ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN_RESTOCK', 'SPOILAGE_DISPOSAL')),
        quantity INTEGER NOT NULL,
        reference_id VARCHAR(100),
        notes TEXT,
        created_by VARCHAR(150) NOT NULL DEFAULT 'system',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_inv_mov_prod ON inventory_movements(product_id);
    `);

    // ==============================================================
    // Vendor Management & Procurement Schema
    // ==============================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        vendor_code VARCHAR(50) UNIQUE NOT NULL,
        business_name VARCHAR(200) NOT NULL,
        contact_person VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        gstin VARCHAR(50),
        pan VARCHAR(50),
        business_type VARCHAR(100) DEFAULT 'Direct Producer / Farmer FPO',
        city VARCHAR(100) DEFAULT 'Bangalore',
        address TEXT,
        warehouse_location TEXT,
        storage_temperature VARCHAR(100) DEFAULT '0°C - 8°C (Cold Storage)',
        verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_number VARCHAR(100) UNIQUE NOT NULL,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
        warehouse_id INTEGER REFERENCES warehouses(id),
        total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
        delivery_due_date DATE,
        notes TEXT,
        created_by VARCHAR(150) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        unit_price NUMERIC(12, 2) NOT NULL,
        ordered_quantity INTEGER NOT NULL CHECK (ordered_quantity >= 1),
        received_quantity INTEGER NOT NULL DEFAULT 0,
        line_total NUMERIC(14, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goods_received_notes (
        id SERIAL PRIMARY KEY,
        grn_number VARCHAR(100) UNIQUE NOT NULL,
        po_id INTEGER REFERENCES purchase_orders(id),
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
        transit_temperature VARCHAR(50) DEFAULT '12°C - 14°C',
        qc_grade VARCHAR(50) DEFAULT 'Grade-A',
        qc_score NUMERIC(5, 2) DEFAULT 95.00,
        inspector_notes TEXT,
        received_by VARCHAR(150) NOT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ==============================================================
    // Invoicing, Payments & Accounts Receivable Schema
    // ==============================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        subtotal NUMERIC(14, 2) NOT NULL,
        tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
        delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
        total_amount NUMERIC(14, 2) NOT NULL,
        amount_paid NUMERIC(14, 2) NOT NULL DEFAULT 0,
        due_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_inv_customer ON invoices(customer_id);

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        payment_reference VARCHAR(100) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
        payment_method VARCHAR(50) NOT NULL DEFAULT 'NEFT_RTGS' CHECK (payment_method IN ('NEFT_RTGS', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CASH', 'CREDIT_NOTE')),
        transaction_id VARCHAR(150),
        notes TEXT,
        recorded_by VARCHAR(150) NOT NULL DEFAULT 'accounts_team',
        recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_allocations (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        allocated_amount NUMERIC(14, 2) NOT NULL CHECK (allocated_amount > 0),
        allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
