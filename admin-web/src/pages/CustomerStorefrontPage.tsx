import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Bell,
  ShoppingBag,
  ShieldCheck,
  Award,
  CheckCircle,
  Truck,
  Package,
  Layers,
  X,
  Plus,
  Minus,
  ArrowRight,
  UserCheck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Check,
  FileText,
  Bookmark,
  RotateCcw,
  Trash2,
  ListOrdered,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { GstInvoiceModal } from '../components/GstInvoiceModal';

export interface CustomerStorefrontProps {
  onSwitchToAdmin?: () => void;
}

export const CustomerStorefrontPage: React.FC<CustomerStorefrontProps> = ({ onSwitchToAdmin }) => {
  // Demo Customer Accounts (5 Core Accounts + Standard Wholesale)
  const customers = [
    {
      id: 1,
      code: 'FS-CUST-001',
      name: 'GreenMart Retail',
      type: 'Retailer',
      priceList: 'Premium Retailer',
      creditPeriod: 'Net 30 Days',
      creditLimit: 500000,
      outstanding: 125000,
      availableCredit: 375000,
      basmatiPrice: 1800,
      sonaPrice: 1750,
      toorPrice: 10500,
      sugarPrice: 4200,
      oilPrice: 1650,
      wheatPrice: 2750,
    },
    {
      id: 2,
      code: 'FS-CUST-002',
      name: 'FreshHub Stores',
      type: 'Retail Chain',
      priceList: 'Standard Wholesale',
      creditPeriod: 'Net 15 Days',
      creditLimit: 300000,
      outstanding: 45000,
      availableCredit: 255000,
      basmatiPrice: 1900,
      sonaPrice: 1800,
      toorPrice: 10800,
      sugarPrice: 4250,
      oilPrice: 1700,
      wheatPrice: 2800,
    },
    {
      id: 3,
      code: 'FS-CUST-003',
      name: 'SuperFood Retail',
      type: 'Supermarket',
      priceList: 'Special Contract',
      creditPeriod: 'Net 45 Days',
      creditLimit: 800000,
      outstanding: 160000,
      availableCredit: 640000,
      basmatiPrice: 1850,
      sonaPrice: 1780,
      toorPrice: 10600,
      sugarPrice: 4200,
      oilPrice: 1680,
      wheatPrice: 2780,
    },
    {
      id: 4,
      code: 'FS-CUST-004',
      name: 'EasyVegi Mart',
      type: 'Kirana Group',
      priceList: 'High-Frequency Daily',
      creditPeriod: 'Net 7 Days',
      creditLimit: 150000,
      outstanding: 88000,
      availableCredit: 62000,
      basmatiPrice: 1780,
      sonaPrice: 1740,
      toorPrice: 10400,
      sugarPrice: 4180,
      oilPrice: 1640,
      wheatPrice: 2720,
    },
    {
      id: 5,
      code: 'FS-CUST-005',
      name: 'QuickNest Retail',
      type: 'Modern Trade',
      priceList: 'Standard Wholesale',
      creditPeriod: 'Net 30 Days',
      creditLimit: 600000,
      outstanding: 210000,
      availableCredit: 390000,
      basmatiPrice: 1920,
      sonaPrice: 1820,
      toorPrice: 10900,
      sugarPrice: 4280,
      oilPrice: 1720,
      wheatPrice: 2820,
    },
    {
      id: 0,
      code: 'FS-CATALOG',
      name: 'Standard Wholesale (Baseline)',
      type: 'Catalog Default',
      priceList: 'Default Wholesale',
      creditPeriod: 'Advance Payment',
      creditLimit: 0,
      outstanding: 0,
      availableCredit: 0,
      basmatiPrice: 2000,
      sonaPrice: 1850,
      toorPrice: 11000,
      sugarPrice: 4300,
      oilPrice: 1750,
      wheatPrice: 2800,
    },
  ];

  const [activeCustomerId, setActiveCustomerId] = useState(1);
  const activeCustomer = customers.find(c => c.id === activeCustomerId) || customers[0];

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'catalog' | 'planner' | 'orders' | 'lists'>('catalog');

  // Product Detail Modal State (Image 3)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalPackaging, setModalPackaging] = useState<'bags' | 'crates'>('bags');
  const [modalQty, setModalQty] = useState(10);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Cart State
  const [cart, setCart] = useState<Array<{
    id: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    imageUrl: string;
    packaging: string;
  }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'neft'>('credit');
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<{ id: number; orderNumber: string } | null>(null);

  // Phase 3 Self-Service State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Menu plan changed / overstocked');
  const [savedLists, setSavedLists] = useState<any[]>([
    {
      id: 1,
      name: 'Daily Kitchen Core Essentials',
      description: 'Central kitchen high-frequency vegetables and staples',
      isFrequent: true,
      items: [
        { id: 'prod-tomato', name: 'Tomato (Hybrid Grade-A)', unit: 'Quintal', quantity: 3, packaging: 'Crates (20 kg)', price: 3800, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
        { id: 'prod-onion', name: 'Premium Grade-A Red Onions', unit: 'Quintal', quantity: 5, packaging: 'Bags (50 kg)', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
        { id: 'prod-potato', name: 'Potato (Hassan Jyoti Fresh)', unit: 'Quintal', quantity: 4, packaging: 'Bags (50 kg)', price: 2600, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
      ],
    },
    {
      id: 2,
      name: 'Monthly Grains & Pulses Refill',
      description: 'Long-grain aged basmati rice and premium graded toor dal',
      isFrequent: false,
      items: [
        { id: 'prod-basmati', name: 'Basmati Rice (Classic Aged)', unit: 'Quintal', quantity: 8, packaging: 'Bags (50 kg)', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
        { id: 'prod-toor', name: 'Toor Dal (Fatka Grade-A)', unit: 'Quintal', quantity: 3, packaging: 'Bags (50 kg)', price: 10500, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
      ],
    },
  ]);

  // Orders History State
  const [customerOrders, setCustomerOrders] = useState<any[]>([
    {
      id: 'ORD-98421',
      date: 'Today, 08:30 AM',
      itemsCount: 3,
      total: 32800,
      status: 'CONFIRMED',
      deliverySlot: 'Tomorrow Early Morning (05:00 AM - 08:00 AM)',
      payment: 'Credit (Net 30)',
      items: [
        { id: 'prod-tomato', name: 'Tomato (Hybrid Grade-A)', price: 3800, unit: 'Quintal', quantity: 3, packaging: 'Crates (20 kg)', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
        { id: 'prod-onion', name: 'Premium Grade-A Red Onions', price: 2200, unit: 'Quintal', quantity: 5, packaging: 'Bags (50 kg)', imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
        { id: 'prod-potato', name: 'Potato (Hassan Jyoti Fresh)', price: 2600, unit: 'Quintal', quantity: 4, packaging: 'Bags (50 kg)', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
      ],
    },
    {
      id: 'ORD-97814',
      date: 'Yesterday, 04:15 PM',
      itemsCount: 2,
      total: 45900,
      status: 'DISPATCHED',
      deliverySlot: 'Today Morning (06:00 AM - 09:00 AM)',
      payment: 'Credit (Net 30)',
      items: [
        { id: 'prod-basmati', name: 'Basmati Rice (Classic Aged)', price: 1800, unit: 'Quintal', quantity: 8, packaging: 'Bags (50 kg)', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
        { id: 'prod-toor', name: 'Toor Dal (Fatka Grade-A)', price: 10500, unit: 'Quintal', quantity: 3, packaging: 'Bags (50 kg)', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
      ],
    },
  ]);

  // Master Products with Customer-Specific Resolution
  const baseProducts = [
    {
      id: 'prod-basmati',
      sku: 'GRA-BAS-025',
      name: 'Basmati Rice (Classic Aged)',
      category: 'grains',
      unit: 'Quintal',
      standardPrice: 2000,
      stock: '10.0 Quintal',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      description: 'Extra-long grain aged basmati rice for gourmet biryanis and royal hospitality catering. Moisture <= 12%.',
      origin: 'Punjab / Haryana',
      shelfLife: '24 Months',
      size: '8.4 mm grain length',
      certifications: ['FSSAI', 'AGMARK', 'APEDA'],
      highlights: ['Strict Grade-A sorting', 'Zero broken grains', 'Aged for 2 years minimum'],
    },
    {
      id: 'prod-tomato',
      sku: 'VEG-TOM-025',
      name: 'Tomato (Hybrid Grade-A)',
      category: 'vegetables',
      unit: 'Quintal',
      standardPrice: 3800,
      stock: '8.5 Quintal',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      description: 'Firm uniform red tomatoes packed in breathable crates. Ideal for restaurant base gravies, salads and puree.',
      origin: 'Kolar / Maharashtra',
      shelfLife: '5 – 7 days',
      size: '50 – 65 mm',
      certifications: ['FSSAI', 'GAP Certified'],
      highlights: ['Strict Grade-A sorting', 'Low transit bruising', 'High solid pulp yield'],
    },
    {
      id: 'prod-onion',
      sku: 'VEG-ONI-050',
      name: 'Premium Grade-A Red Onions',
      category: 'vegetables',
      unit: 'Quintal',
      standardPrice: 2200,
      stock: '15.0 Quintal',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
      description: 'Nashik red onions, uniform size, low moisture, dry cured skins. Ideal for bulk restaurant kitchens.',
      origin: 'Maharashtra (Nashik)',
      shelfLife: '30 – 45 days',
      size: '55 – 75 mm',
      certifications: ['FSSAI', 'APEDA Certified', 'GAP'],
      highlights: ['Strict Grade-A sorting', 'Firm & long-lasting bulbs', 'Ideal for restaurants & bulk kitchens'],
    },
    {
      id: 'prod-potato',
      sku: 'VEG-POT-050',
      name: 'Potato (Hassan Jyoti Fresh)',
      category: 'vegetables',
      unit: 'Quintal',
      standardPrice: 2600,
      stock: '12.8 Quintal',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
      description: 'Clean skin starchy potatoes for gravies, curries and french fries. Graded 45mm+.',
      origin: 'Hassan, Karnataka',
      shelfLife: '20 – 30 days',
      size: '45 – 65 mm',
      certifications: ['FSSAI', 'GAP'],
      highlights: ['Grade-A cleaned', 'Uniform starch ratio', 'High cooking yield'],
    },
    {
      id: 'prod-carrot',
      sku: 'VEG-CAR-025',
      name: 'Carrot (Ooty Orange Hybrid)',
      category: 'vegetables',
      unit: 'Quintal',
      standardPrice: 4200,
      stock: '6.1 Quintal',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
      description: 'Crisp, sweet, washed orange carrots for julienne, salads, soups and cooking.',
      origin: 'Nilgiris (Ooty)',
      shelfLife: '7 – 10 days',
      size: '15 – 20 cm',
      certifications: ['FSSAI', 'Cold Chain Certified'],
      highlights: ['Pre-washed & graded', 'High carotene & sugar', 'Uniform taper'],
    },
    {
      id: 'prod-cauliflower',
      sku: 'VEG-CAU-020',
      name: 'Cauliflower (Snow White Curds)',
      category: 'vegetables',
      unit: 'Quintal',
      standardPrice: 5500,
      stock: '4.2 Quintal',
      image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
      description: 'Dense white curds with fresh green leaf wrapping to prevent transit yellowing.',
      origin: 'Malur, Karnataka',
      shelfLife: '4 – 6 days',
      size: '600g – 900g per curd',
      certifications: ['FSSAI', 'GAP'],
      highlights: ['No discoloration', 'Tight compact curds', 'Harvested pre-dawn'],
    },
    {
      id: 'prod-cabbage',
      sku: 'VEG-CAB-030',
      name: 'Cabbage (Green Drumhead)',
      category: 'vegetables',
      unit: 'Quintal',
      standardPrice: 2000,
      stock: '7.6 Quintal',
      image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80',
      description: 'Tight head fresh green cabbage, excellent shredding texture for street food, salads, and curries.',
      origin: 'Chikkaballapur',
      shelfLife: '10 – 14 days',
      size: '1.2 – 1.8 kg per head',
      certifications: ['FSSAI'],
      highlights: ['Crisp layered leaves', 'Low core ratio', 'Direct farm truckload'],
    },
    {
      id: 'prod-white-rice',
      sku: 'GRA-RAW-050',
      name: 'White Rice (Raw Sona Masoori)',
      category: 'grains',
      unit: 'Quintal',
      standardPrice: 4900,
      stock: '25.0 Quintal',
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80',
      description: 'Polished medium grain sona masoori rice, light and fluffy, standard for daily hotel meal thalis.',
      origin: 'Raichur / Kurnool',
      shelfLife: '18 Months',
      size: '5.2 mm medium grain',
      certifications: ['FSSAI', 'AGMARK'],
      highlights: ['Milled & de-stoned', 'Low starch stickiness', 'High volume swell'],
    },
    {
      id: 'prod-toor-dal',
      sku: 'PUL-TOO-050',
      name: 'Toor Dal (Unpolished Premium)',
      category: 'dals',
      unit: 'Quintal',
      standardPrice: 11000,
      stock: '18.4 Quintal',
      image: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80',
      description: 'Cleaned unpolished toor dal with zero water polish. Fast boiling with rich natural aroma.',
      origin: 'Gulbarga, Karnataka',
      shelfLife: '12 Months',
      size: 'Standard bold grain',
      certifications: ['FSSAI', 'AGMARK'],
      highlights: ['No synthetic polish', 'High protein yield', 'Uniform yellow color'],
    },
    {
      id: 'prod-oil',
      sku: 'OIL-SUN-015',
      name: 'Sunflower Oil (Commercial 15L Tin)',
      category: 'oils',
      unit: '15 Litre Tin',
      standardPrice: 1750,
      stock: '140 Tins',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
      description: 'Refined sunflower cooking oil fortified with Vitamin A & D. High smoke point for deep frying.',
      origin: 'Adani Wilmar Refineries',
      shelfLife: '9 Months',
      size: '15 Litre commercial tin',
      certifications: ['FSSAI', 'AGMARK'],
      highlights: ['Zero trans fats', 'High smoke point 232°C', 'Tamper-proof seal'],
    },
    {
      id: 'prod-sugar',
      sku: 'SUG-REF-050',
      name: 'Refined Sugar (Grade M-30)',
      category: 'sugar',
      unit: 'Quintal',
      standardPrice: 4300,
      stock: '30.0 Quintal',
      image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80',
      description: 'Sparkling white medium crystal cane sugar in 50 kg HDPE poly sacks.',
      origin: 'Belagavi, Karnataka',
      shelfLife: '24 Months',
      size: 'Medium grain M-30',
      certifications: ['FSSAI', 'ISI'],
      highlights: ['Dry moisture <= 0.04%', 'ICUMSA <= 100', '100% cane sugar'],
    },
  ];

  // Resolve customer specific price for each product
  const resolvedProducts = baseProducts.map(p => {
    let customerPrice = p.standardPrice;
    let isOverridden = false;

    if (p.id === 'prod-basmati') {
      customerPrice = activeCustomer.basmatiPrice;
      isOverridden = activeCustomer.basmatiPrice !== p.standardPrice;
    } else if (p.id === 'prod-white-rice') {
      customerPrice = activeCustomer.sonaPrice ? activeCustomer.sonaPrice * 2.6 : p.standardPrice;
    } else if (p.id === 'prod-toor-dal') {
      customerPrice = activeCustomer.toorPrice;
      isOverridden = activeCustomer.toorPrice !== p.standardPrice;
    } else if (p.id === 'prod-oil') {
      customerPrice = activeCustomer.oilPrice;
      isOverridden = activeCustomer.oilPrice !== p.standardPrice;
    } else if (p.id === 'prod-sugar') {
      customerPrice = activeCustomer.sugarPrice;
      isOverridden = activeCustomer.sugarPrice !== p.standardPrice;
    } else if (activeCustomer.id === 1) {
      // 5% default VIP discount on produce for GreenMart
      customerPrice = Math.round(p.standardPrice * 0.95);
      isOverridden = true;
    }

    const perKg = (customerPrice / 100).toFixed(2);

    return {
      ...p,
      customerPrice,
      effectivePerKg: perKg,
      isOverridden,
      discountPct: p.standardPrice > customerPrice ? Math.round(((p.standardPrice - customerPrice) / p.standardPrice) * 100) : 0,
    };
  });

  // Filtered Products
  const filteredProducts = resolvedProducts.filter(p => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'vegetables' && p.category === 'vegetables') ||
      (activeCategory === 'grains' && p.category === 'grains') ||
      (activeCategory === 'dals' && p.category === 'dals') ||
      (activeCategory === 'oils' && p.category === 'oils') ||
      (activeCategory === 'sugar' && p.category === 'sugar');

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any, quantity: number, packaging: string) => {
    const existingIndex = cart.findIndex(it => it.id === product.id && it.packaging === packaging);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.customerPrice,
        unit: product.unit,
        quantity,
        imageUrl: product.image,
        packaging,
      }]);
    }
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      const updated = [...cart];
      updated.splice(index, 1);
      setCart(updated);
    } else {
      const updated = [...cart];
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const cartSubtotal = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const cartGst = Math.round(cartSubtotal * 0.05);
  const deliveryCharge = cartSubtotal >= 10000 ? 0 : 450;
  const cartTotal = cartSubtotal + cartGst + deliveryCharge;

  const isCreditAllowed = activeCustomer.availableCredit >= cartTotal && activeCustomer.creditLimit > 0;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'credit' && !isCreditAllowed) {
      alert(`Order exceeds available credit limit of ₹${activeCustomer.availableCredit.toLocaleString('en-IN')}. Please settle outstanding balance or choose Advance NEFT payment.`);
      return;
    }

    const orderId = `FS-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      date: 'Just Now',
      itemsCount: cart.length,
      total: cartTotal,
      status: 'CONFIRMED',
      deliverySlot: 'Tomorrow Morning (06:00 AM - 09:00 AM)',
      payment: paymentMethod === 'credit' ? activeCustomer.creditPeriod : 'Advance Bank Transfer',
    };

    setCustomerOrders([newOrder, ...customerOrders]);
    setOrderConfirmed({
      orderId,
      total: cartTotal,
      customer: activeCustomer.name,
      paymentMethod: paymentMethod === 'credit' ? `Credit (${activeCustomer.creditPeriod})` : 'Advance NEFT / RTGS',
    });
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F9F8', display: 'flex', flexDirection: 'column', color: '#172B24' }}>
      
      {/* 1. TOP HEADER (Exact from Image 5) */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8E5',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Brand & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveView('catalog')}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900 }}>
              🌿
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                FreshSupply
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Wholesale Grocery for Businesses
              </span>
            </div>
          </div>

          {/* Quick Experience Toggle to Admin Console */}
          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              style={{
                marginLeft: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F1F5F9',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              ← Back to Admin Console
            </button>
          )}
        </div>

        {/* Global Search Bar with ⌘ K */}
        <div style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search for products, e.g., Tomato, Rice, Onion, Dal..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 40px 9px 38px',
              borderRadius: '10px',
              border: '1px solid #E2E8E5',
              backgroundColor: '#F8FAFC',
              fontSize: '0.85rem',
              color: '#172B24',
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.65rem', padding: '2px 5px', color: '#64748B', fontWeight: 700 }}>
            ⌘ K
          </span>
        </div>

        {/* Right Header Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Deliver Location Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#F1F5F3', borderRadius: '8px', border: '1px solid #E2E8E5', fontSize: '0.78rem', cursor: 'pointer' }}>
            <MapPin size={15} color="#047857" />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748B', lineHeight: 1 }}>Deliver to</div>
              <div style={{ fontWeight: 800, color: '#172B24' }}>Bengaluru – 560076 ▾</div>
            </div>
          </div>

          {/* Wholesale Customer Account Switcher (Demonstrating Customer Pricing) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Viewing As:</span>
            <select
              value={activeCustomerId}
              onChange={e => setActiveCustomerId(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #047857',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Available Credit Exposure Badge */}
          {activeCustomer.creditLimit > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px' }}>
              <CreditCard size={14} color="#047857" />
              <div>
                <div style={{ fontSize: '0.62rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Avail. Credit ({activeCustomer.creditPeriod})</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#047857' }}>
                  ₹{activeCustomer.availableCredit.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Notification Bell */}
          <button style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8E5', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={17} color="#64748B" />
            <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
          </button>

          {/* Wholesale Cart Pill */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: '#047857',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={17} />
            <span>Cart</span>
            <span style={{ backgroundColor: '#10B981', color: '#04140B', borderRadius: '9999px', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 900 }}>
              {cart.reduce((sum, it) => sum + it.quantity, 0)}
            </span>
          </button>

        </div>
      </header>

      {/* 2. BODY LAYOUT: Left Emerald Nav Sidebar + Main Content Grid (Exact from Image 5) */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Dark Emerald Sidebar (matching Image 5) */}
        <aside
          style={{
            width: '240px',
            backgroundColor: '#04281A',
            color: '#FFFFFF',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flexShrink: 0,
          }}
        >
          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => { setActiveView('catalog'); setActiveCategory('all'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeView === 'catalog' ? '#0E4830' : 'transparent',
                color: activeView === 'catalog' ? '#FFFFFF' : '#A7D4C0',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Layers size={18} />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveView('planner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeView === 'planner' ? '#0E4830' : 'transparent',
                color: activeView === 'planner' ? '#FFFFFF' : '#A7D4C0',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Calendar size={18} />
              <span>Bulk Planner</span>
            </button>

            <button
              onClick={() => setActiveView('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeView === 'orders' ? '#0E4830' : 'transparent',
                color: activeView === 'orders' ? '#FFFFFF' : '#A7D4C0',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Clock size={18} />
              <span>Order History</span>
            </button>

            <button
              onClick={() => setActiveView('lists')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeView === 'lists' ? '#0E4830' : 'transparent',
                color: activeView === 'lists' ? '#FFFFFF' : '#A7D4C0',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Bookmark size={18} />
              <span>Saved Lists</span>
            </button>
          </div>

          {/* Wholesale Trust & Value Cards (exact from Image 5 bottom sidebar) */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #0D3E2A', paddingTop: '18px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Truck size={18} color="#00E396" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF' }}>Bulk Sourcing</div>
                <div style={{ fontSize: '0.7rem', color: '#88B8A2', marginTop: '2px' }}>Direct from verified farms & mills</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Award size={18} color="#00E396" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF' }}>Consistent Quality</div>
                <div style={{ fontSize: '0.7rem', color: '#88B8A2', marginTop: '2px' }}>Graded & verified produce</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="#00E396" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF' }}>Better Wholesale Rates</div>
                <div style={{ fontSize: '0.7rem', color: '#88B8A2', marginTop: '2px' }}>For restaurants, cloud kitchens & retail</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* Phase 3 Buyer Toast Notification */}
          {toastMessage && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #10B981',
                color: '#065F46',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 6px rgba(4,120,87,0.08)',
              }}
            >
              <CheckCircle size={18} color="#047857" />
              <span>{toastMessage}</span>
            </div>
          )}

          {activeView === 'orders' ? (
            /* CUSTOMER ORDER HISTORY VIEW (Phase 3 1-Click Repeat & Cancellation) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Purchase Order History</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                    Track past shipments, download GST tax invoices, and repeat routine wholesale orders in 1 click.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customerOrders.map(ord => (
                  <div key={ord.id} className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#047857' }}>{ord.id}</span>
                        <span
                          style={{
                            backgroundColor: ord.status === 'CANCELLED' ? '#FEE2E2' : '#ECFDF5',
                            color: ord.status === 'CANCELLED' ? '#DC2626' : '#047857',
                            border: `1px solid ${ord.status === 'CANCELLED' ? '#FCA5A5' : '#10B981'}`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                        Ordered: {ord.date} &nbsp;|&nbsp; Payment: {ord.payment}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#172B24', marginTop: '4px' }}>
                        Delivery Slot: <strong>{ord.deliverySlot}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Order Total ({ord.itemsCount} SKUs)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#172B24' }}>
                        ₹{ord.total.toLocaleString('en-IN')}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* View Tax Invoice */}
                        <button
                          onClick={() => setInvoiceModalOrder({ id: ord.dbId || 84271, orderNumber: ord.id })}
                          style={{
                            fontSize: '0.75rem',
                            color: '#047857',
                            fontWeight: 700,
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FileText size={13} /> View GST Invoice
                        </button>

                        {/* 1-Click Repeat Order */}
                        {ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              if (ord.items && ord.items.length > 0) {
                                setCart(ord.items.map((it: any) => ({
                                  id: it.id,
                                  name: it.name,
                                  price: it.price,
                                  unit: it.unit,
                                  quantity: it.quantity,
                                  imageUrl: it.imageUrl,
                                  packaging: it.packaging || 'Standard Bulk',
                                })));
                                setIsCartOpen(true);
                                setToastMessage(`1-Click Repeat: Loaded ${ord.items.length} SKUs from ${ord.id} into cart!`);
                                setTimeout(() => setToastMessage(null), 4000);
                              }
                            }}
                            style={{
                              fontSize: '0.75rem',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              backgroundColor: '#047857',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 1px 2px rgba(4,120,87,0.2)',
                            }}
                          >
                            <RotateCcw size={13} /> 1-Click Repeat
                          </button>
                        )}

                        {/* Order Cancellation (Allowed for CONFIRMED or PENDING) */}
                        {(ord.status === 'CONFIRMED' || ord.status === 'PENDING') && (
                          <button
                            onClick={() => setCancelModalOrder(ord)}
                            style={{
                              fontSize: '0.75rem',
                              color: '#DC2626',
                              fontWeight: 700,
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeView === 'lists' ? (
            /* SAVED SHOPPING LISTS VIEW (Module 8) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#172B24' }}>Saved Shopping Lists</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    Recurring wholesale order templates configured for <strong>{activeCustomer.name}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (cart.length === 0) {
                      alert('Your wholesale cart is empty. Add produce or staples to cart first, then save it as a shopping list.');
                      return;
                    }
                    const listName = prompt('Enter a name for this recurring shopping list:');
                    if (listName) {
                      const newList = {
                        id: Date.now(),
                        name: listName,
                        description: `Custom kitchen list with ${cart.length} SKUs`,
                        isFrequent: false,
                        items: [...cart],
                      };
                      setSavedLists([newList, ...savedLists]);
                      setToastMessage(`Saved "${listName}" to your frequent lists.`);
                      setTimeout(() => setToastMessage(null), 4000);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Plus size={15} /> Save Current Cart as List
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                {savedLists.map((list) => {
                  const listEstTotal = list.items.reduce((s: number, it: any) => s + (it.price * it.quantity), 0);
                  return (
                    <div
                      key={list.id}
                      className="card"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8E5',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#172B24' }}>
                              {list.name}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                              {list.description}
                            </p>
                          </div>
                          {list.isFrequent && (
                            <span
                              style={{
                                backgroundColor: '#ECFDF5',
                                color: '#047857',
                                border: '1px solid #A7F3D0',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                            >
                              Frequent Daily
                            </span>
                          )}
                        </div>

                        {/* Items table preview */}
                        <div style={{ borderTop: '1px solid #F1F5F3', marginTop: '12px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {list.items.map((it: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={it.imageUrl} alt={it.name} style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                                <span style={{ fontWeight: 600, color: '#172B24' }}>{it.name}</span>
                              </div>
                              <div style={{ color: '#64748B' }}>
                                <strong>{it.quantity}</strong> {it.unit} @ ₹{it.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #E2E8E5', marginTop: '16px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Estimated Total ({list.items.length} SKUs)</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                            ₹{listEstTotal.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setCart(list.items.map((it: any) => ({
                              id: it.id,
                              name: it.name,
                              price: it.price,
                              unit: it.unit,
                              quantity: it.quantity,
                              imageUrl: it.imageUrl,
                              packaging: it.packaging || 'Standard Bulk',
                            })));
                            setIsCartOpen(true);
                            setToastMessage(`Loaded ${list.items.length} SKUs from "${list.name}" into wholesale cart.`);
                            setTimeout(() => setToastMessage(null), 4000);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#047857',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          <ShoppingBag size={14} /> Load into Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeView === 'planner' ? (
            /* BULK PLANNER VIEW */
            <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <Calendar size={48} color="#047857" style={{ margin: '0 auto 12px auto' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Weekly Wholesale Bulk Planner</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '500px', margin: '6px auto 20px auto' }}>
                Set up recurring scheduled deliveries of high-consumption perishables (tomatoes, onions, potatoes, rice, and cooking oils) for your kitchen branches.
              </p>
              <button onClick={() => setActiveView('catalog')} className="btn btn-primary">
                Browse Grocery Catalog
              </button>
            </div>
          ) : (
            /* MAIN PRODUCT CATALOG & STOREFRONT VIEW */
            <>
              {/* Top Hero Banner (Exact from Image 5) */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  minHeight: '160px',
                  backgroundColor: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '24px 32px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80"
                  alt="Produce banner"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
                />
                <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                    Wholesale Groceries for Your Business
                  </h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#00E396" /> Fresh & Graded
                    </span>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#00E396" /> Bulk Quantities
                    </span>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="#00E396" /> Reliable Supply
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Pills & Sort Bar (matching Image 5) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#172B24' }}>All Products</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Browse wholesale produce, staples, pulses, and kitchen essentials
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { id: 'all', label: 'All Products' },
                    { id: 'vegetables', label: 'Vegetables' },
                    { id: 'grains', label: 'Grains & Staples' },
                    { id: 'dals', label: 'Pulses & Dals' },
                    { id: 'oils', label: 'Cooking Oils' },
                    { id: 'sugar', label: 'Sugar & Salt' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: activeCategory === cat.id ? '1px solid #047857' : '1px solid #E2E8E5',
                        backgroundColor: activeCategory === cat.id ? '#ECFDF5' : '#FFFFFF',
                        color: activeCategory === cat.id ? '#047857' : '#64748B',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wholesale Products Grid (Exact from Image 5) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '18px',
                }}
              >
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="card hover-lift"
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setModalQty(10);
                      setPhotoIdx(0);
                    }}
                  >
                    {/* Top-Down Macro Dark Background Photo */}
                    <div style={{ position: 'relative', width: '100%', height: '160px', backgroundColor: '#0B1A13', overflow: 'hidden' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {prod.isOverridden && (
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#047857', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                          Negotiated Rate
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#172B24', lineHeight: 1.25 }}>
                        {prod.name}
                      </h3>

                      {/* Pricing Display */}
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#172B24' }}>
                            ₹{prod.customerPrice.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/ {prod.unit}</span>
                          {prod.standardPrice > prod.customerPrice && (
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: 'auto' }}>
                              ₹{prod.standardPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          ₹{prod.effectivePerKg} / Kg
                        </div>
                      </div>

                      {/* Live Stock & Add Bulk Button Strip */}
                      <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                          <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>
                            In Stock ({prod.stock})
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, 1, 'Bags (50 kg)');
                          }}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#047857',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Plus size={14} /> Add Bulk
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>

      {/* 3. PRODUCT DETAIL MODAL (Exact from Image 3) */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '16px',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '540px',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '0',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Image Carousel */}
            <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#000000' }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <ChevronLeft size={20} />
              </button>
              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00E396' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }}></span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Category Breadcrumb & Title */}
              <div>
                <span style={{ backgroundColor: 'rgba(0, 227, 150, 0.15)', color: '#00E396', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                  {selectedProduct.category} &gt; {selectedProduct.name.split(' ')[0]}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF' }}>{selectedProduct.name}</h2>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                      Farm Fresh • Uniform Size • Moisture &le; 12%
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', border: '1px solid #F59E0B', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FCD34D' }}>
                    <Award size={18} />
                    <span style={{ fontSize: '0.55rem', fontWeight: 900 }}>Grade A</span>
                  </div>
                </div>
              </div>

              {/* Specs 4-Pill Grid (matching Image 3) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#1E293B', padding: '10px 12px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Origin</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>{selectedProduct.origin.split('/')[0]}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Avg. Size</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>{selectedProduct.size}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Moisture</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>&le; 12%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Shelf Life</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>{selectedProduct.shelfLife}</div>
                </div>
              </div>

              {/* Quality Certifications & Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', borderTop: '1px solid #1E293B', paddingTop: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E396', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <ShieldCheck size={14} /> Quality Assurance
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedProduct.certifications.map((cert: string) => (
                      <span key={cert} style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E396', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <CheckCircle size={14} /> Product Highlights
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {selectedProduct.highlights.map((h: string) => (
                      <div key={h}>✓ {h}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Packaging Type Selector */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '6px' }}>
                  Packaging Type
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setModalPackaging('bags')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: modalPackaging === 'bags' ? '1px solid #00E396' : '1px solid #334155',
                      backgroundColor: modalPackaging === 'bags' ? '#00E396' : '#1E293B',
                      color: modalPackaging === 'bags' ? '#06170E' : '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Bags (50 kg)
                  </button>
                  <button
                    onClick={() => setModalPackaging('crates')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: modalPackaging === 'crates' ? '1px solid #00E396' : '1px solid #334155',
                      backgroundColor: modalPackaging === 'crates' ? '#00E396' : '#1E293B',
                      color: modalPackaging === 'crates' ? '#06170E' : '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Crates (20 kg)
                  </button>
                </div>
              </div>

              {/* Wholesale Tiered Pricing Table (Exact from Image 3) */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E396', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Layers size={14} /> Wholesale Pricing ({modalPackaging === 'bags' ? 'Bags – 50 kg each' : 'Crates – 20 kg each'})
                </div>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '6px 4px' }}>Order Quantity</th>
                      <th style={{ padding: '6px 4px' }}>Price per Unit</th>
                      <th style={{ padding: '6px 4px', textAlign: 'right' }}>Effective Rate / Kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '6px 4px' }}>1 – 9 Units</td>
                      <td style={{ padding: '6px 4px', fontWeight: 800 }}>₹{selectedProduct.customerPrice.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{selectedProduct.effectivePerKg} / kg</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '6px 4px' }}>10 – 49 Units <span style={{ color: '#00E396', fontSize: '0.68rem', fontWeight: 700 }}>3% Off</span></td>
                      <td style={{ padding: '6px 4px', fontWeight: 800 }}>₹{Math.round(selectedProduct.customerPrice * 0.97).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{(Number(selectedProduct.effectivePerKg) * 0.97).toFixed(2)} / kg</td>
                    </tr>
                    <tr style={{ backgroundColor: 'rgba(0, 227, 150, 0.1)', color: '#00E396', fontWeight: 800 }}>
                      <td style={{ padding: '6px 4px' }}>&ge; 50 Units <span style={{ color: '#00E396', fontSize: '0.68rem', fontWeight: 700 }}>6% Off</span></td>
                      <td style={{ padding: '6px 4px' }}>₹{Math.round(selectedProduct.customerPrice * 0.94).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{(Number(selectedProduct.effectivePerKg) * 0.94).toFixed(2)} / kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stock and Dispatch Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid #1E293B', paddingTop: '10px' }}>
                <span style={{ color: '#00E396', fontWeight: 700 }}>● In Stock ({selectedProduct.stock} available)</span>
                <span style={{ color: '#94A3B8' }}>🚚 Next Day Dispatch (05:00 AM)</span>
              </div>

              {/* Quantity Stepper & Add to Wholesale Cart Button */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: '10px', padding: '4px' }}>
                  <button
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: '#334155', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ width: '48px', textAlign: 'center', fontWeight: 900, fontSize: '1rem', color: '#FFFFFF' }}>
                    {modalQty}
                  </span>
                  <button
                    onClick={() => setModalQty(modalQty + 1)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: '#334155', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct, modalQty, modalPackaging === 'bags' ? 'Bags (50 kg)' : 'Crates (20 kg)');
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#00E396',
                    color: '#06170E',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 227, 150, 0.4)',
                  }}
                >
                  <ShoppingBag size={18} /> Add to Wholesale Cart
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. SHOPPING CART & CHECKOUT SLIDE-OUT DRAWER */}
      {isCartOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 70,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setIsCartOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Wholesale Cart</h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Account: <strong>{activeCustomer.name}</strong> ({activeCustomer.priceList})
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                  <p style={{ fontWeight: 700 }}>Your wholesale cart is empty</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Add wholesale items from the produce catalog</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '54px', height: '54px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.packaging}</div>
                      <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.85rem', marginTop: '2px' }}>
                        ₹{item.price.toLocaleString('en-IN')} / {item.unit}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateCartQuantity(idx, item.quantity - 1)} style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>-</button>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(idx, item.quantity + 1)} style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Section */}
            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid #E2E8E5', padding: '18px 24px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Cost Breakdown */}
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Subtotal:</span>
                    <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>GST (5% wholesale itemized):</span>
                    <span>₹{cartGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Reefer Logistics:</span>
                    <span style={{ color: deliveryCharge === 0 ? '#10B981' : '#172B24' }}>
                      {deliveryCharge === 0 ? 'FREE (Above ₹10,000)' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.05rem', color: '#172B24', borderTop: '1px solid #CBD5E1', paddingTop: '6px' }}>
                    <span>Total Order Amount:</span>
                    <span style={{ color: '#047857' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Payment Method Selector with Credit Validation */}
                <div style={{ borderTop: '1px solid #E2E8E5', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#172B24', marginBottom: '6px' }}>
                    Payment Terms
                  </div>
                  
                  {activeCustomer.creditLimit > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', padding: '8px', borderRadius: '8px', border: paymentMethod === 'credit' ? '1px solid #047857' : '1px solid #E2E8E5', backgroundColor: paymentMethod === 'credit' ? '#ECFDF5' : '#FFFFFF' }}>
                        <input type="radio" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: '#047857' }}>Credit Purchase ({activeCustomer.creditPeriod})</div>
                          <div style={{ fontSize: '0.7rem', color: isCreditAllowed ? '#047857' : '#DC2626' }}>
                            {isCreditAllowed
                              ? `Avail. balance ₹${activeCustomer.availableCredit.toLocaleString('en-IN')} (Sufficient)`
                              : `Insufficient credit! Avail. ₹${activeCustomer.availableCredit.toLocaleString('en-IN')}`}
                          </div>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', padding: '8px', borderRadius: '8px', border: paymentMethod === 'neft' ? '1px solid #047857' : '1px solid #E2E8E5', backgroundColor: paymentMethod === 'neft' ? '#ECFDF5' : '#FFFFFF' }}>
                        <input type="radio" checked={paymentMethod === 'neft'} onChange={() => setPaymentMethod('neft')} />
                        <div>
                          <div style={{ fontWeight: 800 }}>Advance Bank Transfer (NEFT / RTGS)</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Direct warehouse virtual account settlement</div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                      Standard Wholesale Account: Advance RTGS / NEFT transfer required before dispatch.
                    </div>
                  )}
                </div>

                {/* Checkout Submit Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={paymentMethod === 'credit' && !isCreditAllowed}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: paymentMethod === 'credit' && !isCreditAllowed ? '#CBD5E1' : '#047857',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: paymentMethod === 'credit' && !isCreditAllowed ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Place Wholesale Order</span>
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. ORDER CONFIRMATION MODAL */}
      {orderConfirmed && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#172B24' }}>Wholesale Order Confirmed!</h2>
            <div style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 800, marginTop: '4px' }}>
              Order #{orderConfirmed.orderId}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '10px', lineHeight: 1.4 }}>
              Inventory has been locked and dispatch reserved at Bangalore Central Hub for <strong>{orderConfirmed.customer}</strong>.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', margin: '18px 0', textAlign: 'left', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Order Amount:</span>
                <strong>₹{orderConfirmed.total.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payment Terms:</span>
                <span style={{ color: '#047857', fontWeight: 700 }}>{orderConfirmed.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Scheduled Dispatch:</span>
                <span>Tomorrow 05:00 AM – 08:00 AM</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  setInvoiceModalOrder({ id: 84271, orderNumber: orderConfirmed.orderId });
                }}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  borderColor: '#047857',
                  color: '#047857',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={15} /> View Official GST Tax Invoice
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setOrderConfirmed(null);
                    setActiveView('orders');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Track Order
                </button>
                <button
                  onClick={() => setOrderConfirmed(null)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Continue Ordering
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authoritative GST Tax Invoice Printable Modal */}
      {invoiceModalOrder && (
        <GstInvoiceModal
          orderId={invoiceModalOrder.id}
          orderNumber={invoiceModalOrder.orderNumber}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}

      {/* Customer Cancellation Request Modal (Module 8) */}
      {cancelModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setCancelModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                  <AlertCircle size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#DC2626' }}>
                  Cancel Order #{cancelModalOrder.id}
                </h3>
              </div>
              <button onClick={() => setCancelModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.4 }}>
              Commercial orders can be cancelled self-service before dispatch departure. Any reserved credit will be restored to your credit limit.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#172B24', marginBottom: '6px' }}>
                Cancellation Reason
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <option value="Menu plan changed / overstocked">Menu plan changed / overstocked</option>
                <option value="Incorrect quantity entered by store manager">Incorrect quantity entered by store manager</option>
                <option value="Delivery slot adjustment needed">Delivery slot adjustment needed</option>
                <option value="Found alternate local procurement">Found alternate local procurement</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Keep Order
              </button>
              <button
                onClick={() => {
                  const updated = customerOrders.map(o => o.id === cancelModalOrder.id ? { ...o, status: 'CANCELLED' } : o);
                  setCustomerOrders(updated);
                  setToastMessage(`Order #${cancelModalOrder.id} successfully cancelled. Credit reservation released.`);
                  setCancelModalOrder(null);
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

