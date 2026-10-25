# FreshSupply — Administrator & Operations Manual

This guide provides instructions for procurement managers, warehouse dispatch supervisors, and system administrators running FreshSupply.

---

## 1. Access Credentials

- **Admin Web Console URL**: `http://localhost:3000` (Production: `https://admin.freshsupply.yourdomain.com`)
- **Default Superadmin**:
  - Email: `admin@freshsupply.com`
  - Password: `Admin@12345`
- **Default Operations / Dispatch Lead**:
  - Email: `ops@freshsupply.com`
  - Password: `Ops@12345`

---

## 2. Order Lifecycle Management

Orders transition through five standard progressive states:

```
[Pending] ──> [Confirmed] ──> [Processing] ──> [Dispatched] ──> [Delivered]
    │               │
    └───> [Cancelled] (Reserved stock returned to warehouse inventory)
```

1. **Pending**: New order submitted by restaurant buyer. Verify customer line items, MOQ conformity, and delivery slot.
2. **Confirmed**: Commercial terms approved. Inventory is reserved.
3. **Processing**: Warehouse pack station is palletizing crates, bags, and dry goods in staging area.
4. **Dispatched**: Loaded onto temperature-controlled delivery van route. Driver manifests signed.
5. **Delivered**: Handover completed at restaurant goods receiving dock. Order closed.
6. **Cancelled**: If an order is cancelled, a cancellation reason must be recorded. Reserved inventory is automatically returned to the warehouse stock pool with an audit trail entry.

---

## 3. Warehouse Inventory Control & Stock Inwarding

- **Real-time Stock**: Visible under the **Inventory** tab.
- **Low Stock Threshold**: Automatically flagged when available units drop below **30**.
- **Recording Inward Shipments**:
  1. Navigate to **Inventory**.
  2. Click **Adjust Stock** on the arrived SKU.
  3. Enter the new physical balance.
  4. Select Reason: `Wholesale Inward Shipment / Delivery Received`.
  5. Enter Vendor Invoice or Mandi Lot number in **Notes**.
  6. Click **Confirm Stock Update**.

---

## 4. Product Catalog Updates

- **Adding a SKU**: Click **Add Wholesale Product** on the Products page.
  - Required fields: Unique SKU, Product Name, Category, Wholesale Unit, Pack Size, Minimum Order Quantity (MOQ), and Selling Price.
- **Deactivating an Item**: Click the eye toggle icon. Deactivated products are immediately hidden from customer search results and cannot be checked out.
- **Catalogue CSV Export**: Click **Export CSV** to download the catalog for bulk spreadsheet review.

---

## 5. Staff Accounts & Permissions

- **Administrator**: Full system access including creating new staff members, toggling account access, and promoting staff to admin.
- **Operations Staff**: Can view orders, adjust statuses, inspect customer profiles, and record inventory movements. Cannot modify system roles or delete staff accounts.
