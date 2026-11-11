# FreshSupply B2B Android APK Builds

This directory contains the ready-to-test Android Application Packages (APKs) for the **FreshSupply B2B Wholesale Grocery Management Platform**.

---

## 📦 Available APK Builds

| Build Variant | File Name | Size | Target Environment | Default API Base URL |
| :--- | :--- | :--- | :--- | :--- |
| **Debug Build** | [`FreshSupply-debug.apk`](./FreshSupply-debug.apk) | ~18 MB | Local Testing & Emulator | `http://10.0.2.2:5001/api/` (Android Emulator Loopback) |
| **Release Build** | [`FreshSupply-release.apk`](./FreshSupply-release.apk) | ~12 MB | Production Demo / Physical Device | `https://freshsupply-backend.vercel.app/api/` (Live Vercel Cloud Backend) |

> **Note:** Both builds are signed with Android standard signing certificates, allowing direct installation on any Android phone (Android 8.0 Oreo / API 26 through Android 15 / API 35) without needing custom keys.

---

## 🚀 How to Install and Run

### Option 1: Install via ADB (Command Line)
If you have an Android device or emulator connected to your Mac:

```bash
# Verify connected device
adb devices

# Install Debug APK
adb install -r apks/FreshSupply-debug.apk

# OR Install Release APK (Recommended for physical devices)
adb install -r apks/FreshSupply-release.apk

# Launch App
adb shell am start -n com.freshsupply.app/.MainActivity
```

### Option 2: Direct Install on Android Phone
1. Transfer `FreshSupply-release.apk` to your phone via USB, Google Drive, WhatsApp, or AirDrop.
2. Tap the APK on your device and select **Install**.
3. If prompted, toggle **"Allow installation from this source"**.
4. Open **FreshSupply**.

### Option 3: Launch in Android Studio
1. Open Android Studio.
2. Open project: `/Users/apple/Workspace/GroceryDemo/android`
3. Click the green **Run (▶)** button to launch on your active emulator or connected device.

---

## 🔑 Demo Account Credentials

Use these verified commercial wholesale buyer credentials to sign in:

| Account Type | Business Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Restaurant Partner 1** | The Tandoori Bistro & Grills | `procurement@tandooribistro.com` | `Customer@123` |
| **Café Partner 2** | Urban Brew Artisan Café | `kitchen@urbanbrewcafe.com` | `Customer@123` |
| **Hotel Partner 3** | Royal Heritage Suites & Banquets | `purchase@royalheritagehotel.com` | `Customer@123` |

*(Quick-tap demo buttons for "Tandoori Bistro" and "Urban Brew" are also available on the app's login screen for 1-tap sign-in).*

---

## 📱 Features Included in the APK
- **Wholesale Produce Catalog:** Multi-category browsing (Vegetables, Grains & Staples, Pulses & Dals, Cooking Oils) with real-time stock levels.
- **Dual Commercial Pricing:** High-contrast display showing both Price/Quintal (₹) and Price/Kg (₹).
- **Tiered Volume Slabs:** Dynamic quantity steppers with volume discounts (Bags vs Crates).
- **Credit Line Checkout:** Net-30 / Net-15 commercial payment terms with delivery slot selection.
- **Real-Time Order Tracking:** Active dispatch status tracking from cold storage hubs to receiving bays.
