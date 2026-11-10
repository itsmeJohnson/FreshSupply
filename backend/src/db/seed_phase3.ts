import { pool } from './pool';

export async function seedPhase3Data() {
  console.log('Seeding Phase 3 Enterprise ERP Data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed CRM Leads & Interaction History
    console.log('Seeding CRM Leads & Sales Interactions...');
    const staffRes = await client.query('SELECT id, name FROM staff_users LIMIT 2');
    const rep1Id = staffRes.rows[0]?.id || 1;
    const rep2Id = staffRes.rows[1]?.id || rep1Id;

    const lead1 = await client.query(`
      INSERT INTO crm_leads (business_name, contact_person, email, phone, business_type, city, estimated_monthly_value, status, assigned_rep_id, source, notes)
      VALUES ('The Grand Chola Banquets', 'Chef Sandeep Roy', 'sandeep.roy@grandchola.com', '+91 98450 77881', 'Hotel & Banquets', 'Bangalore', 450000.00, 'PROPOSAL_SENT', $1::integer, 'Direct Referral', 'Requires high volume Grade-A tomatoes and Basmati Rice on Net 30 terms')
      RETURNING id;
    `, [rep1Id]);

    const lead2 = await client.query(`
      INSERT INTO crm_leads (business_name, contact_person, email, phone, business_type, city, estimated_monthly_value, status, assigned_rep_id, source, notes)
      VALUES ('Spice Symphony Cloud Kitchens (8 Outlets)', 'Manoj Hegde', 'procurement@spicesymphony.in', '+91 98450 66772', 'Cloud Kitchen Chain', 'Bangalore', 720000.00, 'QUALIFIED', $1::integer, 'Cold Outreach', 'Multi-location daily drop-offs required between 5:30 AM and 7:00 AM')
      RETURNING id;
    `, [rep2Id]);

    const lead3 = await client.query(`
      INSERT INTO crm_leads (business_name, contact_person, email, phone, business_type, city, estimated_monthly_value, status, assigned_rep_id, source, notes)
      VALUES ('Brew & Bites Artisan Cafes', 'Kavita Menon', 'kavita@brewandbites.co', '+91 98450 55443', 'Cafe Chain', 'Bangalore', 280000.00, 'CONTACTED', $1::integer, 'Website Form', 'Looking for certified organic paneer, butter, and special packaging')
      RETURNING id;
    `, [rep1Id]);

    // Insert CRM Activities
    const lead1Id = lead1.rows[0].id;
    const lead2Id = lead2.rows[0].id;

    await client.query(`
      INSERT INTO crm_activities (lead_id, activity_type, summary, details, scheduled_at, completed_at, performed_by, outcome)
      VALUES ($1::integer, 'MEETING', 'On-site kitchen sample presentation', 'Presented 25kg Basmati and salad tomato samples to Chef Sandeep. Quality rated 9.5/10.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'Rohan Sharma', 'PROPOSAL_REQUESTED');
    `, [lead1Id]);

    await client.query(`
      INSERT INTO crm_activities (lead_id, activity_type, summary, details, scheduled_at, completed_at, performed_by, outcome)
      VALUES ($1::integer, 'EMAIL', 'Commercial contract proposal sent', 'Sent draft contract with ₹1,800/Qtl Basmati and Net 30 credit limit of ₹5L.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'Rohan Sharma', 'AWAITING_LEGAL_APPROVAL');
    `, [lead1Id]);

    await client.query(`
      INSERT INTO crm_activities (lead_id, activity_type, summary, details, scheduled_at, completed_at, performed_by, outcome)
      VALUES ($1::integer, 'CALL', 'Initial procurement qualification call', 'Discussed 8 kitchen locations, daily delivery slots, and central invoicing requirement.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'Pooja Hegde', 'SAMPLE_REQUESTED');
    `, [lead2Id]);

    // 2. Commercial Contracts
    console.log('Seeding Customer Commercial Contracts...');
    const gmCustRes = await client.query("SELECT id FROM customers WHERE email = 'procurement@greenmart.com'");
    if (gmCustRes.rows.length > 0) {
      const gmCustId = gmCustRes.rows[0].id;
      const contractRes = await client.query(`
        INSERT INTO customer_contracts (
          contract_number, customer_id, title, status, start_date, end_date, credit_period_days,
          credit_limit, min_order_value, delivery_charge, free_delivery_threshold, payment_terms,
          special_terms, document_reference, version, approved_by, approved_at, created_by
        ) VALUES (
          'AGR-2026-GM01', $1::integer, 'GreenMart Master Wholesale Supply Agreement 2026-27', 'ACTIVE',
          '2026-04-01', '2027-03-31', 30, 500000.00, 10000.00, 0, 15000.00,
          'Net 30 Days via RTGS / Virtual Collection Account',
          'Price locked for 180 days on Basmati Rice. Refrigerated delivery guaranteed before 08:00 AM.',
          'DOCS/CONTRACTS/AGR-2026-GM01-SIGNED.PDF', 1, 'Commercial VP - A. Kapoor', NOW() - INTERVAL '60 days', 'legal_team'
        )
        ON CONFLICT (contract_number) DO NOTHING
        RETURNING id;
      `, [gmCustId]);

      if (contractRes.rows.length > 0) {
        const contractId = contractRes.rows[0].id;
        const prodRes = await client.query("SELECT id FROM products WHERE sku = 'GRA-BAS-025' LIMIT 1");
        if (prodRes.rows.length > 0) {
          await client.query(`
            INSERT INTO contract_sku_terms (contract_id, product_id, agreed_price, min_order_qty, benchmark_margin_pct, notes)
            VALUES ($1::integer, $2::integer, 1800.00, 10, 14.50, 'Contracted wholesale price locked until Sep 2027')
          `, [contractId, prodRes.rows[0].id]);
        }
      }
    }

    // 3. Pricing Change Requests (Approval Workflow)
    console.log('Seeding Price Change Requests for Governance...');
    const onionProdRes = await client.query("SELECT id, price FROM products WHERE sku = 'VEG-ONI-050' LIMIT 1");
    if (onionProdRes.rows.length > 0) {
      const onionId = onionProdRes.rows[0].id;
      const currentPrice = parseFloat(onionProdRes.rows[0].price);
      await client.query(`
        INSERT INTO price_change_requests (
          request_number, request_type, entity_id, proposed_price, previous_price, percentage_change,
          affected_customers_count, estimated_revenue_impact, estimated_margin_impact, reason,
          status, requested_by
        ) VALUES (
          'PCR-2026-092', 'CUSTOMER_SKU', $1::integer, $2::numeric + 100.00, $2::numeric, 6.06, 14, 185000.00, 24000.00,
          'Nashik APMC mandi wholesale arrival rates increased due to unseasonal rains. Adjusting baseline to maintain 12% gross margin.',
          'PENDING', 'Sourcing Category Manager - Rajesh K.'
        )
        ON CONFLICT (request_number) DO NOTHING;
      `, [onionId, currentPrice]);
    }

    // 4. Supplier Quotations & Multi-Vendor Comparison
    console.log('Seeding Supplier Quotations...');
    const tomatoProdRes = await client.query("SELECT id FROM products WHERE sku = 'VEG-TOM-025' LIMIT 1");
    if (tomatoProdRes.rows.length > 0) {
      const tomId = tomatoProdRes.rows[0].id;
      await client.query(`
        INSERT INTO supplier_quotations (rfq_number, vendor_id, product_id, quoted_price, min_order_qty, lead_time_days, available_supply, valid_until, quality_guarantee, notes)
        VALUES 
          ('RFQ-TOM-01', 1, $1::integer, 680.00, 50, 1, 600, CURRENT_DATE + INTERVAL '14 days', 'Grade-A Crimson Salad (Firmness > 92%)', 'Direct farm gate harvest Nashik'),
          ('RFQ-TOM-02', 4, $1::integer, 710.00, 20, 2, 350, CURRENT_DATE + INTERVAL '14 days', 'Grade-A Greenhouse Hydroponic', 'Bangalore Rural greenhouse cluster')
      `, [tomId]);
    }

    // 5. Logistics: Delivery Trips & Dispatch Board
    console.log('Seeding Fleet Logistics & Dispatch Board...');
    const trip1 = await client.query(`
      INSERT INTO delivery_trips (
        trip_number, warehouse_id, vehicle_number, vehicle_type, driver_name, driver_phone,
        route_zone, planned_date, departure_time, status, transport_cost, total_orders_count, total_weight_kg
      ) VALUES (
        'TRIP-20261026-01', 1, 'KA-04-MH-4421', 'Tata 407 Refrigerated Reefer (3.5T)',
        'Muthu Krishnan', '+91 98455 11223', 'Yeshwanthpur - Rajajinagar - Malleshwaram',
        CURRENT_DATE, '05:30 AM', 'DISPATCHED', 2100.00, 2, 1420.00
      )
      ON CONFLICT (trip_number) DO NOTHING
      RETURNING id;
    `);

    if (trip1.rows.length > 0) {
      const tripId = trip1.rows[0].id;
      const orderRes = await client.query('SELECT id FROM orders LIMIT 2');
      if (orderRes.rows.length >= 2) {
        await client.query(`
          INSERT INTO trip_orders (trip_id, order_id, stop_sequence, delivery_status, proof_of_delivery_note)
          VALUES 
            ($1::integer, $2::integer, 1, 'OUT_FOR_DELIVERY', 'Van in transit via Outer Ring Road'),
            ($1::integer, $3::integer, 2, 'PENDING', 'Staged in reefer bay 2')
        `, [tripId, orderRes.rows[0].id, orderRes.rows[1].id]);
      }
    }

    // 6. Customer Self-Service Saved Lists
    console.log('Seeding Customer Shopping Lists...');
    if (gmCustRes.rows.length > 0) {
      const gmCustId = gmCustRes.rows[0].id;
      const listRes = await client.query(`
        INSERT INTO customer_shopping_lists (customer_id, name, description, is_frequent)
        VALUES ($1::integer, 'Daily Kitchen Core Essentials', 'Standard daily bulk produce and staples required every morning', true)
        RETURNING id;
      `, [gmCustId]);

      if (listRes.rows.length > 0) {
        const listId = listRes.rows[0].id;
        const p1 = await client.query("SELECT id, unit FROM products WHERE sku = 'VEG-TOM-025' LIMIT 1");
        const p2 = await client.query("SELECT id, unit FROM products WHERE sku = 'VEG-ONI-050' LIMIT 1");
        const p3 = await client.query("SELECT id, unit FROM products WHERE sku = 'GRA-BAS-025' LIMIT 1");

        if (p1.rows.length > 0) {
          await client.query(`
            INSERT INTO customer_shopping_list_items (list_id, product_id, default_quantity, unit, packaging)
            VALUES 
              ($1::integer, $2::integer, 15, $3::text, 'Crates (25 kg)'),
              ($1::integer, $4::integer, 10, $5::text, 'Bags (50 kg)'),
              ($1::integer, $6::integer, 4, $7::text, 'Bags (25 kg)')
          `, [listId, p1.rows[0].id, p1.rows[0].unit, p2.rows[0].id, p2.rows[0].unit, p3.rows[0].id, p3.rows[0].unit]);
        }
      }
    }

    // 7. Advanced Claims & Quality Inspection Tickets
    console.log('Seeding Claims & Inspection Tickets...');
    const claimOrderRes = await client.query('SELECT id, customer_id FROM orders LIMIT 1');
    if (claimOrderRes.rows.length > 0) {
      const cOrd = claimOrderRes.rows[0];
      await client.query(`
        INSERT INTO claim_tickets (
          claim_number, order_id, customer_id, claim_type, defect_grade, estimated_defect_pct,
          quantity_affected, claim_value, ai_defect_analysis, customer_notes, status,
          resolution_notes, credit_note_ref, reviewed_by, reviewed_at
        ) VALUES (
          'CLM-98527', $1::integer, $2::integer, 'QUALITY_DEFECT', 'Major (D3)', 28.40, 142.00, 28560.00,
          '{"issue_detected": ["Fungal Growth", "Bruising", "Over Ripening"], "ai_confidence": 96, "automated_grade": "D3"}'::jsonb,
          'Received spoiled tomatoes in morning batch. Approx 30% unusable.',
          'PENDING_REVIEW', 'Awaiting operations supervisor signoff', 'CN-2026-081', 'QC Specialist Anand', NOW()
        )
        ON CONFLICT (claim_number) DO NOTHING;
      `, [cOrd.id, cOrd.customer_id]);
    }

    // 8. Notifications Log
    console.log('Seeding Notifications Log...');
    await client.query(`
      INSERT INTO notifications (recipient_type, recipient_id, channel, event_type, title, message, status, payload)
      VALUES 
        ('CUSTOMER', 10, 'WHATSAPP', 'ORDER_DISPATCHED', 'FreshSupply Order Dispatched', 'Your order #ORD-84271 is dispatched via Reefer #KA-04-MH-4421. Driver: Muthu (+91 98455 11223). ETA 06:15 AM.', 'DELIVERED', '{"order_id": 84271, "van": "KA-04-MH-4421"}'::jsonb),
        ('CUSTOMER', 10, 'IN_APP', 'INVOICE_GENERATED', 'Tax Invoice Available', 'Tax Invoice INV-84271 for ₹4,72,500.00 is ready for download.', 'READ', '{"invoice_id": 1}'::jsonb),
        ('STAFF', 1, 'EMAIL', 'PRICE_CHANGE_REQUEST', 'Pending Approval: Price Revision', 'Category Manager requested +6% revision on Nashik Red Onions (PCR-2026-092).', 'DELIVERED', '{"request_id": 1}'::jsonb),
        ('CUSTOMER', 11, 'SMS', 'CREDIT_LIMIT_WARNING', 'Credit Utilization Warning', 'Your account has utilized 85% of approved credit limit. Outstanding: ₹2,55,000.', 'SENT', '{"utilization_pct": 85}'::jsonb)
    `);

    await client.query('COMMIT');
    console.log('Phase 3 Enterprise ERP Data Seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Phase 3 Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedPhase3Data()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
