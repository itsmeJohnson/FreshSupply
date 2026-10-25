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

## 4. Key Value Propositions to Emphasize to the Client

1. **No Overselling (Zero Kitchen Disappointment)**:
   - Explain how PostgreSQL row-level locks prevent stock race conditions when 50 chefs order at 11:00 PM simultaneously.
2. **Built for Commercial Accounting**:
   - Every invoice includes GSTIN, PO reference, subtotal, and exact tax breakdown, reducing monthly bookkeeping reconciliation from days to minutes.
3. **Optimized for Route Economics**:
   - Minimum Order Quantities and defined delivery time windows ensure delivery vehicles run with maximum route density and profitability.
4. **Independent Infrastructure**:
   - The platform is deployed on dedicated cloud infrastructure (Vercel + Neon PostgreSQL) with no dependencies on third-party aggregators or marketplace commissions.
