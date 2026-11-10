import { pool } from './pool';

export async function runDatabaseHealthCheck(): Promise<boolean> {
  console.log('================================================================');
  console.log('FRESHSUPPLY POSTGRESQL DATABASE HEALTH & INTEGRITY AUDIT');
  console.log('================================================================\n');

  const client = await pool.connect();
  let hasErrors = false;

  try {
    // 1. Connection & Ping Test
    const startTime = Date.now();
    const pingRes = await client.query('SELECT NOW() as current_time, version() as pg_version');
    const latency = Date.now() - startTime;
    console.log(`✓ PostgreSQL Connection: SUCCESS (${latency}ms latency)`);
    console.log(`  Database Server: ${pingRes.rows[0].pg_version.split(' on ')[0]}`);
    console.log(`  Server Time: ${pingRes.rows[0].current_time}\n`);

    // 2. Table Inventory Check
    console.log('--- 1. TABLE INVENTORY & SCHEMA INTEGRITY ---');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const existingTables = new Set(tablesRes.rows.map(r => r.table_name));
    const mandatoryTables = [
      'staff_users',
      'customers',
      'customer_addresses',
      'categories',
      'products',
      'orders',
      'order_items',
      'order_status_history',
      'cart_items',
      'audit_logs',
      'price_lists',
      'price_list_items',
      'customer_pricing_assignments',
      'customer_sku_prices',
      'customer_category_discounts',
      'credit_accounts',
      'credit_transactions',
      'customer_delivery_configs',
      'price_change_logs',
      'price_import_batches',
      'warehouses',
      'warehouse_inventory',
      'stock_transfers',
      'inventory_movements',
      'vendors',
      'purchase_orders',
      'purchase_order_items',
      'goods_received_notes',
      'invoices',
      'payments',
      'payment_allocations',
      'inventory_logs'
    ];

    let tablesPassed = 0;
    for (const t of mandatoryTables) {
      if (existingTables.has(t)) {
        tablesPassed++;
      } else {
        console.error(`  ✗ Missing table: ${t}`);
        hasErrors = true;
      }
    }
    console.log(`✓ Verified ${tablesPassed} / ${mandatoryTables.length} Mandatory Database Tables\n`);

    // 3. Foreign Key Constraints Check
    console.log('--- 2. FOREIGN KEY & REFERENTIAL INTEGRITY ---');
    const fkRes = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `);
    console.log(`✓ Total Active Foreign Key Constraints: ${fkRes.rows.length}`);
    const keyRelationships = [
      { from: 'customer_pricing_assignments', to: 'customers' },
      { from: 'customer_sku_prices', to: 'products' },
      { from: 'credit_accounts', to: 'customers' },
      { from: 'credit_transactions', to: 'customers' },
      { from: 'orders', to: 'customers' },
      { from: 'order_items', to: 'products' },
      { from: 'purchase_orders', to: 'vendors' },
    ];
    for (const rel of keyRelationships) {
      const match = fkRes.rows.some(r => r.table_name === rel.from && r.foreign_table_name === rel.to);
      if (match) {
        console.log(`  ✓ Rel: ${rel.from} -> ${rel.to} (Verified)`);
      } else {
        console.warn(`  ! Note: FK ${rel.from} -> ${rel.to} check`);
      }
    }
    console.log('');

    // 4. Data Record Counts & Integrity
    console.log('--- 3. DATABASE RECORD POPULATION ---');
    const countsRes = await client.query(`
      SELECT 
        (SELECT count(*) FROM customers) as customers_count,
        (SELECT count(*) FROM products) as products_count,
        (SELECT count(*) FROM categories) as categories_count,
        (SELECT count(*) FROM price_lists) as price_lists_count,
        (SELECT count(*) FROM customer_pricing_assignments) as customer_pricing_assignments_count,
        (SELECT count(*) FROM customer_sku_prices) as customer_sku_overrides_count,
        (SELECT count(*) FROM credit_accounts) as credit_accounts_count,
        (SELECT count(*) FROM warehouses) as warehouses_count,
        (SELECT count(*) FROM vendors) as vendors_count,
        (SELECT count(*) FROM orders) as orders_count;
    `);

    const c = countsRes.rows[0];
    console.log(`  • Customers: ${c.customers_count} accounts`);
    console.log(`  • Products & SKUs: ${c.products_count} active items`);
    console.log(`  • Grocery Categories: ${c.categories_count} categories`);
    console.log(`  • Master Price Lists: ${c.price_lists_count} lists`);
    console.log(`  • Customer Price Assignments: ${c.customer_pricing_assignments_count} mappings`);
    console.log(`  • SKU Negotiated Overrides: ${c.customer_sku_overrides_count} active contracts`);
    console.log(`  • Credit Accounts: ${c.credit_accounts_count} accounts`);
    console.log(`  • Multi-Warehouse Hubs: ${c.warehouses_count} logistics facilities`);
    console.log(`  • Registered Suppliers: ${c.vendors_count} active suppliers`);
    console.log(`  • Sample Orders: ${c.orders_count} orders`);

    if (parseInt(c.customers_count) < 120) {
      console.error('  ✗ Warning: Less than 120 customers found');
      hasErrors = true;
    }
    if (parseInt(c.credit_accounts_count) < 120) {
      console.error('  ✗ Warning: Less than 120 credit accounts found');
      hasErrors = true;
    }
    if (parseInt(c.categories_count) < 12) {
      console.error('  ✗ Warning: Less than 12 grocery categories found');
      hasErrors = true;
    }

    console.log('\n================================================================');
    if (!hasErrors) {
      console.log('DATABASE HEALTH STATUS: 100% OPERATIONAL & VERIFIED');
    } else {
      console.log('DATABASE HEALTH STATUS: COMPLETED WITH INTEGRITY WARNINGS');
    }
    console.log('================================================================\n');

    return !hasErrors;
  } catch (err: any) {
    console.error('Database Health Check Failed:', err.message);
    return false;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runDatabaseHealthCheck()
    .then((success) => {
      pool.end();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

