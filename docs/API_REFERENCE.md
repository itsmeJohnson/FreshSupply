# FreshSupply — Authoritative API Reference

Base URL (Local Development): `http://localhost:5001/api`  
Base URL (Android Emulator): `http://10.0.2.2:5001/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/customer/register`
Register a new restaurant / business buyer account.
- **Body**:
  ```json
  {
    "email": "procurement@restaurant.com",
    "password": "SecurePassword123",
    "businessName": "The Tandoori Bistro & Grills",
    "contactPerson": "Chef Vikram Sen",
    "phone": "+91 98450 12345",
    "gstNumber": "29AABCU9603R1ZM"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Business registered successfully",
    "data": {
      "token": "JWT_TOKEN_STRING",
      "customer": { "id": 1, "business_name": "...", "email": "..." }
    }
  }
  ```

### `POST /api/auth/customer/login`
Customer login.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response `200 OK`**: `{ "success": true, "data": { "token": "...", "customer": { ... } } }`

### `GET /api/auth/customer/me`
Retrieve authenticated customer profile and delivery docks.
- **Headers**: `Authorization: Bearer <TOKEN>`

### `POST /api/auth/staff/login`
Staff / Admin portal sign in.
- **Body**: `{ "email": "admin@freshsupply.com", "password": "..." }`
- **Response `200 OK`**: `{ "success": true, "data": { "token": "...", "user": { "role": "admin" } } }`

---

## 2. Product Catalogue Endpoints (`/api/products`)

### `GET /api/products`
Query wholesale products with filtering, search, and pagination.
- **Query Parameters**:
  - `category` *(optional)*: Category slug (e.g. `vegetables`) or category ID
  - `search` *(optional)*: Keyword matching name, SKU or description
  - `featured` *(optional)*: `true` to return homepage featured items
  - `sort` *(optional)*: `price_asc`, `price_desc`, `name_asc`, `stock_desc`
  - `activeOnly` *(optional)*: `true` (default for customers), `false` (for staff)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "sku": "VEG-ONI-050",
        "name": "Nashik Red Onions (Medium-Large Grade)",
        "unit": "Bag (50 kg)",
        "pack_size": "50 kg Bag",
        "min_order_qty": 1,
        "price": "1650.00",
        "stock_quantity": 120,
        "category_name": "Vegetables"
      }
    ]
  }
  ```

### `POST /api/products` *(Staff Only)*
Create a new commercial SKU with stock tracking.

### `PUT /api/products/:id` *(Staff Only)*
Update product details, unit price, MOQ, or pack description.

### `PATCH /api/products/:id/toggle-active` *(Staff Only)*
Toggle product visibility and purchasing availability.

### `GET /api/products/export/csv` *(Staff Only)*
Download the authoritative catalog as a formatted CSV spreadsheet.

---

## 3. Shopping Cart Endpoints (`/api/cart`)

### `GET /api/cart`
Retrieve customer cart with stock availability, MOQ check, and server calculation.
- **Headers**: `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "productId": 1,
          "name": "Nashik Red Onions",
          "quantity": 2,
          "price": 1650.00,
          "lineTotal": 3300.00,
          "hasStock": true,
          "meetsMoq": true
        }
      ],
      "summary": {
        "itemCount": 1,
        "subtotal": 3300.00,
        "taxAmount": 165.00,
        "deliveryCharge": 250.00,
        "totalAmount": 3715.00,
        "freeDeliveryThreshold": 5000.00
      }
    }
  }
  ```

### `POST /api/cart/items`
Add or update quantity for a product.
- **Body**: `{ "productId": 1, "quantity": 3 }`

---

## 4. Order Placement & Fulfillment Endpoints (`/api/orders`)

### `POST /api/orders`
Submit order with transactional inventory reservation and snapshotting.
- **Body**:
  ```json
  {
    "deliveryAddressId": 1,
    "deliveryDate": "2026-10-26",
    "deliverySlot": "Early Morning (05:00 AM - 08:00 AM)",
    "poReference": "PO-TB-8890",
    "notes": "Gate receiving code 4490",
    "items": [
      { "productId": 1, "quantity": 3 },
      { "productId": 7, "quantity": 2 }
    ]
  }
  ```

### `GET /api/orders`
Customer orders list.

### `GET /api/orders/:id`
Customer single order detail with line items snapshot and live status history.

### `POST /api/orders/:id/cancel`
Cancel pending order and return inventory back to available stock.

### `GET /api/orders/admin/all` *(Staff Only)*
Administrative order management list with status and date filters.

### `PATCH /api/orders/admin/:id/status` *(Staff Only)*
Advance order along fulfillment pipeline:
- `pending` &rarr; `confirmed` &rarr; `processing` &rarr; `dispatched` &rarr; `delivered`
- Or `cancelled` with `cancellationReason`

---

## 5. Warehouse Inventory Endpoints (`/api/inventory`)

### `GET /api/inventory` *(Staff Only)*
Warehouse stock overview, low-stock warnings, and inventory valuation.

### `GET /api/inventory/logs` *(Staff Only)*
Audit movements log (order decrements, intake shipments, write-offs).

### `POST /api/inventory/adjust` *(Staff Only)*
Record physical inventory count or incoming bulk purchase.
- **Body**:
  ```json
  {
    "productId": 1,
    "newQuantity": 150,
    "reason": "purchase_inward",
    "notes": "Truck shipment arrival from APMC Mandi"
  }
  ```
