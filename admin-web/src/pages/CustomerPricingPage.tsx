import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  Search,
  Filter,
  Plus,
  Edit3,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  Layers,
  ArrowRight,
  TrendingDown,
  Building2,
  Package,
  ShieldCheck,
  CreditCard,
  Truck,
  History,
  X,
  Eye,
  Check,
  Percent,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Sliders,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';

// Initial Customer Pricing Directory Seed Data
interface CustomerPricingRecord {
  id: number;
  customerIdFormatted: string;
  businessName: string;
  customerType: 'Retailer' | 'Distributor' | 'Hotel & Restaurant' | 'Cloud Kitchen / Q-Commerce';
  assignedPriceList: string;
  priceListId: number;
  creditPeriod: string;
  creditPeriodDays: number;
  creditLimit: number;
  outstandingAmount: number;
  availableCredit: number;
  pricingStatus: 'Active' | 'Pending';
  lastUpdated: string;
  customSkusCount: number;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  deliveryZone: string;
  paymentTerms: string;
  creditEnabled: boolean;
  creditStatus: 'good_standing' | 'restricted' | 'suspended';
}

interface SkuPricingEntry {
  productId: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  packSize: string;
  standardPrice: number;
  customerPrice: number;
  discountPercentage: number;
  source: 'CUSTOMER_SKU_OVERRIDE' | 'ASSIGNED_PRICE_LIST' | 'DEFAULT_WHOLESALE';
  minOrderQty: number;
  enabledForCustomer: boolean;
  effectiveDates: string;
}

const initialCustomers: CustomerPricingRecord[] = [
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
    deliveryZone: 'Bangalore East & Whitefield Hub',
    paymentTerms: 'Net 30',
    creditEnabled: true,
    creditStatus: 'good_standing',
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
    creditEnabled: true,
    creditStatus: 'good_standing',
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
    creditEnabled: true,
    creditStatus: 'good_standing',
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
    creditEnabled: true,
    creditStatus: 'good_standing',
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
    creditEnabled: true,
    creditStatus: 'good_standing',
  },
];

// 6 Core Grocery SKUs for Product-Wise Pricing Matrix
const matrixSkus = [
  { id: 101, sku: 'GRP-RIC-1121', name: 'Aged 1121 Royal Basmati Rice', category: 'Rice & Grains', unit: 'Quintal', standardPrice: 2000 },
  { id: 102, sku: 'GRP-SON-050', name: 'Sona Masoori Raw Rice (A-Grade)', category: 'Rice & Grains', unit: 'Quintal', standardPrice: 1850 },
  { id: 103, sku: 'PUL-TOO-050', name: 'Desi Fatka Unpolished Toor Dal', category: 'Pulses & Dals', unit: 'Quintal', standardPrice: 11000 },
  { id: 104, sku: 'SUG-M30-050', name: 'Refined Sparkling Sugar (M-30)', category: 'Sugar, Salt & Sweeteners', unit: 'Quintal', standardPrice: 4300 },
  { id: 105, sku: 'OIL-SUN-015', name: 'Refined Sunflower Cooking Oil', category: 'Cooking Oils & Ghee', unit: '15 Litre', standardPrice: 1750 },
  { id: 106, sku: 'GRP-WHT-050', name: 'MP Sharbati Premium Whole Wheat', category: 'Rice & Grains', unit: 'Quintal', standardPrice: 2800 },
];

export const CustomerPricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'matrix' | 'bulk' | 'price_lists' | 'csv' | 'audit' | 'simulation'>('directory');
  
  // Customer Directory State
  const [customers, setCustomers] = useState<CustomerPricingRecord[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceListFilter, setPriceListFilter] = useState('All');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);

  // Individual Customer Profile Modal (7 Tabs)
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileCustomer, setProfileCustomer] = useState<CustomerPricingRecord | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'pricing' | 'credit' | 'orders' | 'invoices' | 'delivery' | 'history'>('pricing');

  // Customer SKU Prices for selected profile
  const [customerSkus, setCustomerSkus] = useState<SkuPricingEntry[]>([
    { productId: 101, sku: 'GRP-RIC-1121', name: 'Aged 1121 Royal Basmati Rice (XXL Grain)', category: 'Rice & Grains', unit: 'Quintal', packSize: '50 kg Bag x 2', standardPrice: 2000, customerPrice: 1800, discountPercentage: 10.0, source: 'CUSTOMER_SKU_OVERRIDE', minOrderQty: 2, enabledForCustomer: true, effectiveDates: 'Oct 01, 2026 – Sep 30, 2027' },
    { productId: 102, sku: 'GRP-SON-050', name: 'Sona Masoori Raw Rice (A-Grade)', category: 'Rice & Grains', unit: 'Quintal', packSize: '50 kg Bag x 2', standardPrice: 1850, customerPrice: 1750, discountPercentage: 5.4, source: 'CUSTOMER_SKU_OVERRIDE', minOrderQty: 2, enabledForCustomer: true, effectiveDates: 'Oct 01, 2026 – Sep 30, 2027' },
    { productId: 103, sku: 'PUL-TOO-050', name: 'Desi Fatka Unpolished Toor Dal', category: 'Pulses & Dals', unit: 'Quintal', packSize: '50 kg Sack x 2', standardPrice: 11000, customerPrice: 10500, discountPercentage: 4.5, source: 'CUSTOMER_SKU_OVERRIDE', minOrderQty: 1, enabledForCustomer: true, effectiveDates: 'Oct 01, 2026 – Dec 31, 2026' },
    { productId: 104, sku: 'SUG-M30-050', name: 'Refined Sparkling White Sugar (M-30)', category: 'Sugar, Salt & Sweeteners', unit: 'Quintal', packSize: '50 kg Bag x 2', standardPrice: 4300, customerPrice: 4200, discountPercentage: 2.3, source: 'CUSTOMER_SKU_OVERRIDE', minOrderQty: 5, enabledForCustomer: true, effectiveDates: 'Oct 01, 2026 – Sep 30, 2027' },
    { productId: 105, sku: 'OIL-SUN-015', name: 'Refined Sunflower Cooking Oil', category: 'Cooking Oils & Ghee', unit: '15 Litre', packSize: '15L Sealed Metal Tin', standardPrice: 1750, customerPrice: 1650, discountPercentage: 5.7, source: 'CUSTOMER_SKU_OVERRIDE', minOrderQty: 5, enabledForCustomer: true, effectiveDates: 'Oct 01, 2026 – Mar 31, 2027' },
    { productId: 106, sku: 'GRP-WHT-050', name: 'MP Sharbati Premium Whole Wheat', category: 'Rice & Grains', unit: 'Quintal', packSize: '50 kg Bag x 2', standardPrice: 2800, customerPrice: 2750, discountPercentage: 1.8, source: 'CUSTOMER_SKU_OVERRIDE', minOrderQty: 2, enabledForCustomer: true, effectiveDates: 'Oct 01, 2026 – Sep 30, 2027' },
    { productId: 107, sku: 'VEG-TOM-025', name: 'Hybrid Salad Tomatoes (Crimson Grade)', category: 'Fruits & Vegetables', unit: 'Crate (25 kg)', packSize: '25 kg Uniform Crate', standardPrice: 750, customerPrice: 700, discountPercentage: 6.7, source: 'ASSIGNED_PRICE_LIST', minOrderQty: 4, enabledForCustomer: true, effectiveDates: 'Active (Assigned Price List)' },
    { productId: 108, sku: 'VEG-ONI-050', name: 'Nashik Red Sautéing Onions', category: 'Fruits & Vegetables', unit: 'Bag (50 kg)', packSize: '50 kg Jute Bag', standardPrice: 1650, customerPrice: 1550, discountPercentage: 6.1, source: 'ASSIGNED_PRICE_LIST', minOrderQty: 2, enabledForCustomer: true, effectiveDates: 'Active (Assigned Price List)' },
  ]);

  // Edit Single SKU Price Modal
  const [editSkuModalOpen, setEditSkuModalOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<SkuPricingEntry | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState<number>(0);
  const [minQtyInput, setMinQtyInput] = useState<number>(1);
  const [reasonInput, setReasonInput] = useState<string>('');

  // Product Matrix State (Option B)
  const [matrixProductId, setMatrixProductId] = useState<number>(101);
  const [matrixCustomerRates, setMatrixCustomerRates] = useState<Record<number, number>>({
    1: 1800, // GreenMart: 1800
    2: 1900, // FreshHub: 1900
    3: 1850, // SuperFood: 1850
    4: 1780, // EasyVegi: 1780
    5: 1920, // QuickNest: 1920
  });

  // Bulk Adjust State (Option C)
  const [bulkAdjustmentPercent, setBulkAdjustmentPercent] = useState<number>(3.0);
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>('All');
  const [bulkPriceListTarget, setBulkPriceListTarget] = useState<string>('All');
  const [bulkReason, setBulkReason] = useState<string>('Q4 Inflation & Transport Indexing');

  // Customer Onboarding Wizard (Section 6)
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState<number>(1);
  const [onboardForm, setOnboardForm] = useState({
    businessName: '',
    customerType: 'Retailer',
    gstin: '',
    pan: '',
    contactPerson: '',
    phone: '',
    email: '',
    billingAddress: '',
    assignedPriceList: 'Premium Retailer Pricing',
    creditPeriod: 30,
    creditLimit: 500000,
    paymentTerms: 'Net 30',
    deliveryZone: 'Bangalore East Hub',
    preferredDays: 'Mon, Wed, Fri',
    timeSlot: 'Early Morning (05:00 AM - 08:00 AM)',
    transportCharges: 'free',
  });

  // Simulation View (Section 7)
  const [simulationCustomerId, setSimulationCustomerId] = useState<number>(1);

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Customer Profile
  const handleOpenCustomerProfile = (cust: CustomerPricingRecord, defaultTab: typeof profileTab = 'pricing') => {
    setProfileCustomer(cust);
    setProfileTab(defaultTab);
    setProfileModalOpen(true);
  };

  // Open Edit SKU Price Modal
  const handleOpenEditSku = (sku: SkuPricingEntry) => {
    setEditingSku(sku);
    setCustomPriceInput(sku.customerPrice);
    setMinQtyInput(sku.minOrderQty);
    setReasonInput('Annual bulk supply agreement renegotiation');
    setEditSkuModalOpen(true);
  };

  // Save SKU Custom Price
  const handleSaveSkuPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSku || !profileCustomer) return;

    const newPrice = Number(customPriceInput);
    const discount = editingSku.standardPrice > 0 
      ? Math.max(0, parseFloat((((editingSku.standardPrice - newPrice) / editingSku.standardPrice) * 100).toFixed(2)))
      : 0;

    setCustomerSkus((prev) =>
      prev.map((it) =>
        it.productId === editingSku.productId
          ? {
              ...it,
              customerPrice: newPrice,
              discountPercentage: discount,
              minOrderQty: minQtyInput,
              source: 'CUSTOMER_SKU_OVERRIDE',
            }
          : it
      )
    );

    // Update matrix customer rates if it matches matrix product
    if (editingSku.productId === matrixProductId) {
      setMatrixCustomerRates((prev) => ({ ...prev, [profileCustomer.id]: newPrice }));
    }

    setEditSkuModalOpen(false);
    showToast(`Updated ${editingSku.name} price to ₹${newPrice.toLocaleString()} for ${profileCustomer.businessName}`);
  };

  // Save Product-Wise Matrix Changes
  const handleSaveMatrixChanges = () => {
    const sku = matrixSkus.find((s) => s.id === matrixProductId);
    showToast(`Saved customer price matrix for ${sku?.name}! Updated across ${Object.keys(matrixCustomerRates).length} accounts.`);
  };

  // Apply Bulk % Adjustment
  const handleApplyBulkAdjustment = () => {
    const factor = bulkDirection === 'increase' ? (1 + bulkAdjustmentPercent / 100) : (1 - bulkAdjustmentPercent / 100);
    
    // Update local matrix customer rates
    const updatedRates: Record<number, number> = {};
    Object.entries(matrixCustomerRates).forEach(([cid, rate]) => {
      updatedRates[Number(cid)] = Math.round(rate * factor);
    });
    setMatrixCustomerRates(updatedRates);

    // Update customer SKUs in profile
    setCustomerSkus((prev) =>
      prev.map((sku) => {
        if (bulkCategoryTarget === 'All' || sku.category === bulkCategoryTarget) {
          const newRate = Math.round(sku.customerPrice * factor);
          const disc = Math.max(0, parseFloat((((sku.standardPrice - newRate) / sku.standardPrice) * 100).toFixed(2)));
          return { ...sku, customerPrice: newRate, discountPercentage: disc };
        }
        return sku;
      })
    );

    showToast(`Applied ${bulkDirection === 'increase' ? '+' : '-'}${bulkAdjustmentPercent}% adjustment to target customers!`);
  };

  // Complete Onboarding Wizard
  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = customers.length + 1;
    const newCust: CustomerPricingRecord = {
      id: newId,
      customerIdFormatted: `FS-CUST-${String(newId).padStart(3, '0')}`,
      businessName: onboardForm.businessName || 'New B2B Partner',
      customerType: onboardForm.customerType as any,
      assignedPriceList: onboardForm.assignedPriceList,
      priceListId: 1,
      creditPeriod: `${onboardForm.creditPeriod} Days`,
      creditPeriodDays: onboardForm.creditPeriod,
      creditLimit: onboardForm.creditLimit,
      outstandingAmount: 0,
      availableCredit: onboardForm.creditLimit,
      pricingStatus: 'Active',
      lastUpdated: 'Just now',
      customSkusCount: 6,
      contactPerson: onboardForm.contactPerson || 'Store Manager',
      phone: onboardForm.phone || '+91 99999 88888',
      email: onboardForm.email || 'partner@freshsupply.com',
      gstin: onboardForm.gstin || '29AAAAA0000A1Z5',
      deliveryZone: onboardForm.deliveryZone,
      paymentTerms: onboardForm.paymentTerms,
      creditEnabled: true,
      creditStatus: 'good_standing',
    };

    setCustomers((prev) => [newCust, ...prev]);
    setOnboardingModalOpen(false);
    setOnboardStep(1);
    showToast(`Customer account for ${newCust.businessName} activated with commercial terms!`);
  };

  // Filter Directory Customers
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.businessName.toLowerCase().includes(q) ||
      c.customerIdFormatted.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q);
    const matchesType = typeFilter === 'All' || c.customerType.includes(typeFilter);
    const matchesPriceList = priceListFilter === 'All' || c.assignedPriceList === priceListFilter;
    return matchesSearch && matchesType && matchesPriceList;
  });

  const selectedMatrixSku = matrixSkus.find((s) => s.id === matrixProductId) || matrixSkus[0];
  const simulatedCustomer = customers.find((c) => c.id === simulationCustomerId) || customers[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#047857',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(4, 120, 87, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 99999,
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} color="#047857" />
            Customer-Specific Pricing & Credit Management
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Configure negotiated wholesale rates, credit periods, credit limits, and delivery terms for 120+ wholesale accounts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('simulation')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <Sparkles size={15} color="#047857" />
            <span>Verify Customer App View</span>
          </button>

          <button
            onClick={() => setOnboardingModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '7px 16px' }}
          >
            <Plus size={16} />
            <span>Onboard New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip (Section 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>Total Active Customers</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            120
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            ● 100% KYC verified
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #047857' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>With Custom Pricing</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            42
          </div>
          <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, marginTop: '4px' }}>
            Individual negotiated rates
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #2563EB' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>Using Standard Lists</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            78
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
            Assigned to shared lists
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #D97706' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>Customized Grocery SKUs</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            34
          </div>
          <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: '4px' }}>
            Rice, Grains, Oils & Dals
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #EA580C' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>Pending Configurations</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#EA580C', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            5
          </div>
          <div style={{ fontSize: '0.7rem', color: '#EA580C', fontWeight: 700, marginTop: '4px' }}>
            Awaiting price list review
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>Active Price Lists</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            4
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            Updated this week
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8E5', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'directory', label: 'Customer Pricing Directory', icon: Users },
          { id: 'matrix', label: 'Product-Wise Pricing Matrix', icon: Layers },
          { id: 'bulk', label: 'Bulk % Adjustments', icon: Sliders },
          { id: 'price_lists', label: 'Reusable Price Lists', icon: FileText },
          { id: 'csv', label: 'CSV / Excel Import & Export', icon: FileSpreadsheet },
          { id: 'audit', label: 'Audit Trail & Price History', icon: History },
          { id: 'simulation', label: 'Customer App Simulation', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '3px solid #047857' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? '#047857' : '#64748B',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#047857' : '#64748B'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CUSTOMER PRICING DIRECTORY                              */}
      {/* ============================================================== */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search & Filters */}
          <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                className="input"
                placeholder="Search by customer name, ID (FS-CUST-XXX), or contact person..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8E5',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '0.8rem',
                color: '#172B24',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Customer Types</option>
              <option value="Retailer">Retailers</option>
              <option value="Hotel & Restaurant">Hotels & Restaurants</option>
              <option value="Distributor">Distributors</option>
              <option value="Cloud Kitchen">Cloud Kitchens</option>
            </select>

            <select
              value={priceListFilter}
              onChange={(e) => setPriceListFilter(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8E5',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '0.8rem',
                color: '#172B24',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Price Lists</option>
              <option value="Premium Retailer Pricing">Premium Retailer Pricing</option>
              <option value="Standard Wholesale Pricing">Standard Wholesale Pricing</option>
              <option value="Restaurant & Hotel Pricing">Restaurant & Hotel Pricing</option>
              <option value="Special Contract Pricing">Special Contract Pricing</option>
            </select>
          </div>

          {/* Directory Table */}
          <div className="table-container card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '960px' }}>
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Customer ID</th>
                  <th style={{ width: '22%' }}>Business Entity</th>
                  <th style={{ width: '18%' }}>Assigned Price List</th>
                  <th style={{ width: '10%' }}>Credit Period</th>
                  <th style={{ width: '12%' }}>Credit Limit</th>
                  <th style={{ width: '12%' }}>Available Credit</th>
                  <th style={{ width: '8%' }}>Status</th>
                  <th style={{ width: '16%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#047857',
                          backgroundColor: '#ECFDF5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        {cust.customerIdFormatted}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.86rem' }}>
                          {cust.businessName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span>{cust.customerType}</span>
                          <span>•</span>
                          <span>{cust.customSkusCount} Custom SKUs</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B24' }}>
                          {cust.assignedPriceList}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                          Updated {cust.lastUpdated}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8E5',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#172B24',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {cust.creditPeriod}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#172B24', fontSize: '0.86rem' }}>
                        ₹{cust.creditLimit.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#D97706', fontFamily: 'var(--font-mono)' }}>
                        Bal: ₹{cust.outstandingAmount.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#16A34A', fontSize: '0.86rem' }}>
                        ₹{cust.availableCredit.toLocaleString('en-IN')}
                      </div>
                      <div style={{ width: '80px', height: '4px', backgroundColor: '#F1F5F3', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                        <div
                          style={{
                            width: `${Math.round((cust.availableCredit / cust.creditLimit) * 100)}%`,
                            height: '100%',
                            backgroundColor: '#16A34A',
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          backgroundColor: '#DCFCE7',
                          color: '#16A34A',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          border: '1px solid #86EFAC',
                        }}
                      >
                        {cust.pricingStatus}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenCustomerProfile(cust, 'pricing')}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                        >
                          <Edit3 size={13} />
                          <span>Configure</span>
                        </button>
                        <button
                          onClick={() => handleOpenCustomerProfile(cust, 'overview')}
                          className="btn btn-secondary btn-sm"
                          title="Open Customer Profile (7 Tabs)"
                          style={{ fontSize: '0.72rem', padding: '5px 8px' }}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PRODUCT-WISE PRICING MATRIX (Section 3 Option B)        */}
      {/* ============================================================== */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#172B24' }}>
                  Product-Wise Multi-Customer Pricing Matrix
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Select a single grocery commodity to view and edit its negotiated wholesale price across all business buyers
                </p>
              </div>

              {/* SKU Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#172B24' }}>Select Product:</span>
                <select
                  value={matrixProductId}
                  onChange={(e) => setMatrixProductId(Number(e.target.value))}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8E5',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    color: '#172B24',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {matrixSkus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Base: ₹{s.standardPrice.toLocaleString()} / {s.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Spec Banner */}
            <div style={{ marginTop: '14px', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={20} color="#047857" />
                <div>
                  <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.9rem' }}>{selectedMatrixSku.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    SKU: <strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>{selectedMatrixSku.sku}</strong> · Category: {selectedMatrixSku.category}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Standard Wholesale Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                    ₹{selectedMatrixSku.standardPrice.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>/ {selectedMatrixSku.unit}</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveMatrixChanges}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                >
                  <Check size={14} />
                  <span>Save Matrix Rates</span>
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', marginTop: '16px' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '780px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Customer ID</th>
                    <th style={{ width: '30%' }}>Customer Name</th>
                    <th style={{ width: '20%' }}>Assigned Price List</th>
                    <th style={{ width: '15%' }}>Standard Rate</th>
                    <th style={{ width: '20%' }}>Negotiated Customer Rate (₹ / {selectedMatrixSku.unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const currentRate = matrixCustomerRates[c.id] || selectedMatrixSku.standardPrice;
                    const diffPct = ((selectedMatrixSku.standardPrice - currentRate) / selectedMatrixSku.standardPrice) * 100;
                    return (
                      <tr key={c.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#047857' }}>
                            {c.customerIdFormatted}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#172B24' }}>{c.businessName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{c.customerType}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                            {c.assignedPriceList}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#64748B', fontWeight: 600 }}>
                            ₹{selectedMatrixSku.standardPrice.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              className="input"
                              value={currentRate}
                              onChange={(e) =>
                                setMatrixCustomerRates({
                                  ...matrixCustomerRates,
                                  [c.id]: parseFloat(e.target.value) || 0,
                                })
                              }
                              style={{ width: '110px', padding: '5px 8px', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                            />
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: diffPct > 0 ? '#16A34A' : '#64748B',
                                backgroundColor: diffPct > 0 ? '#DCFCE7' : '#F1F5F3',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {diffPct > 0 ? `${diffPct.toFixed(1)}% OFF` : 'Base'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BULK % ADJUSTMENTS (Section 3 Option C)                 */}
      {/* ============================================================== */}
      {activeTab === 'bulk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card" style={{ padding: '24px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172B24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#047857" />
              Bulk Percentage Pricing Adjustment
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', marginBottom: '20px' }}>
              Quickly scale negotiated wholesale prices across all customer price lists, specific grocery categories, or selected client tiers
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label className="label">Adjustment Direction</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setBulkDirection('increase')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: bulkDirection === 'increase' ? '2px solid #047857' : '1px solid #E2E8E5',
                      backgroundColor: bulkDirection === 'increase' ? '#ECFDF5' : '#FFFFFF',
                      color: bulkDirection === 'increase' ? '#047857' : '#64748B',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    + Increase Prices
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDirection('decrease')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: bulkDirection === 'decrease' ? '2px solid #047857' : '1px solid #E2E8E5',
                      backgroundColor: bulkDirection === 'decrease' ? '#ECFDF5' : '#FFFFFF',
                      color: bulkDirection === 'decrease' ? '#047857' : '#64748B',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    – Reduce Prices
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Percentage Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  className="input"
                  value={bulkAdjustmentPercent}
                  onChange={(e) => setBulkAdjustmentPercent(parseFloat(e.target.value) || 0)}
                  style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label className="label">Target Grocery Category</label>
                <select
                  value={bulkCategoryTarget}
                  onChange={(e) => setBulkCategoryTarget(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.82rem' }}
                >
                  <option value="All">All Categories (Entire Catalog)</option>
                  <option value="Rice & Grains">Rice & Grains</option>
                  <option value="Pulses & Dals">Pulses & Dals</option>
                  <option value="Cooking Oils & Ghee">Cooking Oils & Ghee</option>
                  <option value="Sugar, Salt & Sweeteners">Sugar, Salt & Sweeteners</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                </select>
              </div>

              <div>
                <label className="label">Target Price List Scope</label>
                <select
                  value={bulkPriceListTarget}
                  onChange={(e) => setBulkPriceListTarget(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.82rem' }}
                >
                  <option value="All">All 120 Business Accounts</option>
                  <option value="Premium Retailer Pricing">Premium Retailer Pricing (42 Customers)</option>
                  <option value="Standard Wholesale Pricing">Standard Wholesale Pricing (48 Customers)</option>
                  <option value="Restaurant & Hotel Pricing">Restaurant & Hotel Pricing (19 Customers)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className="label">Audit Trail Justification / Mandatory Reason *</label>
              <input
                type="text"
                className="input"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="e.g. Mandi procurement rate hike, Diesel logistics surcharge"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Impact Preview */}
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#172B24', marginBottom: '8px' }}>
                Preview Calculation Example:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8E5' }}>
                  <div style={{ color: '#64748B' }}>Basmati Rice (GreenMart)</div>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>₹1,800</span>{' '}
                    <strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>
                      ₹{Math.round(1800 * (bulkDirection === 'increase' ? (1 + bulkAdjustmentPercent / 100) : (1 - bulkAdjustmentPercent / 100))).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8E5' }}>
                  <div style={{ color: '#64748B' }}>Toor Dal (SuperFood)</div>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>₹10,400</span>{' '}
                    <strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>
                      ₹{Math.round(10400 * (bulkDirection === 'increase' ? (1 + bulkAdjustmentPercent / 100) : (1 - bulkAdjustmentPercent / 100))).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8E5' }}>
                  <div style={{ color: '#64748B' }}>Sunflower Oil (QuickNest)</div>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>₹1,670</span>{' '}
                    <strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>
                      ₹{Math.round(1670 * (bulkDirection === 'increase' ? (1 + bulkAdjustmentPercent / 100) : (1 - bulkAdjustmentPercent / 100))).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleApplyBulkAdjustment}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.85rem' }}
              >
                <CheckCircle size={16} />
                <span>Confirm & Apply Bulk Adjustment</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: REUSABLE PRICE LISTS (Section 4)                        */}
      {/* ============================================================== */}
      {activeTab === 'price_lists' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { id: 1, name: 'Premium Retailer Pricing', count: 42, margin: '8% Avg Discount', desc: 'Tiered wholesale discounts for high-frequency supermarket chains (GreenMart, Reliance Fresh partners)', color: '#047857' },
              { id: 2, name: 'Standard Wholesale Pricing', count: 48, margin: 'Base Wholesale', desc: 'Default baseline price list for walk-in retailers and standard accounts without volume agreements', color: '#2563EB' },
              { id: 3, name: 'Restaurant & Hotel Pricing', count: 19, margin: '12% Staples Discount', desc: 'Commercial hospitality catering packaging: bulk pulses, 50kg rice sacks, 15L oil tins (SuperFood Group)', color: '#D97706' },
              { id: 4, name: 'Special Contract Pricing', count: 11, margin: 'Contract Locked Rates', desc: 'Annual fixed master agreements for quick-commerce dark stores with 24-hour turnaround (QuickNest)', color: '#7C3AED' },
            ].map((pl) => (
              <div key={pl.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pl.color, backgroundColor: '#F1F5F3', padding: '3px 8px', borderRadius: '4px' }}>
                      {pl.margin}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#172B24' }}>
                      {pl.count} Accounts
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#172B24', marginTop: '10px' }}>
                    {pl.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
                    {pl.desc}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      setPriceListFilter(pl.name);
                      setActiveTab('directory');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem' }}
                  >
                    <span>View {pl.count} Customers</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => showToast(`Opening SKU editor for "${pl.name}"`)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.72rem' }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Rates</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: CSV / EXCEL IMPORT & EXPORT (Section 3 Option D)        */}
      {/* ============================================================== */}
      {activeTab === 'csv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card" style={{ padding: '24px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172B24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={20} color="#047857" />
              Bulk Customer Pricing CSV Import & Export
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', marginBottom: '20px' }}>
              Safely update all 120 customer prices in bulk via Excel or CSV with automated SKU code verification and validation preview
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Step 1: Download */}
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.88rem' }}>1. Download Pricing Matrix</div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', marginBottom: '14px' }}>
                  Export existing customer rates or download an empty standardized template with prefilled SKU codes
                </p>
                <button
                  type="button"
                  onClick={() => showToast('FreshSupply_Customer_Pricing_Matrix.csv downloaded!')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Download size={14} />
                  <span>Download Full CSV Matrix (120 Clients)</span>
                </button>
              </div>

              {/* Step 2: Upload */}
              <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.88rem' }}>2. Upload & Validate File</div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', marginBottom: '14px' }}>
                  Upload updated CSV file. The validator verifies customer IDs, SKU codes, and shows diffs before committing
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Validated 120 customer rows successfully! 0 errors detected. Ready to commit.')}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Upload size={14} />
                  <span>Upload & Verify CSV</span>
                </button>
              </div>
            </div>

            {/* Validation Engine Checklist */}
            <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#172B24', marginBottom: '6px' }}>
                Automated Integrity & Safety Rules:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', color: '#64748B' }}>
                <div>✓ Checks every `customer_id` against active registered accounts</div>
                <div>✓ Confirms all `sku_code` identifiers match authoritative grocery catalog</div>
                <div>✓ Rejects negative or non-numerical price values</div>
                <div>✓ Displays summary confirmation modal before modifying live customer prices</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: AUDIT TRAIL & PRICE HISTORY (Section 10)                */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="table-container card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '860px' }}>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Customer</th>
                  <th style={{ width: '22%' }}>Product & SKU</th>
                  <th style={{ width: '12%' }}>Previous Rate</th>
                  <th style={{ width: '12%' }}>New Rate</th>
                  <th style={{ width: '15%' }}>Change Type</th>
                  <th style={{ width: '14%' }}>Approved By</th>
                  <th style={{ width: '10%' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, customer: 'GreenMart Retail', sku: 'GRP-RIC-1121', name: 'Aged 1121 Royal Basmati Rice', prev: '₹1,850', next: '₹1,800', type: 'SKU_OVERRIDE', by: 'Johnson (Admin)', time: 'Today, 10:15 AM' },
                  { id: 2, customer: 'SuperFood Retail Chain', sku: 'PUL-TOO-050', name: 'Desi Fatka Toor Dal', prev: '₹10,800', next: '₹10,400', type: 'SKU_OVERRIDE', by: 'Johnson (Admin)', time: 'Yesterday, 03:20 PM' },
                  { id: 3, customer: 'QuickNest Express Marts', sku: 'OIL-SUN-015', name: 'Sunflower Oil 15L', prev: '₹1,720', next: '₹1,670', type: 'SKU_OVERRIDE', by: 'Rahul Verma (Manager)', time: 'Oct 03, 2026' },
                  { id: 4, customer: 'EasyVegi Mart Network', sku: 'GRP-SON-050', name: 'Sona Masoori Rice', prev: '₹1,750', next: '₹1,720', type: 'BULK_CATEGORY_ADJUSTMENT', by: 'Johnson (Admin)', time: 'Oct 02, 2026' },
                  { id: 5, customer: 'FreshHub Hypermarket Stores', sku: 'SUG-M30-050', name: 'Refined Sugar M-30', prev: '₹4,300', next: '₹4,250', type: 'PRICE_LIST_INHERIT', by: 'System Automation', time: 'Sep 29, 2026' },
                ].map((log) => (
                  <tr key={log.id}>
                    <td>
                      <strong style={{ color: '#172B24', fontSize: '0.82rem' }}>{log.customer}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#172B24', fontSize: '0.82rem' }}>{log.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#047857' }}>{log.sku}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#94A3B8', textDecoration: 'line-through' }}>{log.prev}</span>
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: '#047857', fontSize: '0.9rem' }}>{log.next}</strong>
                    </td>
                    <td>
                      <span style={{ backgroundColor: '#F1F5F3', color: '#475569', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {log.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#172B24' }}>{log.by}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{log.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: CUSTOMER APP SIMULATION & VERIFICATION (Section 7)      */}
      {/* ============================================================== */}
      {activeTab === 'simulation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ backgroundColor: '#ECFDF5', color: '#047857', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                  Live Authenticated Customer Perspective
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#172B24', marginTop: '6px' }}>
                  Dynamic Pricing & Credit Simulation
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Switch between wholesale accounts to verify that the UI stays 100% identical while prices, discounts, and credit terms dynamically reflect the logged-in customer
                </p>
              </div>

              {/* Customer Switcher Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B24' }}>Simulate Login As:</span>
                <select
                  value={simulationCustomerId}
                  onChange={(e) => setSimulationCustomerId(Number(e.target.value))}
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '2px solid #047857',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.88rem',
                    color: '#047857',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.customerIdFormatted})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulated Customer Header Bar */}
            <div style={{ marginTop: '16px', padding: '14px 18px', backgroundColor: '#047857', color: '#FFFFFF', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.85 }}>
                  Logged-In B2B Wholesale Account
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>
                  {simulatedCustomer.businessName}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
                  Assigned Price List: <strong>{simulatedCustomer.assignedPriceList}</strong> · Credit Term: <strong>{simulatedCustomer.paymentTerms}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Available Credit Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    ₹{simulatedCustomer.availableCredit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ height: '36px', width: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Credit Limit</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    ₹{simulatedCustomer.creditLimit.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Product Cards Grid Showing Their Negotiated Rates */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#172B24', marginBottom: '12px' }}>
                Wholesale Produce & Staples Catalog (Prices dynamically adjusted for {simulatedCustomer.businessName}):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {customerSkus.slice(0, 4).map((sku) => {
                  // Simulate slightly different price per customer for Basmati Rice (as specified in prompt)
                  let effectivePrice = sku.customerPrice;
                  if (sku.productId === 101) {
                    if (simulatedCustomer.id === 1) effectivePrice = 1800;
                    else if (simulatedCustomer.id === 2) effectivePrice = 1900;
                    else if (simulatedCustomer.id === 3) effectivePrice = 1850;
                    else if (simulatedCustomer.id === 4) effectivePrice = 1780;
                    else if (simulatedCustomer.id === 5) effectivePrice = 1920;
                  }

                  const savings = sku.standardPrice - effectivePrice;
                  const discountPct = sku.standardPrice > 0 ? ((savings / sku.standardPrice) * 100).toFixed(1) : '0';

                  return (
                    <div
                      key={sku.productId}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8E5',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>
                            {sku.sku}
                          </span>
                          {savings > 0 && (
                            <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>

                        <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.92rem', marginTop: '6px' }}>
                          {sku.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                          {sku.packSize}
                        </div>
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F3', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Your Negotiated Rate</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                            ₹{effectivePrice.toLocaleString()}{' '}
                            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>/ {sku.unit}</span>
                          </div>
                          {savings > 0 && (
                            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                              Standard: <span style={{ textDecoration: 'line-through' }}>₹{sku.standardPrice.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => showToast(`Added 1 ${sku.unit} of ${sku.name} to cart at your contracted price ₹${effectivePrice.toLocaleString()}!`)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '6px 12px' }}
                        >
                          + Add Bulk
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CUSTOMER PROFILE (7 TABS - Section 9)                   */}
      {/* ============================================================== */}
      {profileModalOpen && profileCustomer && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '900px', padding: 0, overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                    {profileCustomer.customerIdFormatted}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{profileCustomer.customerType}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#172B24', marginTop: '4px' }}>
                  {profileCustomer.businessName}
                </h2>
              </div>

              <button onClick={() => setProfileModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {/* Profile 7 Sub-Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8E5', padding: '0 24px', backgroundColor: '#FFFFFF', gap: '16px', overflowX: 'auto' }}>
              {[
                { id: 'overview', label: '1. Overview' },
                { id: 'pricing', label: '2. Product Pricing' },
                { id: 'credit', label: '3. Credit & Payments' },
                { id: 'orders', label: '4. Orders' },
                { id: 'invoices', label: '5. Invoices' },
                { id: 'delivery', label: '6. Delivery Configuration' },
                { id: 'history', label: '7. Activity & History' },
              ].map((pt) => {
                const isActive = profileTab === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => setProfileTab(pt.id as any)}
                    style={{
                      padding: '12px 4px',
                      border: 'none',
                      borderBottom: isActive ? '3px solid #047857' : '3px solid transparent',
                      backgroundColor: 'transparent',
                      color: isActive ? '#047857' : '#64748B',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pt.label}
                  </button>
                );
              })}
            </div>

            {/* Profile Tab Body */}
            <div style={{ padding: '24px', maxHeight: 'calc(85vh - 160px)', overflowY: 'auto' }}>
              
              {/* Profile Tab 1: Overview */}
              {profileTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Assigned Price List</div>
                      <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.95rem', marginTop: '2px' }}>{profileCustomer.assignedPriceList}</div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Credit Limit</div>
                      <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.95rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>₹{profileCustomer.creditLimit.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Available Credit</div>
                      <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.95rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>₹{profileCustomer.availableCredit.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Payment Terms</div>
                      <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.95rem', marginTop: '2px' }}>{profileCustomer.paymentTerms}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem' }}>
                    <div style={{ padding: '14px', border: '1px solid #E2E8E5', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 800, color: '#172B24', marginBottom: '8px' }}>Business Registration</div>
                      <div>GSTIN: <strong style={{ fontFamily: 'var(--font-mono)' }}>{profileCustomer.gstin}</strong></div>
                      <div>Contact Person: <strong>{profileCustomer.contactPerson}</strong></div>
                      <div>Phone: <strong>{profileCustomer.phone}</strong></div>
                      <div>Email: <strong>{profileCustomer.email}</strong></div>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid #E2E8E5', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 800, color: '#172B24', marginBottom: '8px' }}>Logistics & Delivery Zone</div>
                      <div>Assigned Zone: <strong>{profileCustomer.deliveryZone}</strong></div>
                      <div>Delivery Days: <strong>Mon, Wed, Fri</strong></div>
                      <div>Preferred Slot: <strong>05:00 AM – 08:00 AM</strong></div>
                      <div>Transport Charge: <strong style={{ color: '#16A34A' }}>Free (Order &gt; ₹10,000)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab 2: Product Pricing (Section 2) */}
              {profileTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B24' }}>
                        Customer SKU Wholesale Price List
                      </h3>
                      <p style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Priority: 1. Customer SKU Override $\rightarrow$ 2. Assigned Price List $\rightarrow$ 3. Default Wholesale Rate
                      </p>
                    </div>

                    <button
                      onClick={() => showToast('All SKU prices synced and live for this customer!')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <RefreshCw size={13} />
                      <span>Sync All Rates</span>
                    </button>
                  </div>

                  <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', minWidth: '720px' }}>
                      <thead>
                        <tr>
                          <th>Product & SKU</th>
                          <th>Standard Price</th>
                          <th>Customer Price</th>
                          <th>Discount</th>
                          <th>Pricing Source</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerSkus.map((sku) => (
                          <tr key={sku.productId}>
                            <td>
                              <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.82rem' }}>{sku.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>{sku.sku} · {sku.unit}</div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', color: '#64748B', fontWeight: 600 }}>
                                ₹{sku.standardPrice.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <strong style={{ fontFamily: 'var(--font-mono)', color: '#047857', fontSize: '0.92rem' }}>
                                ₹{sku.customerPrice.toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <span
                                style={{
                                  backgroundColor: sku.discountPercentage > 0 ? '#DCFCE7' : '#F1F5F3',
                                  color: sku.discountPercentage > 0 ? '#16A34A' : '#64748B',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {sku.discountPercentage > 0 ? `${sku.discountPercentage}% OFF` : 'Base'}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: sku.source === 'CUSTOMER_SKU_OVERRIDE' ? '#ECFDF5' : '#EFF6FF',
                                  color: sku.source === 'CUSTOMER_SKU_OVERRIDE' ? '#047857' : '#2563EB',
                                  border: `1px solid ${sku.source === 'CUSTOMER_SKU_OVERRIDE' ? '#A7F3D0' : '#BFDBFE'}`,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {sku.source === 'CUSTOMER_SKU_OVERRIDE' ? 'SKU Override (Top Priority)' : 'Inherited from Price List'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleOpenEditSku(sku)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              >
                                <Edit3 size={12} color="#047857" />
                                <span>Edit Rate</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Profile Tab 3: Credit & Payments (Section 5) */}
              {profileTab === 'credit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Total Sanctioned Credit Limit</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        ₹{profileCustomer.creditLimit.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Current Unpaid Balance</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D97706', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        ₹{profileCustomer.outstandingAmount.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#047857' }}>Available Purchasing Credit</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        ₹{profileCustomer.availableCredit.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                    <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.9rem', marginBottom: '10px' }}>
                      Credit Terms & Policy Controls:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                      <div>Credit Status: <strong style={{ color: '#16A34A' }}>Good Standing (Active)</strong></div>
                      <div>Payment Terms: <strong>{profileCustomer.paymentTerms}</strong></div>
                      <div>Grace Period: <strong>3 Days beyond due date</strong></div>
                      <div>Auto-Hold on Exceeded Limit: <strong>Enabled</strong></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.88rem', marginBottom: '8px' }}>
                      Recent Credit Ledger Transactions:
                    </div>
                    <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Balance After</th>
                            <th>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span style={{ color: '#D97706', fontWeight: 700 }}>CHARGE</span></td>
                            <td>Invoice #INV-98210 (12.5 MT Produce)</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹4,72,500</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>₹4,72,500</td>
                            <td style={{ color: '#64748B' }}>Today, 09:30 AM</td>
                          </tr>
                          <tr>
                            <td><span style={{ color: '#16A34A', fontWeight: 700 }}>PAYMENT</span></td>
                            <td>RTGS Ref: HDFC998811234</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#16A34A' }}>-₹3,47,500</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>₹1,25,000</td>
                            <td style={{ color: '#64748B' }}>Yesterday, 04:15 PM</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab 4: Orders */}
              {profileTab === 'orders' && (
                <div>
                  <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Wholesale Order History (Orders automatically booked at customer's negotiated rates):
                  </div>
                  <div className="table-container">
                    <table className="data-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>#ORD-84271</strong></td>
                          <td>Oct 04, 2026</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>₹4,72,500</td>
                          <td><span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Packing at Hub</span></td>
                          <td>B2B Credit (Net 30)</td>
                        </tr>
                        <tr>
                          <td><strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>#ORD-83990</strong></td>
                          <td>Sep 28, 2026</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>₹3,85,000</td>
                          <td><span style={{ backgroundColor: '#F1F5F3', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Delivered</span></td>
                          <td>B2B Credit (Paid)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Profile Tab 5: Invoices */}
              {profileTab === 'invoices' && (
                <div>
                  <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Tax Invoices & Due Dates:
                  </div>
                  <div className="table-container">
                    <table className="data-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Invoice Date</th>
                          <th>Due Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong style={{ fontFamily: 'var(--font-mono)' }}>INV-2026-0941</strong></td>
                          <td>Oct 04, 2026</td>
                          <td>Nov 03, 2026</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>₹4,72,500</td>
                          <td><span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Unpaid (Within Term)</span></td>
                        </tr>
                        <tr>
                          <td><strong style={{ fontFamily: 'var(--font-mono)' }}>INV-2026-0812</strong></td>
                          <td>Sep 28, 2026</td>
                          <td>Oct 28, 2026</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>₹3,85,000</td>
                          <td><span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Paid (RTGS)</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Profile Tab 6: Delivery Configuration (Section 8) */}
              {profileTab === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label className="label">Assigned Delivery Zone</label>
                      <input type="text" className="input" defaultValue={profileCustomer.deliveryZone} />
                    </div>
                    <div>
                      <label className="label">Preferred Delivery Days</label>
                      <input type="text" className="input" defaultValue="Mon, Wed, Fri, Sat" />
                    </div>
                    <div>
                      <label className="label">Delivery Time Window</label>
                      <input type="text" className="input" defaultValue="Early Morning (05:00 AM - 08:00 AM)" />
                    </div>
                    <div>
                      <label className="label">Transport Charge Model</label>
                      <select className="input" defaultValue="free">
                        <option value="free">Free Delivery (MOQ &gt; ₹10,000)</option>
                        <option value="fixed">Fixed ₹250 per dispatch</option>
                        <option value="per_quintal">₹15 per Quintal Freight</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Dock & Offloading Instructions</label>
                    <textarea
                      className="input"
                      rows={2}
                      defaultValue="Reefer cold-chain truck required for dairy blocks. Offloading dock bay 2 behind store."
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => showToast('Delivery arrangements updated for this account!')}
                      className="btn btn-primary btn-sm"
                    >
                      Save Delivery Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Tab 7: History (Section 10) */}
              {profileTab === 'history' && (
                <div>
                  <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Chronological Pricing & Credit Log for {profileCustomer.businessName}:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Aged 1121 Royal Basmati Rice price updated to ₹1,800 / Quintal</strong>
                        <span style={{ color: '#64748B' }}>Today, 10:15 AM</span>
                      </div>
                      <div style={{ color: '#64748B', marginTop: '2px' }}>
                        Reason: Volume tier contract renegotiation (150 MT commitment) · Updated by Johnson (Admin)
                      </div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Credit Limit expanded from ₹3,00,000 to ₹5,00,000</strong>
                        <span style={{ color: '#64748B' }}>Sep 15, 2026</span>
                      </div>
                      <div style={{ color: '#64748B', marginTop: '2px' }}>
                        Reason: Opening of 2 new store branches in Whitefield · Approved by Johnson (Admin)
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8E5', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setProfileModalOpen(false)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT SINGLE SKU NEGOTIATED PRICE                        */}
      {/* ============================================================== */}
      {editSkuModalOpen && editingSku && profileCustomer && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-content fade-in" style={{ maxWidth: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>
                  Set Customer Negotiated Price
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  For {profileCustomer.businessName}
                </div>
              </div>
              <button onClick={() => setEditSkuModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSkuPrice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.9rem' }}>{editingSku.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                  SKU: {editingSku.sku} · Standard Rate: <strong style={{ color: '#172B24' }}>₹{editingSku.standardPrice.toLocaleString()} / {editingSku.unit}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Customer Price (₹ / {editingSku.unit}) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    className="input"
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700 }}>
                    {editingSku.standardPrice > customPriceInput ? `${(((editingSku.standardPrice - customPriceInput) / editingSku.standardPrice) * 100).toFixed(1)}% Discount vs Standard` : 'No discount'}
                  </span>
                </div>

                <div>
                  <label className="label">Min Order Quantity (MOQ)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={minQtyInput}
                    onChange={(e) => setMinQtyInput(parseInt(e.target.value) || 1)}
                    style={{ fontSize: '1rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>In {editingSku.unit}s</span>
                </div>
              </div>

              <div>
                <label className="label">Reason / Contract Reference *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Volume commitment 50 MT/month, Master B2B agreement"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditSkuModalOpen(false)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                  <Check size={14} />
                  <span>Save Negotiated Rate</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: 4-STEP CUSTOMER ONBOARDING WIZARD (Section 6)           */}
      {/* ============================================================== */}
      {onboardingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '680px', padding: '24px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#172B24' }}>
                  B2B Customer Onboarding & Commercial Setup
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Step {onboardStep} of 4: {onboardStep === 1 ? 'Business Details' : onboardStep === 2 ? 'Commercial Configuration & Credit' : onboardStep === 3 ? 'Delivery Docks & Schedule' : 'Account Activation & Pricing Preview'}
                </div>
              </div>
              <button onClick={() => setOnboardingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: step <= onboardStep ? '#047857' : '#E2E8E5',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            {/* Step 1: Business Details */}
            {onboardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Registered Business Name *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={onboardForm.businessName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, businessName: e.target.value })}
                      placeholder="e.g. Apex Hypermarket LLP"
                    />
                  </div>
                  <div>
                    <label className="label">Customer Classification *</label>
                    <select
                      className="input"
                      value={onboardForm.customerType}
                      onChange={(e) => setOnboardForm({ ...onboardForm, customerType: e.target.value })}
                    >
                      <option value="Retailer">Supermarket / Retail Chain</option>
                      <option value="Hotel & Restaurant">Hotel & Restaurant (HORECA)</option>
                      <option value="Distributor">Wholesale Distributor</option>
                      <option value="Cloud Kitchen">Cloud Kitchen / Dark Store</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">GSTIN Number *</label>
                    <input
                      type="text"
                      className="input"
                      value={onboardForm.gstin}
                      onChange={(e) => setOnboardForm({ ...onboardForm, gstin: e.target.value })}
                      placeholder="29ABCDE1234F1Z5"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <div>
                    <label className="label">Primary Contact Person</label>
                    <input
                      type="text"
                      className="input"
                      value={onboardForm.contactPerson}
                      onChange={(e) => setOnboardForm({ ...onboardForm, contactPerson: e.target.value })}
                      placeholder="Procurement Head Name"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      className="input"
                      value={onboardForm.phone}
                      onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="label">Business Email</label>
                    <input
                      type="email"
                      className="input"
                      value={onboardForm.email}
                      onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                      placeholder="orders@partner.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Commercial Configuration & Credit */}
            {onboardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="label">Assign Master Wholesale Price List *</label>
                  <select
                    className="input"
                    value={onboardForm.assignedPriceList}
                    onChange={(e) => setOnboardForm({ ...onboardForm, assignedPriceList: e.target.value })}
                  >
                    <option value="Premium Retailer Pricing">Premium Retailer Pricing (6-12% off standard)</option>
                    <option value="Standard Wholesale Pricing">Standard Wholesale Pricing (Baseline)</option>
                    <option value="Restaurant & Hotel Pricing">Restaurant & Hotel Pricing (HORECA bulk packaging)</option>
                    <option value="Special Contract Pricing">Special Contract Pricing (Locked rates)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="label">Credit Limit (₹) *</label>
                    <input
                      type="number"
                      step="50000"
                      className="input"
                      value={onboardForm.creditLimit}
                      onChange={(e) => setOnboardForm({ ...onboardForm, creditLimit: parseInt(e.target.value) || 0 })}
                      style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                    />
                  </div>
                  <div>
                    <label className="label">Credit Period (Days) *</label>
                    <select
                      className="input"
                      value={onboardForm.creditPeriod}
                      onChange={(e) => setOnboardForm({ ...onboardForm, creditPeriod: parseInt(e.target.value) || 30 })}
                    >
                      <option value={7}>7 Days</option>
                      <option value={15}>15 Days</option>
                      <option value={30}>30 Days (Net 30)</option>
                      <option value={45}>45 Days</option>
                      <option value={60}>60 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Payment Terms</label>
                    <input
                      type="text"
                      className="input"
                      value={onboardForm.paymentTerms}
                      onChange={(e) => setOnboardForm({ ...onboardForm, paymentTerms: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Delivery Configuration */}
            {onboardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Delivery Zone *</label>
                    <select
                      className="input"
                      value={onboardForm.deliveryZone}
                      onChange={(e) => setOnboardForm({ ...onboardForm, deliveryZone: e.target.value })}
                    >
                      <option value="Bangalore East Hub">Bangalore East Hub (Whitefield)</option>
                      <option value="Bangalore North Hub">Bangalore North Hub (Hebbal)</option>
                      <option value="Central Business District">Central Business District (CBD)</option>
                      <option value="South Corridor">South Corridor (Electronic City)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Preferred Delivery Days</label>
                    <input
                      type="text"
                      className="input"
                      value={onboardForm.preferredDays}
                      onChange={(e) => setOnboardForm({ ...onboardForm, preferredDays: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Preferred Dispatch Window</label>
                  <select
                    className="input"
                    value={onboardForm.timeSlot}
                    onChange={(e) => setOnboardForm({ ...onboardForm, timeSlot: e.target.value })}
                  >
                    <option value="Early Morning (05:00 AM - 08:00 AM)">Early Morning (05:00 AM - 08:00 AM)</option>
                    <option value="Midday (11:00 AM - 02:00 PM)">Midday (11:00 AM - 02:00 PM)</option>
                    <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Account Activation & Pricing Preview */}
            {onboardStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.92rem' }}>
                    Ready to Activate: {onboardForm.businessName || 'New Partner'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#172B24', marginTop: '4px' }}>
                    Assigned: <strong>{onboardForm.assignedPriceList}</strong> · Credit Limit: <strong>₹{onboardForm.creditLimit.toLocaleString()}</strong> · Terms: <strong>{onboardForm.paymentTerms}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24' }}>
                  Negotiated Prices Live Preview for this Customer:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.75rem' }}>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8E5' }}>
                    <div style={{ color: '#64748B' }}>Basmati Rice (XXL)</div>
                    <strong style={{ color: '#047857', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>₹1,800 / Quintal</strong>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8E5' }}>
                    <div style={{ color: '#64748B' }}>Toor Dal (Desi)</div>
                    <strong style={{ color: '#047857', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>₹10,500 / Quintal</strong>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8E5' }}>
                    <div style={{ color: '#64748B' }}>Sunflower Oil 15L</div>
                    <strong style={{ color: '#047857', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>₹1,650 / Tin</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8E5' }}>
              <button
                type="button"
                disabled={onboardStep === 1}
                onClick={() => setOnboardStep(onboardStep - 1)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', visibility: onboardStep === 1 ? 'hidden' : 'visible' }}
              >
                Back
              </button>

              {onboardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setOnboardStep(onboardStep + 1)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem' }}
                >
                  <span>Continue to Step {onboardStep + 1}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem' }}
                >
                  <CheckCircle size={16} />
                  <span>Activate Account & Publish Pricing</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

