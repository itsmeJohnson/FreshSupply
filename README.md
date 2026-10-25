# FreshSupply — B2B Wholesale Ordering Platform

FreshSupply is a production-grade B2B wholesale ordering platform built for restaurants, cafés, hotels, caterers, and institutional kitchens (modeled on the workflow of Hyperpure).

---

## Deliverables Summary

| Component | Technology Stack | Status | Documentation |
| :--- | :--- | :---: | :--- |
| **Native Android App** | Kotlin, Jetpack Compose, Material 3, MVVM, Room, Flow, Retrofit | **Ready / Built** | [Architecture](docs/ARCHITECTURE.md) |
| **Web Admin Console** | React, TypeScript, Centralized Tokens, Responsive SPA | **Ready / Built** | [Admin Guide](docs/ADMIN_GUIDE.md) |
| **Shared Backend API** | Node.js, Express, TypeScript, PostgreSQL (ACID Transactions) | **Ready / Live** | [API Reference](docs/API_REFERENCE.md) |
| **Database & Schema** | PostgreSQL 14+, Row Locking, Immutability Snapshots, Audits | **Migrated & Seeded** | [Schema Spec](docs/DATABASE_SCHEMA.md) |
| **Deployment Docs** | Self-hosted Linux Ubuntu, Nginx, Certbot SSL, Backups | **Ready** | [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) |

---

## Brand Theme & Design System

- **Primary Green**: `#16845B`
- **Dark Green**: `#116747`
- **Light Green**: `#E1F2E8`
- **Soft Mint**: `#F0F7F2`
- **Main Background**: `#F7F8FA`
- **Card Background**: `#FFFFFF`
- **Main Text**: `#202B27`
- **Secondary Text**: `#66736B`
- **Borders**: `#DCE4DE`
- **Error / Destructive**: `#C62828`
- **Warning / Pending**: `#B7791F`

---

## 9 Mandatory Wholesale Categories

1. **Vegetables** (Nashik Red Onions, Jyoti Potatoes, Hybrid Tomatoes, Garlic, Ginger)
2. **Fruits** (Seedless Lemons, Robusta Cooking Bananas)
3. **Dairy** (Malai Paneer Blocks, Table Butter, Mozzarella/Cheddar Blend)
4. **Rice and grains** (Aged 1121 Basmati Rice, Sona Masoori, Toor Dal)
5. **Spices** (Guntur Stemless Red Chillies, Shahi Garam Masala Blend)
6. **Cooking oils** (Refined Sunflower Oil 15L Tins, Cold Pressed Mustard Oil)
7. **Meat and poultry** (Curry-Cut Chilled Chicken, Farm Fresh Brown Eggs)
8. **Frozen foods** (Export Grade French Fries, IQF Sweet Green Peas)
9. **Packaging supplies** (3-Compartment Meal Trays, Virgin Kraft Paper Bags)

---

## Quickstart Instructions

### 1. Start Shared Backend API
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
# Server running at http://localhost:5001
# Health check: http://localhost:5001/health
```

### 2. Launch Web Admin Console
```bash
cd admin-web
npm install
npm run dev
# Admin Console running at http://localhost:3000
```

### 3. Open or Build Android Application
```bash
cd android
./gradlew assembleDebug
# Debug APK generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Demo Credentials

### Web Admin Console
- **Administrator**: `admin@freshsupply.com` / `Admin@12345`
- **Operations Lead**: `ops@freshsupply.com` / `Ops@12345`

### Android Customer App
- **The Tandoori Bistro & Grills**: `procurement@tandooribistro.com` / `Customer@123`
- **Urban Brew Artisan Café**: `kitchen@urbanbrewcafe.com` / `Customer@123`
- **Royal Heritage Suites**: `purchase@royalheritagehotel.com` / `Customer@123`
