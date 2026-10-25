import bcrypt from 'bcryptjs';
import { pool } from './pool';

export async function seedDatabase() {
  console.log('Seeding FreshSupply database with realistic B2B wholesale data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Staff Users (Admin & Staff)
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const opsPasswordHash = await bcrypt.hash('Ops@12345', 10);

    await client.query(`
      INSERT INTO staff_users (email, password_hash, name, role, is_active)
      VALUES 
        ('admin@freshsupply.com', $1, 'Devang Verma (Operations Director)', 'admin', true),
        ('ops@freshsupply.com', $2, 'Rohan Sharma (Dispatch Lead)', 'staff', true)
      ON CONFLICT (email) DO NOTHING;
    `, [adminPasswordHash, opsPasswordHash]);

    // 2. Verified Customers (Restaurants, Cafes, Hotels)
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

    const cust1 = await client.query(`
      INSERT INTO customers (email, password_hash, business_name, contact_person, phone, gst_number, is_active)
      VALUES 
        ('procurement@tandooribistro.com', $1, 'The Tandoori Bistro & Grills', 'Chef Vikram Sen', '+91 98450 12345', '29AABCU9603R1ZM', true)
      ON CONFLICT (email) DO UPDATE SET business_name = EXCLUDED.business_name
      RETURNING id;
    `, [customerPasswordHash]);

    const cust2 = await client.query(`
      INSERT INTO customers (email, password_hash, business_name, contact_person, phone, gst_number, is_active)
      VALUES 
        ('kitchen@urbanbrewcafe.com', $1, 'Urban Brew Artisan Café', 'Meera Nair', '+91 98451 98765', '29AAHCS2101F1Z6', true)
      ON CONFLICT (email) DO UPDATE SET business_name = EXCLUDED.business_name
      RETURNING id;
    `, [customerPasswordHash]);

    const cust3 = await client.query(`
      INSERT INTO customers (email, password_hash, business_name, contact_person, phone, gst_number, is_active)
      VALUES 
        ('purchase@royalheritagehotel.com', $1, 'Royal Heritage Suites & Banquets', 'Sunil Mathur', '+91 98452 44321', '29AABCR8810K1ZT', true)
      ON CONFLICT (email) DO UPDATE SET business_name = EXCLUDED.business_name
      RETURNING id;
    `, [customerPasswordHash]);

    const c1Id = cust1.rows[0].id;
    const c2Id = cust2.rows[0].id;
    const c3Id = cust3.rows[0].id;

    // 3. Customer Delivery Addresses
    const addr1 = await client.query(`
      INSERT INTO customer_addresses (customer_id, label, address_line1, address_line2, landmark, city, state, postal_code, is_default, contact_phone)
      VALUES 
        ($1, 'Main Kitchen / Receiving Bay', '42, Brigade Road, Commercial Hub', 'Ground Floor Goods Entrance', 'Opposite Metro Station', 'Bangalore', 'Karnataka', '560025', true, '+91 98450 12345')
      RETURNING id;
    `, [c1Id]);

    const addr2 = await client.query(`
      INSERT INTO customer_addresses (customer_id, label, address_line1, address_line2, landmark, city, state, postal_code, is_default, contact_phone)
      VALUES 
        ($1, 'North Kitchen Express', '12, Malleshwaram 8th Cross', 'Lower Ground Floor', 'Near Canara Bank', 'Bangalore', 'Karnataka', '560003', false, '+91 98450 12346'),
        ($2, 'Central Café Kitchen', '742, 12th Main Road, HAL 2nd Stage', 'Service Gate #2', 'Behind Coffee Roastery', 'Bangalore', 'Karnataka', '560008', true, '+91 98451 98765'),
        ($3, 'Hotel Main Bulk Store', '100 Feet Road, Koramangala 4th Block', 'Receiving Dock B', 'Adjacent to Service Lift', 'Bangalore', 'Karnataka', '560034', true, '+91 98452 44321')
      RETURNING id;
    `, [c1Id, c2Id, c3Id]);

    // 4. Categories (9 Mandatory Categories from Section 4.C)
    const categoryData = [
      { name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh daily wholesale vegetables graded for culinary kitchens and hotels', sort_order: 1, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600' },
      { name: 'Fruits', slug: 'fruits', description: 'Grade-A fresh fruits, seasonal picks and wholesale crates for beverages and desserts', sort_order: 2, image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600' },
      { name: 'Dairy', slug: 'dairy', description: 'Commercial fresh milk, malai paneer, butter blocks, cooking cream and cheese', sort_order: 3, image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600' },
      { name: 'Rice and grains', slug: 'rice-and-grains', description: 'Aged basmati rice, sona masoori, dal, pulses and specialty wholesale grains', sort_order: 4, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
      { name: 'Spices', slug: 'spices', description: 'Whole aromatic spices, commercial kitchen spice blends and pure ground powders', sort_order: 5, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600' },
      { name: 'Cooking oils', slug: 'cooking-oils', description: 'Commercial 15L tins and bulk culinary oils including sunflower, mustard, and refined oils', sort_order: 6, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600' },
      { name: 'Meat and poultry', slug: 'meat-and-poultry', description: 'FSSAI certified chilled dressed chicken, cuts, mutton curry pieces and seafood', sort_order: 7, image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600' },
      { name: 'Frozen foods', slug: 'frozen-foods', description: 'Commercial french fries, frozen sweet corn, green peas, appetizers and burger patties', sort_order: 8, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
      { name: 'Packaging supplies', slug: 'packaging-supplies', description: 'Eco-friendly food containers, meal trays, paper bags, cling films and delivery boxes', sort_order: 9, image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600' },
    ];

    const categoryMap = new Map<string, number>();

    for (const cat of categoryData) {
      const res = await client.query(`
        INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url
        RETURNING id, slug;
      `, [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]);
      categoryMap.set(res.rows[0].slug, res.rows[0].id);
    }

    // 5. Products (Rich catalogue across all 9 categories with wholesale units and pack sizes)
    const productList = [
      // Vegetables
      {
        sku: 'VEG-ONI-050',
        name: 'Nashik Red Onions (Medium-Large Grade)',
        description: 'Uniform grade premium dry cured red onions, ideal for base gravies, biryanis and sautéing. 50 kg jute sack.',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
        unit: 'Bag (50 kg)',
        pack_size: '50 kg Bag',
        min_order_qty: 1,
        price: 1650.00,
        cost_price: 1350.00,
        stock_quantity: 120,
        is_featured: true,
      },
      {
        sku: 'VEG-POT-050',
        name: 'Hassan Jyoti Fresh Potatoes',
        description: 'High-starch clean skin potatoes for curries, mashed dishes and deep frying. Graded 45mm+. 50 kg mesh bag.',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
        unit: 'Bag (50 kg)',
        pack_size: '50 kg Bag',
        min_order_qty: 1,
        price: 1400.00,
        cost_price: 1100.00,
        stock_quantity: 85,
        is_featured: true,
      },
      {
        sku: 'VEG-TOM-025',
        name: 'Hybrid Salad Tomatoes (Firm Red)',
        description: 'Fresh farm harvest firm hybrid tomatoes packed in breathable crates. Suitable for puree, salads and sauces.',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
        unit: 'Crate (25 kg)',
        pack_size: '25 kg Crate',
        min_order_qty: 2,
        price: 750.00,
        cost_price: 580.00,
        stock_quantity: 65,
        is_featured: true,
      },
      {
        sku: 'VEG-GAR-010',
        name: 'Madhya Pradesh Big Clove Garlic',
        description: 'Cleaned, dry white garlic with large cloves for high-yield kitchen peeling and garlic paste prep.',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1588615419957-46231938b816?w=600',
        unit: 'Net Bag (10 kg)',
        pack_size: '10 kg Net Bag',
        min_order_qty: 1,
        price: 1850.00,
        cost_price: 1550.00,
        stock_quantity: 40,
        is_featured: false,
      },
      {
        sku: 'VEG-GIN-010',
        name: 'Wayanad Washed Fresh Ginger',
        description: 'Aromatic fibre-free washed ginger roots, harvested fresh. High juice content.',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600',
        unit: 'Box (10 kg)',
        pack_size: '10 kg Box',
        min_order_qty: 1,
        price: 1200.00,
        cost_price: 950.00,
        stock_quantity: 35,
        is_featured: false,
      },

      // Fruits
      {
        sku: 'FRU-LEM-010',
        name: 'Juicy Yellow Seedless Lemons (Grade A)',
        description: 'Thin-skinned high juice yield lemons for bar, mocktails, marinades and beverage stations. 10 kg bag (~350 pcs).',
        category: 'fruits',
        image_url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600',
        unit: 'Bag (10 kg)',
        pack_size: '10 kg Bag',
        min_order_qty: 1,
        price: 950.00,
        cost_price: 720.00,
        stock_quantity: 50,
        is_featured: true,
      },
      {
        sku: 'FRU-BAN-015',
        name: 'Robusta Cooking & Table Bananas',
        description: 'Semi-ripe robusta bananas, crate packed with foam separators to prevent transit bruising.',
        category: 'fruits',
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
        unit: 'Crate (15 kg)',
        pack_size: '15 kg Crate',
        min_order_qty: 1,
        price: 680.00,
        cost_price: 510.00,
        stock_quantity: 45,
        is_featured: false,
      },

      // Dairy
      {
        sku: 'DAI-PAN-005',
        name: 'Fresh Malai Paneer Block (Vacuum Packed)',
        description: 'Rich, soft 55% milk-fat paneer block for restaurant curries and tikkas. Retains softness during grilling.',
        category: 'dairy',
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600',
        unit: 'Tub (5 kg Block)',
        pack_size: '5 kg Block',
        min_order_qty: 2,
        price: 1650.00,
        cost_price: 1350.00,
        stock_quantity: 40,
        is_featured: true,
      },
      {
        sku: 'DAI-BUT-010',
        name: 'Creamery Yellow Table Butter (Commercial Block)',
        description: 'Commercial pasteurised salted butter block for sauces, baking, and restaurant finishing.',
        category: 'dairy',
        image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600',
        unit: 'Carton (10 kg)',
        pack_size: '10 x 1 kg Blocks',
        min_order_qty: 1,
        price: 4400.00,
        cost_price: 3850.00,
        stock_quantity: 28,
        is_featured: true,
      },
      {
        sku: 'DAI-CHZ-002',
        name: 'Mozzarella & Cheddar Blend (Diced)',
        description: 'Pre-shredded high-melt cheese blend with perfect stretch and browning for pizzas and continental dishes.',
        category: 'dairy',
        image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600',
        unit: 'Pack (2 kg)',
        pack_size: '2 kg Pack',
        min_order_qty: 3,
        price: 880.00,
        cost_price: 710.00,
        stock_quantity: 60,
        is_featured: false,
      },

      // Rice and grains
      {
        sku: 'GRA-BAS-025',
        name: 'Royal XXL Aged 1121 Basmati Rice (2 Years Aged)',
        description: 'Extra-long grain basmati rice with high elongation (up to 24mm cooked length) and non-sticky texture. Ideal for biryanis.',
        category: 'rice-and-grains',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
        unit: 'Bag (25 kg)',
        pack_size: '25 kg Bag',
        min_order_qty: 1,
        price: 3100.00,
        cost_price: 2550.00,
        stock_quantity: 75,
        is_featured: true,
      },
      {
        sku: 'GRA-SON-025',
        name: 'Sona Masoori Raw Rice (Steam Aged)',
        description: 'Lightweight easy-to-digest daily meal rice popular in South Indian dining and thali services.',
        category: 'rice-and-grains',
        image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600',
        unit: 'Bag (25 kg)',
        pack_size: '25 kg Bag',
        min_order_qty: 1,
        price: 1550.00,
        cost_price: 1280.00,
        stock_quantity: 90,
        is_featured: false,
      },
      {
        sku: 'GRA-TUR-025',
        name: 'Unpolished Fatka Toor Dal (Grade A)',
        description: 'High protein quick-cooking yellow split pigeon peas. No chemical gloss or artificial polishing.',
        category: 'rice-and-grains',
        image_url: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600',
        unit: 'Bag (25 kg)',
        pack_size: '25 kg Bag',
        min_order_qty: 1,
        price: 3600.00,
        cost_price: 3100.00,
        stock_quantity: 45,
        is_featured: true,
      },

      // Spices
      {
        sku: 'SPI-CHI-005',
        name: 'Guntur Stemless Red Chilli (High Heat & Colour)',
        description: 'Sun-dried premium whole red chillies with bright natural red colour and balanced pungency.',
        category: 'spices',
        image_url: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=600',
        unit: 'Bag (5 kg)',
        pack_size: '5 kg Bag',
        min_order_qty: 1,
        price: 1750.00,
        cost_price: 1400.00,
        stock_quantity: 35,
        is_featured: false,
      },
      {
        sku: 'SPI-GAR-005',
        name: 'Chef Secret Shahi Garam Masala (Coarse Ground)',
        description: 'Master chef blend of 14 roasted spices including green cardamom, mace, cinnamon, and cloves. Vacuum sealed.',
        category: 'spices',
        image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',
        unit: 'Pouch (5 kg)',
        pack_size: '5 kg Pouch',
        min_order_qty: 1,
        price: 2450.00,
        cost_price: 1950.00,
        stock_quantity: 50,
        is_featured: true,
      },

      // Cooking oils
      {
        sku: 'OIL-SUN-015',
        name: 'Refined Sunflower Cooking Oil (15 L Tin)',
        description: 'Triple refined high smoke-point sunflower oil. Ideal for commercial deep fryers and bulk sautéing.',
        category: 'cooking-oils',
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',
        unit: 'Tin (15 Litre)',
        pack_size: '15 Litre Tin',
        min_order_qty: 2,
        price: 2150.00,
        cost_price: 1880.00,
        stock_quantity: 110,
        is_featured: true,
      },
      {
        sku: 'OIL-MUS-015',
        name: 'Kachi Ghani Cold Pressed Mustard Oil',
        description: 'Authentic pungent mustard oil for tandoori marinades, North Indian and Bengali cuisines.',
        category: 'cooking-oils',
        image_url: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600',
        unit: 'Tin (15 Litre)',
        pack_size: '15 Litre Tin',
        min_order_qty: 1,
        price: 2350.00,
        cost_price: 2020.00,
        stock_quantity: 30,
        is_featured: false,
      },

      // Meat and poultry
      {
        sku: 'MEA-CHK-010',
        name: 'Chilled Curry-Cut Chicken (Skinless 8-Piece)',
        description: 'Tender broiler chicken dressed and washed under stringent food-safety protocols. 10 kg insulated crate.',
        category: 'meat-and-poultry',
        image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600',
        unit: 'Crate (10 kg)',
        pack_size: '10 kg Insulated Crate',
        min_order_qty: 1,
        price: 2100.00,
        cost_price: 1750.00,
        stock_quantity: 25,
        is_featured: true,
      },
      {
        sku: 'MEA-EGG-210',
        name: 'Farm Fresh Brown Eggs (7 Trays x 30 Eggs)',
        description: 'Graded sanitized brown eggs with strong shell integrity. 210 eggs per transport master carton.',
        category: 'meat-and-poultry',
        image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600',
        unit: 'Carton (210 Eggs)',
        pack_size: '210 Eggs Master Carton',
        min_order_qty: 1,
        price: 1350.00,
        cost_price: 1120.00,
        stock_quantity: 40,
        is_featured: true,
      },

      // Frozen foods
      {
        sku: 'FRO-FRY-010',
        name: 'Premium 9mm Coated French Fries (Export Quality)',
        description: 'Double fried crispy potato fries that hold crispiness for up to 30 minutes in delivery containers.',
        category: 'frozen-foods',
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600',
        unit: 'Carton (10 kg / 4 x 2.5 kg)',
        pack_size: '10 kg Carton',
        min_order_qty: 1,
        price: 1550.00,
        cost_price: 1250.00,
        stock_quantity: 55,
        is_featured: true,
      },
      {
        sku: 'FRO-PEA-010',
        name: 'IQF Sweet Green Peas (Tender A-Grade)',
        description: 'Individually Quick Frozen vibrant green tender peas with natural sweetness.',
        category: 'frozen-foods',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        unit: 'Bag (10 kg)',
        pack_size: '10 kg Bag',
        min_order_qty: 1,
        price: 1250.00,
        cost_price: 980.00,
        stock_quantity: 38,
        is_featured: false,
      },

      // Packaging supplies
      {
        sku: 'PKG-CON-500',
        name: 'Microwave Safe 3-Compartment Meal Trays (500 Pcs)',
        description: 'BPA-free heavy duty food container trays with leak-resistant snap lids for takeaway & delivery.',
        category: 'packaging-supplies',
        image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600',
        unit: 'Box (500 Sets)',
        pack_size: '500 Sets per Box',
        min_order_qty: 1,
        price: 2900.00,
        cost_price: 2350.00,
        stock_quantity: 65,
        is_featured: true,
      },
      {
        sku: 'PKG-BAG-100',
        name: 'Virgin Kraft Paper Takeaway Bags (12x10x6 inch)',
        description: 'Flat bottom heavy load paper bags with reinforced twisted paper handles. 100 pcs bundle.',
        category: 'packaging-supplies',
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
        unit: 'Bundle (100 Pcs)',
        pack_size: '100 Pcs Bundle',
        min_order_qty: 2,
        price: 780.00,
        cost_price: 590.00,
        stock_quantity: 90,
        is_featured: false,
      },
    ];

    const insertedProducts: Array<{ id: number; name: string; sku: string; unit: string; pack_size: string; price: number; stock: number }> = [];

    for (const p of productList) {
      const catId = categoryMap.get(p.category);
      if (!catId) continue;

      const pRes = await client.query(`
        INSERT INTO products (sku, name, description, category_id, image_url, unit, pack_size, min_order_qty, price, cost_price, stock_quantity, is_active, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
        ON CONFLICT (sku) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          stock_quantity = EXCLUDED.stock_quantity,
          is_featured = EXCLUDED.is_featured
        RETURNING id, name, sku, unit, pack_size, price, stock_quantity;
      `, [p.sku, p.name, p.description, catId, p.image_url, p.unit, p.pack_size, p.min_order_qty, p.price, p.cost_price, p.stock_quantity, p.is_featured]);

      const prod = pRes.rows[0];
      insertedProducts.push({
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        pack_size: prod.pack_size,
        price: parseFloat(prod.price),
        stock: prod.stock_quantity,
      });

      // Initial Inventory Log for each product
      await client.query(`
        INSERT INTO inventory_logs (product_id, change_qty, balance_after, reason, notes, created_by)
        VALUES ($1, $2, $2, 'initial_stock_onboarding', 'Initial bulk stock intake for hub activation', 'Devang Verma')
      `, [prod.id, prod.stock_quantity]);
    }

    // 6. Realistic Historical & Active B2B Orders
    const addressSnapshot1 = {
      label: 'Main Kitchen / Receiving Bay',
      address_line1: '42, Brigade Road, Commercial Hub',
      address_line2: 'Ground Floor Goods Entrance',
      landmark: 'Opposite Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560025',
      contact_phone: '+91 98450 12345',
    };

    const sampleOrders = [
      {
        order_number: 'FS-20261023-0101',
        customer_id: c1Id,
        contact_person: 'Chef Vikram Sen',
        contact_phone: '+91 98450 12345',
        po_reference: 'PO-TB-8842',
        delivery_date: '2026-10-24',
        delivery_slot: 'Early Morning (05:00 AM - 08:00 AM)',
        status: 'delivered',
        notes: 'Deliver to goods bay at rear entrance. Gate code 4490.',
        items: [
          { prodIndex: 0, qty: 3 }, // 3 Bags Onion = 4950
          { prodIndex: 1, qty: 2 }, // 2 Bags Potato = 2800
          { prodIndex: 7, qty: 4 }, // 4 Paneer = 6600
          { prodIndex: 10, qty: 2 }, // 2 Basmati = 6200
        ],
        status_steps: [
          { status: 'pending', notes: 'Order submitted by Chef Vikram Sen', by_type: 'customer', by_id: '1' },
          { status: 'confirmed', notes: 'Order confirmed and inventory reserved', by_type: 'staff', by_id: '1' },
          { status: 'processing', notes: 'Packed and palletized at Central Bangalore Hub', by_type: 'staff', by_id: '2' },
          { status: 'dispatched', notes: 'Dispatched via Temperature-Controlled Van #KA04-E-8821', by_type: 'staff', by_id: '2' },
          { status: 'delivered', notes: 'Delivered and verified by Chef Vikram Sen. Gate receiving signed.', by_type: 'staff', by_id: '2' },
        ]
      },
      {
        order_number: 'FS-20261025-0102',
        customer_id: c1Id,
        contact_person: 'Chef Vikram Sen',
        contact_phone: '+91 98450 12345',
        po_reference: 'PO-TB-8890',
        delivery_date: '2026-10-26',
        delivery_slot: 'Early Morning (05:00 AM - 08:00 AM)',
        status: 'processing',
        notes: 'Priority morning delivery required for lunch catering service.',
        items: [
          { prodIndex: 2, qty: 4 }, // 4 Crates Tomatoes = 3000
          { prodIndex: 15, qty: 3 }, // 3 Tins Sunflower Oil = 6450
          { prodIndex: 17, qty: 3 }, // 3 Crates Chicken = 6300
        ],
        status_steps: [
          { status: 'pending', notes: 'Order submitted via mobile app', by_type: 'customer', by_id: '1' },
          { status: 'confirmed', notes: 'Commercial credit approved and order confirmed', by_type: 'staff', by_id: '1' },
          { status: 'processing', notes: 'Batch staging in cold room #3', by_type: 'staff', by_id: '2' },
        ]
      },
      {
        order_number: 'FS-20261025-0103',
        customer_id: c2Id,
        contact_person: 'Meera Nair',
        contact_phone: '+91 98451 98765',
        po_reference: 'UBC-OCT-102',
        delivery_date: '2026-10-26',
        delivery_slot: 'Morning Batch (08:00 AM - 11:00 AM)',
        status: 'confirmed',
        notes: 'Please check packaging seal on butter blocks.',
        items: [
          { prodIndex: 8, qty: 2 }, // 2 Butter cartons = 8800
          { prodIndex: 5, qty: 2 }, // 2 Lemon bags = 1900
          { prodIndex: 21, qty: 2 }, // 2 boxes containers = 5800
        ],
        status_steps: [
          { status: 'pending', notes: 'Order placed by Urban Brew Kitchen', by_type: 'customer', by_id: '2' },
          { status: 'confirmed', notes: 'Order scheduled for morning route #4', by_type: 'staff', by_id: '1' },
        ]
      },
      {
        order_number: 'FS-20261025-0104',
        customer_id: c3Id,
        contact_person: 'Sunil Mathur',
        contact_phone: '+91 98452 44321',
        po_reference: 'RH-BANQ-552',
        delivery_date: '2026-10-27',
        delivery_slot: 'Early Morning (05:00 AM - 08:00 AM)',
        status: 'pending',
        notes: 'Receiving Dock B open from 5:30 AM.',
        items: [
          { prodIndex: 0, qty: 5 }, // 5 Bags Onion = 8250
          { prodIndex: 1, qty: 4 }, // 4 Bags Potato = 5600
          { prodIndex: 10, qty: 4 }, // 4 Bags Basmati = 12400
          { prodIndex: 15, qty: 4 }, // 4 Tins Sunflower Oil = 8600
        ],
        status_steps: [
          { status: 'pending', notes: 'New order waiting for operations verification', by_type: 'customer', by_id: '3' },
        ]
      }
    ];

    for (const ord of sampleOrders) {
      // Calculate subtotal
      let subtotal = 0;
      for (const it of ord.items) {
        const p = insertedProducts[it.prodIndex];
        subtotal += p.price * it.qty;
      }
      const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      const deliveryCharge = subtotal > 5000 ? 0 : 250;
      const totalAmount = subtotal + taxAmount + deliveryCharge;

      const orderRes = await client.query(`
        INSERT INTO orders (
          order_number, customer_id, address_snapshot, contact_person, contact_phone,
          po_reference, delivery_date, delivery_slot, subtotal, tax_amount, delivery_charge,
          discount_amount, total_amount, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, $12, $13, $14)
        ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status
        RETURNING id;
      `, [
        ord.order_number,
        ord.customer_id,
        JSON.stringify(addressSnapshot1),
        ord.contact_person,
        ord.contact_phone,
        ord.po_reference,
        ord.delivery_date,
        ord.delivery_slot,
        subtotal,
        taxAmount,
        deliveryCharge,
        totalAmount,
        ord.status,
        ord.notes,
      ]);

      const orderId = orderRes.rows[0].id;

      // Insert order items with snapshots
      for (const it of ord.items) {
        const p = insertedProducts[it.prodIndex];
        const lineTotal = p.price * it.qty;

        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name_snapshot, sku_snapshot,
            unit_snapshot, pack_size_snapshot, unit_price, quantity, line_total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [
          orderId,
          p.id,
          p.name,
          p.sku,
          p.unit,
          p.pack_size,
          p.price,
          it.qty,
          lineTotal,
        ]);
      }

      // Insert status history
      for (const st of ord.status_steps) {
        await client.query(`
          INSERT INTO order_status_history (order_id, status, notes, updated_by_type, updated_by_id)
          VALUES ($1, $2, $3, $4, $5);
        `, [orderId, st.status, st.notes, st.by_type, st.by_id]);
      }
    }

    await client.query('COMMIT');
    console.log('Database seeding successfully finished!');
    console.log(`Summary:
  - 2 Staff users created (admin@freshsupply.com, ops@freshsupply.com)
  - 3 Customer business accounts created
  - 9 Mandatory Wholesale Categories initialized
  - ${insertedProducts.length} Wholesale products seeded with active inventory
  - 4 Sample orders created across statuses (Pending, Confirmed, Processing, Delivered)
    `);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
