# FreshSupply — Live Client Demonstration Sheet & Role Matrix

This document is a demonstration guide and role matrix for presenting the FreshSupply B2B wholesale platform to potential restaurant, hotel, and catering enterprise clients.

---

## 1. Quick Access & Platform Endpoints

| Environment | Access URL / Artifact | Purpose |
| :--- | :--- | :--- |
| **Web Admin Console** | [https://freshsupply-admin.vercel.app](https://freshsupply-admin.vercel.app) | Desktop control room for warehouse dispatchers, catalog managers, and executives. |
| **Android Buyer App** | [`android/app/build/outputs/apk/release/app-release.apk`](file:///Users/apple/Workspace/GroceryDemo/android/app/build/outputs/apk/release/app-release.apk) | Native mobile application for chefs, purchase managers, and restaurant owners. |
| **Live Backend API** | [https://freshsupply-backend.vercel.app/api](https://freshsupply-backend.vercel.app/api) | High-speed serverless API connected to managed PostgreSQL. |
| **API Health Status** | [https://freshsupply-backend.vercel.app/health](https://freshsupply-backend.vercel.app/health) | Real-time service uptime verification. |

---

## 2. User Credentials, Personas & Responsibilities

### A. Operations & Warehouse Team (Web Admin Console)

#### 1. Operations Director (Super Admin)
- **Email**: `admin@freshsupply.com`
- **Password**: `Admin@12345`
- **Portal**: [FreshSupply Admin Console](https://freshsupply-admin.vercel.app)
- **Role & Scope**: Super Administrator with unrestricted platform authority.
- **Key Responsibilities**:
  - Reviews overall business metrics (Gross Revenue, Total Orders, Active Buyer count).
  - Approves wholesale catalog pricing, margin rules, and active/inactive category visibility.
  - Manages internal staff roles and provisions dispatch personnel.
  - Reviews stock discrepancies and audits critical inventory write-offs.

#### 2. Dispatch & Fulfillment Lead (Staff)
- **Email**: `ops@freshsupply.com`
- **Password**: `Ops@12345`
- **Portal**: [FreshSupply Admin Console](https://freshsupply-admin.vercel.app)
- **Role & Scope**: Warehouse Operations & Dispatch Manager.
- **Key Responsibilities**:
  - Monitors incoming live orders for morning and afternoon delivery windows.
  - Transitions order fulfillment stages: `Pending` &rarr; `Confirmed` &rarr; `Processing` &rarr; `Dispatched` &rarr; `Delivered`.
  - Enters delivery vehicle notes, dispatch bay numbers, and handles exception handling/cancellations.
  - Performs daily stock audits and records manual warehouse adjustments (*Restock, Damaged, Spoilage, Customer Return*).

---

### B. Buyer Accounts (Android Native Application)

#### 3. Executive Chef / Procurement Head (Fine Dining Restaurant)
- **Business**: *The Tandoori Bistro & Grills* (GSTIN: `29AABCU9603R1ZM`)
- **Email**: `procurement@tandooribistro.com`
- **Password**: `Customer@123`
- **Contact**: Chef Vikram Sen (`+91 98450 12345`)
- **Receiving Bay**: Main Kitchen / Receiving Bay, Brigade Road Commercial Hub, Bangalore.
- **Ordering Pattern**: High-volume daily vegetables (Onions, Tomatoes, Potatoes), aged basmati rice, paneer, and poultry.

#### 4. Café Operations Manager (Artisan Café & Bakery)
- **Business**: *Urban Brew Artisan Café* (GSTIN: `29AAHCS2101F1Z6`)
- **Email**: `kitchen@urbanbrewcafe.com`
- **Password**: `Customer@123`
- **Contact**: Meera Nair (`+91 98451 98765`)
- **Receiving Bay**: Pastry & Prep Station, Indiranagar 100ft Road, Bangalore.
- **Ordering Pattern**: Commercial dairy milk, cooking cream, unsalted butter blocks, gourmet fruits, and eco-friendly takeout containers.

#### 5. Banquet Purchase Manager (Luxury Business Hotel)
- **Business**: *Royal Heritage Suites & Banquets* (GSTIN: `29AABCR8810K1ZT`)
- **Email**: `purchase@royalheritagehotel.com`
- **Password**: `Customer@123`
- **Contact**: Sunil Mathur (`+91 98452 44321`)
- **Receiving Bay**: Central Receiving Dock, MG Road Hospitality Zone, Bangalore.
- **Ordering Pattern**: Bulk cooking oils (15L tins), whole aromatic spices, frozen foods, and heavy commercial packaging supplies.

---

## 3. The 5-Minute Live Demonstration Script

Follow this step-by-step walkthrough during client pitches to showcase seamless buyer-to-warehouse synchronization:

```
[Buyer on Phone]                       [Cloud Engine]                 [Warehouse Admin]
Browse & Order (Android) ───────────> ACID Transaction ───────────> Real-Time Dashboard (Web)
                                     - Locks Inventory               - Order Appeared
                                     - Verifies MOQ                  - Dispatches Goods
                                     - Records Tax & PO              - Updates Live Status
```

### Step 1: Open the Mobile App (Buyer Experience)
1. Launch **FreshSupply** on the Android device.
2. Sign in as `procurement@tandooribistro.com` with `Customer@123`.
3. Highlight the clean, branded interface:
   - **Wholesale Categories**: Tap *Vegetables*, *Dairy*, or *Cooking Oils*.
   - **MOQ & Packaging**: Show how products display commercial pack sizes (e.g., 25 kg bag, 15L tin) with Minimum Order Quantity rules.
   - **Instant Search**: Type *"Paneer"* or *"Basmati"* to demonstrate real-time search.

### Step 2: Build Cart & Place B2B Order
1. Add items to cart (e.g., 10 kg Farm Fresh Tomatoes, 5 kg Malai Paneer).
2. Open Cart:
   - Point out the **MOQ validation** (users cannot place sub-wholesale quantities).
   - Point out the **GST 5% tax itemization** and **Free Delivery threshold** progress.
3. Tap **Proceed to Checkout**:
   - Select **Receiving Bay** delivery address.
   - Select **Delivery Slot** (*06:00 AM – 09:00 AM*).
   - Enter a client PO Reference (e.g. `PO-HOTEL-2026`).
   - Add Kitchen Receiving Notes (e.g., *"Ring loading bay bell on arrival"*).
4. Tap **Place Wholesale Order**:
   - Showcase instant confirmation with unique Order ID (e.g., `FS-20261025-0004`).

### Step 3: Switch to Web Admin Console (Fulfillment Experience)
1. On your laptop, open [https://freshsupply-admin.vercel.app](https://freshsupply-admin.vercel.app).
2. Sign in as `admin@freshsupply.com` with `Admin@12345`.
3. In **Orders**, show the newly placed order sitting at the top in `Pending` status.
4. Click on the order to inspect the full audit details:
   - Exact price snapshot, line items, customer GST number, delivery address, and PO reference.
5. Update status: Change `Pending` &rarr; `Confirmed` or `Dispatched` with internal notes:
   - *"Allocated to Delivery Route #3 - Morning Dispatch"*.
6. Click **Update Status**.

### Step 4: Show Live Status Sync on Mobile App
1. Switch back to the Android phone.
2. Go to the **Orders** tab or refresh the order detail.
3. Show the client the status change reflecting as **Confirmed / Dispatched** with the exact timestamp and notes.

### Step 5: Showcase Warehouse Inventory Control
1. In the Web Admin, navigate to **Inventory**.
2. Show the **Low Stock Alerts** filter.
3. Demonstrate a manual stock adjustment:
   - Select a product &rarr; Adjust quantity with reason *"Fresh Morning Restock"*.
   - Navigate to **Inventory Logs** to show the immutable audit trail with staff attribution.

---

## 4. Customer-Specific Wholesale Pricing & Credit Management Demo

This section details how to demonstrate FreshSupply's enterprise pricing hierarchy and credit period controls.

### A. The 5 Core Demonstration Customers

FreshSupply manages 120+ wholesale accounts. For live pitches, use these 5 distinct customer profiles to demonstrate negotiated prices, credit terms, and catalog control:

| Customer Name | Code | Type | Assigned Price List | Basmati Rice Rate | Credit Period | Credit Limit | Outstanding Balance | Available Credit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GreenMart Retail** | `FS-CUST-001` | Retailer | Premium Retailer | **₹1,800 / Qtl** *(Custom Override)* | Net 30 Days | ₹5,00,000 | ₹1,25,000 | **₹3,75,000** |
| **FreshHub Stores** | `FS-CUST-002` | Retail Chain | Standard Wholesale | **₹1,900 / Qtl** *(Price List)* | Net 15 Days | ₹3,00,000 | ₹45,000 | **₹2,55,000** |
| **SuperFood Retail** | `FS-CUST-003` | Supermarket | Special Contract | **₹1,850 / Qtl** *(Contract Rate)* | Net 45 Days | ₹8,00,000 | ₹1,60,000 | **₹6,40,000** |
| **EasyVegi Mart** | `FS-CUST-004` | Kirana Group | High-Frequency Daily | **₹1,780 / Qtl** *(High-Vol VIP)* | Net 7 Days | ₹1,50,000 | ₹88,000 | **₹62,000** |
| **QuickNest Retail** | `FS-CUST-005` | Modern Trade | Standard Wholesale | **₹1,920 / Qtl** *(Standard -4%)* | Net 30 Days | ₹6,00,000 | ₹2,10,000 | **₹3,90,000** |

*Standard Base Wholesale Price for Basmati Rice (Catalog Default): **₹2,000 / Quintal**.*

---

### B. Core B2B Architecture Principles to Highlight

1. **Zero Frontend Duplication**:
   - The customer app (web and Android) remains completely uniform across all 120 accounts.
   - When **GreenMart** logs in, they see Basmati Rice at **₹1,800/Qtl** and Net 30 Credit terms.
   - When **FreshHub** logs in, they see the exact same page layout, but Basmati Rice shows **₹1,900/Qtl** and Net 15 Credit terms.
   - There are no separate customer codebases or hardcoded views.

2. **Rigorous 4-Tier Pricing Resolution Hierarchy**:
   - **Tier 1 (Highest)**: Customer-Specific SKU Override (`customer_sku_prices`).
   - **Tier 2**: Customer-Specific Category Discount (`customer_category_discounts`).
   - **Tier 3**: Assigned Price List (`price_lists` via `customer_pricing_assignments`).
   - **Tier 4 (Fallback)**: Default Wholesale Catalog Price (`products.price`).

3. **Active Credit Exposure & Order Validation**:
   - Orders placed on credit check `Available Credit = Credit Limit - Outstanding Balance`.
   - If an order exceeds available credit, the order is blocked with a clear commercial prompt to settle pending invoices or switch to Advance Payment (NEFT/RTGS).
   - Once placed, credit exposure is reserved in real time; if cancelled by dispatch, credit is instantly released back to the customer's account.

---

### C. Step-by-Step Admin Demonstration Flow

1. **Navigate to Customer Pricing**:
   - In Web Admin sidebar, click **Commerce &rarr; Customer Pricing**.
   - Show the **6 KPI cards**: *Total Active Customers (120)*, *Custom Pricing Active (42)*, *Default Pricing (78)*, *Overridden SKUs (156)*, *Pending Reviews (8)*, and *Recently Updated (14)*.

2. **Filter & Search Customer Directory (Tab 1)**:
   - Search for `"GreenMart"` or filter by *"Retailer"* and *"Premium Retailer"* list.
   - Click **Configure Rates** to inspect GreenMart's SKU rates, Net 30 terms, and ₹5L credit exposure.

3. **Product-Wise Pricing Matrix (Tab 2)**:
   - Switch to **Product-Wise Matrix**.
   - Select **Basmati Rice** (or Sona Masoori, Toor Dal, Sunflower Oil).
   - Point out how an administrator can view and edit prices for all 120 customers in a single consolidated grid without opening 120 separate tabs.
   - Click **Edit** on a rate &rarr; adjust &rarr; click **Save** &rarr; explain how HMR and DB update instantly.

4. **Bulk Adjustments & Reusable Price Lists (Tabs 3 & 4)**:
   - Open **Bulk Adjustments**: Show how to schedule a **+3% inflation adjustment** across Grains & Pulses for all Standard accounts with an instant diff preview.
   - Open **Price Lists**: Show the 4 reusable standard templates (*Standard Wholesale, Premium Retailer, Restaurant & Hotel Chain, Special Contract*).

5. **Live Customer App Simulator & Verification (Tab 7)**:
   - Switch to the **Customer Simulation & Live Verification** tab.
   - Use the live customer switcher dropdown:
     - Select **GreenMart Retail**: See Basmati Rice display **₹1,800/Qtl** (-10% override) and Net 30 Credit Payment option.
     - Switch to **FreshHub Stores**: Notice the price seamlessly update to **₹1,900/Qtl** (-5% list rate) and Net 15 Credit option.
     - Switch to **Standard Wholesale**: Price reverts to base catalog wholesale **₹2,000/Qtl**.
   - Point out the **Credit Checkout Validation**: If cart exceeds available balance, credit checkout is guarded automatically.

---

## 5. Key Value Propositions to Emphasize to the Client

1. **No Overselling (Zero Kitchen Disappointment)**:
   - Explain how PostgreSQL row-level locks prevent stock race conditions when 50 chefs order at 11:00 PM simultaneously.
2. **Built for Commercial Accounting**:
   - Every invoice includes GSTIN, PO reference, subtotal, and exact tax breakdown, reducing monthly bookkeeping reconciliation from days to minutes.
3. **Optimized for Route Economics**:
   - Minimum Order Quantities and defined delivery time windows ensure delivery vehicles run with maximum route density and profitability.
4. **Negotiated Pricing at Scale**:
   - Supports 120+ unique negotiated contracts without manual spreadsheet chaos or accidental undercharging.
5. **Independent Infrastructure**:
   - The platform is deployed on dedicated cloud infrastructure (Vercel + Neon PostgreSQL) with no dependencies on third-party aggregators or marketplace commissions.
