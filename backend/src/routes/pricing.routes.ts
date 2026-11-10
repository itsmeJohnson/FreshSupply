import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireStaff, requireCustomer, AuthenticatedRequest } from '../middleware/auth';
import { PricingService } from '../services/pricingService';
import { CreditService } from '../services/creditService';

const router = Router();

// Sample in-memory fallback customer catalog when DB is unpopulated or offline
export const fallbackCustomersPricing = [
  {
    id: 1,
    customerIdFormatted: 'FS-CUST-001',
    businessName: 'GreenMart Retail (8 Outlets)',
    customerType: 'Retailer',
    assignedPriceList: 'Premium Retailer Pricing',
    priceListId: 1,
    creditPeriod: '30 Days',
    creditPeriodDays: 30,
    creditLimit: 500000,
    outstandingAmount: 125000,
    availableCredit: 375000,
    pricingStatus: 'Active',
    lastUpdated: 'Today, 10:15 AM',
    customSkusCount: 18,
    contactPerson: 'Karthik Rao',
    phone: '+91 98450 11200',
    email: 'procurement@greenmart.in',
    gstin: '29ABCDE1234F1Z5',
    deliveryZone: 'Bangalore East & Whitefield',
    paymentTerms: 'Net 30',
  },
  {
    id: 2,
    customerIdFormatted: 'FS-CUST-002',
    businessName: 'FreshHub Hypermarket Stores',
    customerType: 'Distributor',
    assignedPriceList: 'Standard Wholesale Pricing',
    priceListId: 2,
    creditPeriod: '15 Days',
    creditPeriodDays: 15,
    creditLimit: 300000,
    outstandingAmount: 45000,
    availableCredit: 255000,
    pricingStatus: 'Active',
    lastUpdated: 'Yesterday, 04:30 PM',
    customSkusCount: 8,
    contactPerson: 'Sanjay Gupta',
    phone: '+91 97410 33400',
    email: 'orders@freshhubstores.com',
    gstin: '29BCDEF2345G2Z6',
    deliveryZone: 'Bangalore North Hub',
    paymentTerms: 'Net 15',
  },
  {
    id: 3,
    customerIdFormatted: 'FS-CUST-003',
    businessName: 'SuperFood Retail Chain',
    customerType: 'Hotel & Restaurant',
    assignedPriceList: 'Restaurant & Hotel Pricing',
    priceListId: 3,
    creditPeriod: '45 Days',
    creditPeriodDays: 45,
    creditLimit: 800000,
    outstandingAmount: 160000,
    availableCredit: 640000,
    pricingStatus: 'Active',
    lastUpdated: 'Oct 08, 2026',
    customSkusCount: 24,
    contactPerson: 'Chef Anand Varma',
    phone: '+91 94480 55600',
    email: 'kitchen@superfoodgroup.com',
    gstin: '29CDEFG3456H3Z7',
    deliveryZone: 'Central Business District (CBD)',
    paymentTerms: 'Net 45',
  },
  {
    id: 4,
    customerIdFormatted: 'FS-CUST-004',
    businessName: 'EasyVegi Mart Network',
    customerType: 'Retailer',
    assignedPriceList: 'Standard Wholesale Pricing',
    priceListId: 2,
    creditPeriod: '7 Days',
    creditPeriodDays: 7,
    creditLimit: 150000,
    outstandingAmount: 88000,
    availableCredit: 62000,
    pricingStatus: 'Active',
    lastUpdated: 'Oct 04, 2026',
    customSkusCount: 4,
    contactPerson: 'Naveen Kumar',
    phone: '+91 96320 77800',
    email: 'naveen@easyvegi.in',
    gstin: '29DEFGH4567I4Z8',
    deliveryZone: 'Peenya & Jalahalli Industrial Area',
    paymentTerms: 'Net 7',
  },
  {
    id: 5,
    customerIdFormatted: 'FS-CUST-005',
    businessName: 'QuickNest Express Marts',
    customerType: 'Cloud Kitchen / Q-Commerce',
    assignedPriceList: 'Special Contract Pricing',
    priceListId: 4,
    creditPeriod: '30 Days',
    creditPeriodDays: 30,
    creditLimit: 600000,
    outstandingAmount: 210000,
    availableCredit: 390000,
    pricingStatus: 'Active',
    lastUpdated: 'Oct 02, 2026',
    customSkusCount: 31,
    contactPerson: 'Pooja Hegde',
    phone: '+91 98440 99100',
    email: 'darkstores@quicknest.co',
    gstin: '29EFGHI5678J5Z9',
    deliveryZone: 'Koramangala & HSR Cluster',
    paymentTerms: 'Net 30',
  },
];

// Sample standard grocery SKUs with multi-customer pricing for demo and testing
export const sampleGrocerySkusPricing = [
  {
    id: 101,
    sku: 'GRP-RIC-1121',
    name: 'Aged 1121 Royal Basmati Rice (XXL)',
    category: 'Rice & Grains',
    unit: 'Quintal',
    standardPrice: 2000,
    packSize: '50 kg Bag x 2',
    customerPrices: {
      1: 1800, // GreenMart: 1800
      2: 1900, // FreshHub: 1900
      3: 1850, // SuperFood: 1850
      4: 1780, // EasyVegi: 1780
      5: 1920, // QuickNest: 1920
    },
  },
  {
    id: 102,
    sku: 'GRP-SON-050',
    name: 'Sona Masoori Raw Rice (A-Grade)',
    category: 'Rice & Grains',
    unit: 'Quintal',
    standardPrice: 1850,
    packSize: '50 kg Bag x 2',
    customerPrices: {
      1: 1750,
      2: 1800,
      3: 1760,
      4: 1720,
      5: 1790,
    },
  },
  {
    id: 103,
    sku: 'PUL-TOO-050',
    name: 'Desi Fatka Unpolished Toor Dal',
    category: 'Pulses & Dals',
    unit: 'Quintal',
    standardPrice: 11000,
    packSize: '50 kg Sack x 2',
    customerPrices: {
      1: 10500,
      2: 10800,
      3: 10400,
      4: 10600,
      5: 10750,
    },
  },
  {
    id: 104,
    sku: 'SUG-M30-050',
    name: 'Refined Sparkling Sugar (M-30)',
    category: 'Sugar, Salt & Sweeteners',
    unit: 'Quintal',
    standardPrice: 4300,
    packSize: '50 kg Bag x 2',
    customerPrices: {
      1: 4200,
      2: 4250,
      3: 4180,
      4: 4150,
      5: 4220,
    },
  },
  {
    id: 105,
    sku: 'OIL-SUN-015',
    name: 'Refined Sunflower Oil (Tin)',
    category: 'Cooking Oils & Ghee',
    unit: '15 Litre',
    standardPrice: 1750,
    packSize: '15L Sealed Metal Tin',
    customerPrices: {
      1: 1650,
      2: 1700,
      3: 1640,
      4: 1680,
      5: 1670,
    },
  },
  {
    id: 106,
    sku: 'GRP-WHT-050',
    name: 'MP Sharbati Premium Whole Wheat',
    category: 'Rice & Grains',
    unit: 'Quintal',
    standardPrice: 2800,
    packSize: '50 kg Bag x 2',
    customerPrices: {
      1: 2750,
      2: 2780,
      3: 2720,
      4: 2740,
      5: 2760,
    },
  },
];

// Reusable Price Lists
export const reusablePriceListsSeed = [
  { id: 1, name: 'Premium Retailer Pricing', description: 'Tiered wholesale discounts for high-frequency retail supermarket chains (6-12% margin)', customerCount: 42, isDefault: false, updatedAt: 'Today' },
  { id: 2, name: 'Standard Wholesale Pricing', description: 'Default baseline wholesale price list for walk-in and standard B2B buyers', customerCount: 48, isDefault: true, updatedAt: 'Oct 01, 2026' },
  { id: 3, name: 'Restaurant & Hotel Pricing', description: 'Custom packed bulk staples for commercial hospitality kitchens (HORECA)', customerCount: 19, isDefault: false, updatedAt: 'Oct 04, 2026' },
  { id: 4, name: 'Special Contract Pricing', description: 'Locked annual contract rates for high-tonnage dark stores and distributors', customerCount: 11, isDefault: false, updatedAt: 'Sep 28, 2026' },
];

/**
 * 1. Overview KPIs
 */
router.get('/stats', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      totalActiveCustomers: 120,
      customersWithCustomPricing: 42,
      customersUsingDefaultPricing: 78,
      productsWithCustomerSpecificRates: 34,
      pendingPricingConfigurations: 5,
      recentlyUpdatedPriceLists: 8,
    },
  });
});

/**
 * 2. Searchable, filterable customer list
 */
router.get('/customers', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const { search, customerType, priceListId, creditStatus } = req.query;

  let list = [...fallbackCustomersPricing];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((c) =>
      c.businessName.toLowerCase().includes(q) ||
      c.customerIdFormatted.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q)
    );
  }

  if (customerType && customerType !== 'All') {
    list = list.filter((c) => c.customerType.toLowerCase().includes((customerType as string).toLowerCase()));
  }

  if (priceListId && priceListId !== 'All') {
    list = list.filter((c) => c.priceListId === parseInt(priceListId as string, 10));
  }

  res.json({
    success: true,
    data: list,
    meta: { total: list.length },
  });
});

/**
 * 3. Individual customer pricing configuration
 */
router.get('/customers/:id', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const customerId = parseInt(req.params.id, 10);
  const customer = fallbackCustomersPricing.find((c) => c.id === customerId) || fallbackCustomersPricing[0];

  // Return every grocery SKU with customer-specific pricing
  const products = sampleGrocerySkusPricing.map((p) => {
    const customRate = (p.customerPrices as any)[customer.id] || p.standardPrice;
    const discount = p.standardPrice > 0 ? ((p.standardPrice - customRate) / p.standardPrice) * 100 : 0;
    const isOverride = customRate !== p.standardPrice;

    return {
      productId: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      unit: p.unit,
      packSize: p.packSize,
      standardPrice: p.standardPrice,
      customerPrice: customRate,
      discountPercentage: parseFloat(discount.toFixed(2)),
      source: isOverride ? 'CUSTOMER_SKU_OVERRIDE' : 'ASSIGNED_PRICE_LIST',
      minOrderQty: 1,
      enabledForCustomer: true,
      effectiveDates: 'Oct 01, 2026 – Sep 30, 2027',
      lastUpdated: 'By Admin on Oct 04, 2026',
    };
  });

  res.json({
    success: true,
    data: {
      customer,
      products,
      credit: {
        creditEnabled: true,
        creditLimit: customer.creditLimit,
        creditPeriodDays: customer.creditPeriodDays,
        paymentTerms: customer.paymentTerms,
        outstandingBalance: customer.outstandingAmount,
        availableCredit: customer.availableCredit,
        status: 'good_standing',
      },
      delivery: {
        deliveryZone: customer.deliveryZone,
        preferredDays: 'Mon, Wed, Fri',
        preferredTimeSlot: 'Early Morning (05:00 AM - 08:00 AM)',
        transportChargeType: 'free',
        minOrderValue: 10000,
        specialInstructions: 'Reefer truck required for dairy and fresh produce docks',
      },
    },
  });
});

/**
 * 4. Product-Wise Pricing Matrix (Option B)
 */
router.get('/product-matrix/:productId', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const productId = parseInt(req.params.productId, 10);
  const skuItem = sampleGrocerySkusPricing.find((p) => p.id === productId) || sampleGrocerySkusPricing[0];

  const customerRows = fallbackCustomersPricing.map((c) => ({
    customerId: c.id,
    customerIdFormatted: c.customerIdFormatted,
    businessName: c.businessName,
    customerType: c.customerType,
    assignedPriceList: c.assignedPriceList,
    standardPrice: skuItem.standardPrice,
    unit: skuItem.unit,
    customerPrice: (skuItem.customerPrices as any)[c.id] || skuItem.standardPrice,
    discountPercentage: ((skuItem.standardPrice - ((skuItem.customerPrices as any)[c.id] || skuItem.standardPrice)) / skuItem.standardPrice) * 100,
  }));

  res.json({
    success: true,
    data: {
      product: skuItem,
      matrix: customerRows,
    },
  });
});

/**
 * 5. Reusable Price Lists
 */
router.get('/price-lists', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: reusablePriceListsSeed,
  });
});

/**
 * 6. Audit Trail Logs
 */
router.get('/audit-logs', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 1, customerName: 'GreenMart Retail', sku: 'GRP-RIC-1121', productName: 'Aged 1121 Royal Basmati Rice', previousPrice: '₹1,850', newPrice: '₹1,800', changeType: 'SKU_OVERRIDE', reason: 'High-volume contract expansion (150 MT/month)', updatedBy: 'Johnson (Admin)', timestamp: 'Today, 10:15 AM' },
      { id: 2, customerName: 'SuperFood Retail Chain', sku: 'PUL-TOO-050', productName: 'Desi Fatka Toor Dal', previousPrice: '₹10,800', newPrice: '₹10,400', changeType: 'SKU_OVERRIDE', reason: 'Market mandi price rationalization', updatedBy: 'Johnson (Admin)', timestamp: 'Yesterday, 03:20 PM' },
      { id: 3, customerName: 'QuickNest Express Marts', sku: 'OIL-SUN-015', productName: 'Sunflower Oil 15L', previousPrice: '₹1,720', newPrice: '₹1,670', changeType: 'SKU_OVERRIDE', reason: 'Dedicated supply agreement', updatedBy: 'Rahul Verma (Manager)', timestamp: 'Oct 03, 2026' },
      { id: 4, customerName: 'EasyVegi Mart Network', sku: 'GRP-SON-050', productName: 'Sona Masoori Rice', previousPrice: '₹1,750', newPrice: '₹1,720', changeType: 'BULK_CATEGORY_ADJUSTMENT', reason: 'Promotional festival seasonal rebate', updatedBy: 'Johnson (Admin)', timestamp: 'Oct 02, 2026' },
    ],
  });
});

export default router;

