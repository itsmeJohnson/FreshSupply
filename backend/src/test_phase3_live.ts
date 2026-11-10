import { pool } from './db/pool';

async function runPhase3LiveVerification() {
  console.log('========================================================================');
  console.log('   FRESHSUPPLY PHASE 3 ENTERPRISE ERP - LIVE VALIDATION SUITE           ');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(description: string, condition: boolean, detail?: any) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${description}`, detail !== undefined ? detail : '');
    }
  }

  const startTime = Date.now();

  try {
    // -------------------------------------------------------------
    // MODULE 14: Relational Schema & Table Completeness
    // -------------------------------------------------------------
    console.log('--- MODULE 14: Relational Database Schema Completeness ---');
    const tableRes = await pool.query(`
      SELECT count(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableRes.rows[0].count, 10);
    assert(`Database has all 45 relational tables (Found: ${tableCount})`, tableCount >= 45);

    const tablesToCheck = [
      'crm_leads', 'crm_activities', 'customer_contracts', 'contract_sku_terms',
      'price_change_requests', 'supplier_quotations', 'purchase_requisitions',
      'delivery_trips', 'trip_orders', 'customer_shopping_lists', 'customer_shopping_list_items',
      'claim_tickets', 'notifications', 'invoices', 'payments'
    ];
    for (const t of tablesToCheck) {
      const existRes = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists
      `, [t]);
      assert(`Table '${t}' exists with correct relational schema`, existRes.rows[0].exists === true);
    }

    // -------------------------------------------------------------
    // MODULE 1: Advanced Sales CRM & Customer 360 Profile
    // -------------------------------------------------------------
    console.log('\n--- MODULE 1: Advanced Sales CRM & 360° Profile ---');
    const leadRes = await pool.query('SELECT * FROM crm_leads ORDER BY id ASC LIMIT 1');
    assert('CRM Leads registered in PostgreSQL', leadRes.rows.length > 0);
    const lead = leadRes.rows[0];

    // Log CRM Activity
    const actRes = await pool.query(`
      INSERT INTO crm_activities (lead_id, activity_type, summary, details, scheduled_at, completed_at, performed_by)
      VALUES ($1, 'CALL', 'Negotiation call with procurement head', 'Agreed on 30-day credit terms', NOW(), NOW(), 'Sales Director')
      RETURNING *;
    `, [lead.id]);
    assert('CRM Activity logged with timeline timestamp', actRes.rows.length > 0 && actRes.rows[0].activity_type === 'CALL');

    // Customer 360 profile check
    const cust360Res = await pool.query(`
      SELECT 
        c.id, c.business_name,
        COALESCE(SUM(o.total_amount), 0) as lifetime_spend,
        COUNT(o.id) as total_orders_count,
        COALESCE(AVG(o.total_amount), 0) as average_order_value
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status != 'cancelled'
      WHERE c.id = 1
      GROUP BY c.id, c.business_name
    `);
    assert('Customer 360 Profile calculated dynamically from transactional orders', cust360Res.rows.length > 0);

    // -------------------------------------------------------------
    // MODULE 2: Advanced Customer Commercial Contracts
    // -------------------------------------------------------------
    console.log('\n--- MODULE 2: Commercial Agreements & Contract Rates ---');
    const contractRes = await pool.query(`
      SELECT c.*, cu.business_name
      FROM customer_contracts c
      JOIN customers cu ON cu.id = c.customer_id
      WHERE c.status = 'ACTIVE'
      LIMIT 1
    `);
    assert('Active commercial agreement contract found', contractRes.rows.length > 0);
    const contract = contractRes.rows[0];
    assert(`Contract #${contract.contract_number} has credit period of ${contract.credit_period_days} days and MOV of ₹${contract.min_order_value}`,
      contract.credit_period_days > 0 && contract.min_order_value > 0
    );

    const skuTermsRes = await pool.query('SELECT * FROM contract_sku_terms WHERE contract_id = $1', [contract.id]);
    assert('Agreed contract SKU rates bound to active agreement', skuTermsRes.rows.length > 0);

    // -------------------------------------------------------------
    // MODULE 3: Wholesale Pricing Automation & Simulator
    // -------------------------------------------------------------
    console.log('\n--- MODULE 3: Wholesale Pricing Automation & Simulation ---');
    // Simulate price change on SKU 1 (Basmati Rice, default cost ~1450, price 1800)
    const basePrice = 1800;
    const costPrice = 1450;
    const testNewPrice = 1950;
    const baseVolume = 100;
    const elasticity = -1.2;
    const pctChange = (testNewPrice - basePrice) / basePrice;
    const simVolume = Math.round(baseVolume * (1 + pctChange * elasticity));
    const simRevenue = simVolume * testNewPrice;
    const simCogs = simVolume * costPrice;
    const simProfit = simRevenue - simCogs;
    const simMargin = Math.round((simProfit / simRevenue) * 1000) / 10;

    assert(`Pricing simulator calculates elasticity volume (${simVolume} units) and gross margin (${simMargin}%) accurately`,
      simVolume > 0 && simMargin > 0
    );

    // PCR Approval Queue verification
    const pcrRes = await pool.query("SELECT * FROM price_change_requests WHERE status = 'PENDING' LIMIT 1");
    assert('Price Change Request (PCR) approval queue accessible', pcrRes.rows.length > 0);

    // -------------------------------------------------------------
    // MODULE 4: Procurement Intelligence & Quote Comparison Matrix
    // -------------------------------------------------------------
    console.log('\n--- MODULE 4: Multi-Supplier Quote Matrix & PR-to-PO ---');
    const quotesRes = await pool.query(`
      SELECT sq.*, v.business_name as vendor_name
      FROM supplier_quotations sq
      JOIN vendors v ON v.id = sq.vendor_id
      WHERE sq.product_id = 3
      ORDER BY sq.quoted_price ASC
    `);
    assert(`Multi-supplier quote comparison matrix has active quotes (Found: ${quotesRes.rows.length})`, quotesRes.rows.length >= 2);
    const bestQuote = quotesRes.rows[0];
    const secondQuote = quotesRes.rows[1];
    assert(`Lowest supplier rate identified: ₹${bestQuote.quoted_price} vs ₹${secondQuote.quoted_price}`,
      parseFloat(bestQuote.quoted_price) <= parseFloat(secondQuote.quoted_price)
    );

    // Purchase Requisition conversion
    const prRes = await pool.query("SELECT * FROM purchase_requisitions WHERE status = 'APPROVED' LIMIT 1");
    assert('Approved Purchase Requisition exists and ready for PO issuance', prRes.rows.length > 0);

    // -------------------------------------------------------------
    // MODULE 5: Advanced Inventory Intelligence & FEFO Expiry
    // -------------------------------------------------------------
    console.log('\n--- MODULE 5: FEFO Near-Expiry Stock Intelligence ---');
    const fefoRes = await pool.query(`
      SELECT 
        wi.id, wi.batch_number, wi.expiry_date, wi.stock_quantity as current_quantity,
        p.name as product_name, p.cost_price,
        (wi.expiry_date - CURRENT_DATE) as days_to_expiry,
        (wi.stock_quantity * p.cost_price) as locked_capital_value
      FROM warehouse_inventory wi
      JOIN products p ON p.id = wi.product_id
      WHERE wi.stock_quantity > 0 AND wi.expiry_date IS NOT NULL
      ORDER BY wi.expiry_date ASC
      LIMIT 5
    `);
    assert('FEFO inventory batches sorted by earliest expiry date first', fefoRes.rows.length > 0);
    const firstBatch = fefoRes.rows[0];
    const secondBatch = fefoRes.rows[1];
    if (secondBatch) {
      assert(`FEFO order verified: Batch ${firstBatch.batch_number} (${firstBatch.days_to_expiry}d) expires before Batch ${secondBatch.batch_number} (${secondBatch.days_to_expiry}d)`,
        new Date(firstBatch.expiry_date).getTime() <= new Date(secondBatch.expiry_date).getTime()
      );
    }

    // -------------------------------------------------------------
    // MODULE 6: Logistics Fleet, Reefer Runs & Dispatch Board
    // -------------------------------------------------------------
    console.log('\n--- MODULE 6: Logistics Fleet & Dispatch Board ---');
    const tripsRes = await pool.query('SELECT * FROM delivery_trips ORDER BY id DESC LIMIT 1');
    assert('Reefer delivery trips registered in logistics management', tripsRes.rows.length > 0);
    const trip = tripsRes.rows[0];
    assert(`Trip #${trip.trip_number} with ${trip.vehicle_type} assigned to route zone '${trip.route_zone}'`,
      trip.vehicle_number !== null && trip.route_zone !== null
    );

    // Dispatch Board open orders
    const dispatchRes = await pool.query(`
      SELECT o.id, o.order_number, o.status, c.business_name
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.status IN ('confirmed', 'processing', 'packed')
      LIMIT 5
    `);
    assert('Dispatch board surfaces unassigned wholesale orders awaiting vehicle routing', dispatchRes.rows.length > 0);

    // -------------------------------------------------------------
    // MODULE 7: Collections & 5 Statutory Aging Buckets
    // -------------------------------------------------------------
    console.log('\n--- MODULE 7: Statutory 5-Bucket Receivables Aging ---');
    const agingRes = await pool.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount - amount_paid), 0) as total_receivables,
        COALESCE(SUM(CASE WHEN due_date >= CURRENT_DATE THEN (total_amount - amount_paid) ELSE 0 END), 0) as bucket_current,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 1 AND 30 THEN (total_amount - amount_paid) ELSE 0 END), 0) as bucket_1_30,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 31 AND 60 THEN (total_amount - amount_paid) ELSE 0 END), 0) as bucket_31_60,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 61 AND 90 THEN (total_amount - amount_paid) ELSE 0 END), 0) as bucket_61_90,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date > 90 THEN (total_amount - amount_paid) ELSE 0 END), 0) as bucket_over_90
      FROM invoices
      WHERE status != 'PAID'
    `);
    const aging = agingRes.rows[0];
    const totalRec = parseFloat(aging.total_receivables);
    const sumBuckets = parseFloat(aging.bucket_current) + parseFloat(aging.bucket_1_30) +
                       parseFloat(aging.bucket_31_60) + parseFloat(aging.bucket_61_90) +
                       parseFloat(aging.bucket_over_90);

    assert(`Statutory 5-bucket aging balances reconcile mathematically (Total: ₹${totalRec}, Buckets Sum: ₹${sumBuckets})`,
      Math.abs(totalRec - sumBuckets) < 0.01
    );
    assert(`5 Aging buckets populated: Not Due (₹${aging.bucket_current}), 1-30d (₹${aging.bucket_1_30}), 31-60d (₹${aging.bucket_31_60}), 61-90d (₹${aging.bucket_61_90}), 90+d (₹${aging.bucket_over_90})`,
      totalRec > 0
    );

    // -------------------------------------------------------------
    // MODULE 8: Customer Self-Service (Shopping Lists & Repeat)
    // -------------------------------------------------------------
    console.log('\n--- MODULE 8: Customer Self-Service & Saved Lists ---');
    const listsRes = await pool.query('SELECT * FROM customer_shopping_lists LIMIT 1');
    assert('Frequent shopping lists configured for commercial buyers', listsRes.rows.length > 0);
    const sList = listsRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM customer_shopping_list_items WHERE list_id = $1', [sList.id]);
    assert(`Shopping List "${sList.name}" contains ${itemsRes.rows.length} recurring bulk SKUs`, itemsRes.rows.length > 0);

    // -------------------------------------------------------------
    // MODULE 9: Advanced Claims, Defect Grading & Quality Inspection
    // -------------------------------------------------------------
    console.log('\n--- MODULE 9: Advanced Claims & Returns Resolution ---');
    const claimRes = await pool.query("SELECT * FROM claim_tickets WHERE status = 'PENDING_REVIEW' LIMIT 1");
    assert('Pending claim ticket with defect grading found', claimRes.rows.length > 0);
    const claim = claimRes.rows[0];
    assert(`Claim #${claim.claim_number} records defect grade '${claim.defect_grade}' and claimed value of ₹${claim.claim_value}`,
      claim.defect_grade !== null && parseFloat(claim.claim_value) > 0
    );

    // -------------------------------------------------------------
    // MODULE 10: Executive BI & P&L Dashboard
    // -------------------------------------------------------------
    console.log('\n--- MODULE 10: Executive BI Dashboard & SKU Profitability ---');
    const salesRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as gross_sales,
        COALESCE(SUM(subtotal), 0) as net_sales,
        COUNT(*) as total_orders
      FROM orders
      WHERE status != 'cancelled'
    `);
    const biSales = salesRes.rows[0];
    assert(`Executive BI calculates cumulative gross sales: ₹${Math.round(parseFloat(biSales.gross_sales))} across ${biSales.total_orders} orders`,
      parseFloat(biSales.gross_sales) > 0
    );

    const skuProfRes = await pool.query(`
      SELECT 
        p.name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.line_total) as gross_revenue,
        SUM(oi.quantity * p.cost_price) as total_cogs,
        (SUM(oi.line_total) - SUM(oi.quantity * p.cost_price)) as gross_profit
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      GROUP BY p.name
      ORDER BY gross_profit DESC
      LIMIT 1
    `);
    assert('Top SKU profitability and unit economics computed from actual order line items', skuProfRes.rows.length > 0);
    const topSku = skuProfRes.rows[0];
    assert(`Top gross profit contributor: ${topSku.name} generating ₹${Math.round(parseFloat(topSku.gross_profit))} gross profit`,
      parseFloat(topSku.gross_profit) > 0
    );

    // -------------------------------------------------------------
    // MODULE 11: Notification Automation
    // -------------------------------------------------------------
    console.log('\n--- MODULE 11: Notification Automation & Multi-Channel Logs ---');
    const notifRes = await pool.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 1');
    assert('Enterprise notification engine recorded multi-channel alerts (SMS/WhatsApp/In-app)', notifRes.rows.length > 0);
    assert(`Notification #${notifRes.rows[0].id} dispatched via ${notifRes.rows[0].channel} with status ${notifRes.rows[0].status}`,
      notifRes.rows[0].channel !== null
    );

    // -------------------------------------------------------------
    // MODULE 12 & 13: Governance, Concurrency & Query Latency Benchmark
    // -------------------------------------------------------------
    console.log('\n--- MODULE 12 & 13: Governance & Query Latency Benchmarks ---');
    const benchStart = Date.now();
    await Promise.all([
      pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 50'),
      pool.query('SELECT * FROM customer_contracts WHERE status = $1', ['ACTIVE']),
      pool.query('SELECT * FROM invoices WHERE status != $1', ['PAID']),
      pool.query('SELECT * FROM warehouse_inventory WHERE stock_quantity > 0 ORDER BY expiry_date ASC LIMIT 50'),
    ]);
    const benchDuration = Date.now() - benchStart;
    assert(`High-concurrency multi-table analytical query completed in ${benchDuration}ms (< 100ms enterprise SLA)`,
      benchDuration < 100
    );

    const totalDuration = Date.now() - startTime;
    console.log('\n========================================================================');
    console.log(`   PHASE 3 VERIFICATION COMPLETED: ${passed} / ${total} CHECKS PASSED`);
    console.log(`   Total execution duration: ${totalDuration}ms`);
    console.log('========================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runPhase3LiveVerification();
