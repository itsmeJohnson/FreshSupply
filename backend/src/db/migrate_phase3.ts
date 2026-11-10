import { pool } from './pool';

export async function runPhase3Migrations() {
  console.log('Running FreshSupply Phase 3 Enterprise ERP Database Migrations...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Sales CRM: Leads & Activities
    console.log('Creating CRM tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_leads (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        business_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        business_type VARCHAR(100) DEFAULT 'Restaurant / Hotel',
        city VARCHAR(100) DEFAULT 'Bangalore',
        estimated_monthly_value NUMERIC(12, 2) DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST')),
        assigned_rep_id INTEGER REFERENCES staff_users(id),
        source VARCHAR(100) DEFAULT 'Field Outreach',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_leads_status ON crm_leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_rep ON crm_leads(assigned_rep_id);

      CREATE TABLE IF NOT EXISTS crm_activities (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('CALL', 'MEETING', 'EMAIL', 'FOLLOW_UP', 'NOTE', 'SAMPLE_DELIVERY')),
        summary VARCHAR(255) NOT NULL,
        details TEXT,
        scheduled_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        performed_by VARCHAR(150) NOT NULL,
        outcome VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Commercial Contracts & Agreements
    console.log('Creating Commercial Contracts tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_contracts (
        id SERIAL PRIMARY KEY,
        contract_number VARCHAR(100) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        credit_period_days INTEGER NOT NULL DEFAULT 30,
        credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 500000.00,
        min_order_value NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
        delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
        free_delivery_threshold NUMERIC(12, 2) NOT NULL DEFAULT 10000.00,
        payment_terms VARCHAR(150) NOT NULL DEFAULT 'Net 30 Days (Bank Transfer / NEFT)',
        special_terms TEXT,
        document_reference VARCHAR(255),
        version INTEGER NOT NULL DEFAULT 1,
        approved_by VARCHAR(150),
        approved_at TIMESTAMPTZ,
        created_by VARCHAR(150) NOT NULL DEFAULT 'commercial_team',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_contracts_cust ON customer_contracts(customer_id);

      CREATE TABLE IF NOT EXISTS contract_sku_terms (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER NOT NULL REFERENCES customer_contracts(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        agreed_price NUMERIC(12, 2) NOT NULL,
        min_order_qty INTEGER NOT NULL DEFAULT 1,
        benchmark_margin_pct NUMERIC(5, 2) DEFAULT 12.00,
        notes VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Pricing Approvals & Governance
    console.log('Creating Pricing Governance tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_change_requests (
        id SERIAL PRIMARY KEY,
        request_number VARCHAR(100) UNIQUE NOT NULL,
        request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('CUSTOMER_SKU', 'PRICE_LIST', 'CATEGORY_DISCOUNT', 'BULK_REVISION')),
        entity_id INTEGER NOT NULL,
        proposed_price NUMERIC(12, 2),
        previous_price NUMERIC(12, 2),
        percentage_change NUMERIC(6, 2),
        affected_customers_count INTEGER DEFAULT 1,
        estimated_revenue_impact NUMERIC(14, 2) DEFAULT 0,
        estimated_margin_impact NUMERIC(14, 2) DEFAULT 0,
        reason TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'APPLIED')),
        effective_from TIMESTAMPTZ DEFAULT NOW(),
        requested_by VARCHAR(150) NOT NULL,
        reviewed_by VARCHAR(150),
        review_notes TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_price_req_status ON price_change_requests(status);
    `);

    // 4. Procurement Planning & Supplier Quotations
    console.log('Creating Procurement Planning tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_quotations (
        id SERIAL PRIMARY KEY,
        rfq_number VARCHAR(100) NOT NULL,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quoted_price NUMERIC(12, 2) NOT NULL,
        min_order_qty INTEGER NOT NULL DEFAULT 10,
        lead_time_days INTEGER NOT NULL DEFAULT 2,
        available_supply INTEGER NOT NULL DEFAULT 500,
        valid_until DATE NOT NULL,
        quality_guarantee VARCHAR(100) DEFAULT 'Grade-A Lab Certified',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_quotes_prod ON supplier_quotations(product_id);

      CREATE TABLE IF NOT EXISTS purchase_requisitions (
        id SERIAL PRIMARY KEY,
        pr_number VARCHAR(100) UNIQUE NOT NULL,
        warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        requested_quantity INTEGER NOT NULL,
        urgency VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        reason VARCHAR(100) NOT NULL DEFAULT 'REORDER_POINT_TRIGGERED',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'CONVERTED_PO', 'REJECTED')),
        recommended_vendor_id INTEGER REFERENCES vendors(id),
        po_id INTEGER REFERENCES purchase_orders(id),
        requested_by VARCHAR(150) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 5. Logistics: Delivery Trips, Vehicle Routing & Dispatch Board
    console.log('Creating Logistics & Fleet tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_trips (
        id SERIAL PRIMARY KEY,
        trip_number VARCHAR(100) UNIQUE NOT NULL,
        warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
        vehicle_number VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Refrigerated 3.5T Reefer',
        driver_name VARCHAR(150) NOT NULL,
        driver_phone VARCHAR(50) NOT NULL,
        route_zone VARCHAR(100) NOT NULL DEFAULT 'Bangalore Central & East',
        planned_date DATE NOT NULL,
        departure_time VARCHAR(50) NOT NULL DEFAULT '05:30 AM',
        status VARCHAR(50) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'LOADING', 'DISPATCHED', 'COMPLETED', 'DELAYED')),
        transport_cost NUMERIC(10, 2) NOT NULL DEFAULT 1850.00,
        total_orders_count INTEGER NOT NULL DEFAULT 0,
        total_weight_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS trip_orders (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER NOT NULL REFERENCES delivery_trips(id) ON DELETE CASCADE,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        stop_sequence INTEGER NOT NULL DEFAULT 1,
        delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'LOADED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED')),
        delivered_at TIMESTAMPTZ,
        proof_of_delivery_note TEXT,
        failure_reason VARCHAR(255),
        rescheduled_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_trip_orders_trip ON trip_orders(trip_id);
    `);

    // 6. Customer Self-Service: Saved Lists & Templates
    console.log('Creating Customer Self-Service tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_shopping_lists (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        is_frequent BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customer_shopping_list_items (
        id SERIAL PRIMARY KEY,
        list_id INTEGER NOT NULL REFERENCES customer_shopping_lists(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        default_quantity INTEGER NOT NULL DEFAULT 1,
        unit VARCHAR(50) NOT NULL DEFAULT 'Unit',
        packaging VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 7. Advanced Claims & Quality Inspection
    console.log('Creating Claims & Inspection tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS claim_tickets (
        id SERIAL PRIMARY KEY,
        claim_number VARCHAR(100) UNIQUE NOT NULL,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        product_id INTEGER REFERENCES products(id),
        batch_number VARCHAR(100),
        claim_type VARCHAR(100) NOT NULL DEFAULT 'QUALITY_DEFECT' CHECK (claim_type IN ('QUALITY_DEFECT', 'TRANSIT_DAMAGE', 'MISSING_QUANTITY', 'WRONG_ITEM', 'EXPIRED')),
        defect_grade VARCHAR(50) DEFAULT 'Major (D3)',
        estimated_defect_pct NUMERIC(5, 2) DEFAULT 25.00,
        quantity_affected NUMERIC(10, 2) NOT NULL,
        claim_value NUMERIC(12, 2) NOT NULL,
        ai_defect_analysis JSONB,
        customer_notes TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'IN_PROGRESS', 'APPROVED_REFUND', 'APPROVED_REPLACEMENT', 'REJECTED')),
        resolution_notes TEXT,
        credit_note_ref VARCHAR(100),
        reviewed_by VARCHAR(150),
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_claims_status ON claim_tickets(status);
    `);

    // 8. Centralized Notifications Log
    console.log('Creating Notification Engine tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('CUSTOMER', 'STAFF', 'VENDOR')),
        recipient_id INTEGER NOT NULL,
        channel VARCHAR(50) NOT NULL DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP')),
        event_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'SENT' CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ')),
        payload JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_type, recipient_id);
    `);

    await client.query('COMMIT');
    console.log('Phase 3 Enterprise ERP Migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Phase 3 Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runPhase3Migrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

