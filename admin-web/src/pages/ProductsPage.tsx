import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  Building2,
  Layers,
} from 'lucide-react';
import { api } from '../api/client';
import { ProductDetailModal } from '../components/ProductDetailModal';

// Comprehensive B2B Wholesale Grocery Catalog (Section 3 of specification)
export const groceryCatalogData = [
  // A. Fruits & Vegetables
  {
    id: 1,
    sku: 'VEG-TOM-025',
    name: 'Hybrid Salad Tomatoes (Crimson Grade)',
    category: 'Fruits & Vegetables',
    subcategory: 'Vegetables',
    brand: 'FarmDirect Agro',
    price: 3800,
    costPrice: 3100,
    stockQuantity: 85,
    unit: 'Crate (25 kg)',
    packSize: '25 kg Crate',
    unitType: 'Kg',
    ratePerUnit: 38.00,
    minOrderQty: 2,
    stockStatus: 'in_stock',
    supplier: 'Kolar APMC Farmers Co-op',
    gstRate: '0%',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 2,
    sku: 'VEG-ONI-050',
    name: 'Nashik Red Sautéing Onions (Grade-A)',
    category: 'Fruits & Vegetables',
    subcategory: 'Vegetables',
    brand: 'Lasalgaon Mandi Direct',
    price: 2200,
    costPrice: 1800,
    stockQuantity: 140,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Jute Sack',
    unitType: 'Kg',
    ratePerUnit: 22.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Nashik Agro Federation',
    gstRate: '0%',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 3,
    sku: 'VEG-POT-050',
    name: 'Jyoti Fresh Cooking Potatoes',
    category: 'Fruits & Vegetables',
    subcategory: 'Vegetables',
    brand: 'Agra Farm Gold',
    price: 2600,
    costPrice: 2100,
    stockQuantity: 120,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Bag',
    unitType: 'Kg',
    ratePerUnit: 26.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Hassan Cold Hub',
    gstRate: '0%',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 4,
    sku: 'FRU-APP-020',
    name: 'Kinnaur Royal Crisp Apples (Carton)',
    category: 'Fruits & Vegetables',
    subcategory: 'Fruits',
    brand: 'Himachal Orchards',
    price: 3600,
    costPrice: 2950,
    stockQuantity: 45,
    unit: 'Carton (20 kg)',
    packSize: '20 kg Foam Padded Carton',
    unitType: 'Kg',
    ratePerUnit: 180.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Shimla Cold Chain Ltd',
    gstRate: '0%',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // B. Rice & Grains
  {
    id: 5,
    sku: 'RCE-BAS-1121',
    name: 'Aged 1121 Royal Basmati Rice (2-Yr Matured)',
    category: 'Rice & Grains',
    subcategory: 'Rice',
    brand: 'Dawat Heritage Reserve',
    price: 7800,
    costPrice: 6500,
    stockQuantity: 200,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Double Jute Sack',
    unitType: 'Kg',
    ratePerUnit: 78.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Karnal Rice Mills Ltd',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 6,
    sku: 'RCE-SON-050',
    name: 'Sona Masoori Raw Rice (Steam Aged)',
    category: 'Rice & Grains',
    subcategory: 'Rice',
    brand: 'Kaveri Pure Gold',
    price: 3100,
    costPrice: 2650,
    stockQuantity: 180,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Woven Sack',
    unitType: 'Kg',
    ratePerUnit: 62.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Raichur Grain Processors',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 7,
    sku: 'GRN-WHT-050',
    name: 'Sharbati Whole Wheat Grains (Cleaned)',
    category: 'Rice & Grains',
    subcategory: 'Wheat & Flour',
    brand: 'Sehore Farm Gold',
    price: 2450,
    costPrice: 2050,
    stockQuantity: 15,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Polypropylene Sack',
    unitType: 'Kg',
    ratePerUnit: 49.00,
    minOrderQty: 2,
    stockStatus: 'low_stock',
    supplier: 'MP Grain Wholesalers',
    gstRate: '0%',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // C. Pulses & Dals
  {
    id: 8,
    sku: 'DAL-TOR-050',
    name: 'Unpolished Toor Dal (Desi Fatka)',
    category: 'Pulses & Dals',
    subcategory: 'Dals',
    brand: 'Tata Sampann B2B Bulk',
    price: 7400,
    costPrice: 6600,
    stockQuantity: 90,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Multi-ply Sack',
    unitType: 'Kg',
    ratePerUnit: 148.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Gulbarga Pulse Hub',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 9,
    sku: 'DAL-MNG-050',
    name: 'Yellow Moong Dal Split (Washed)',
    category: 'Pulses & Dals',
    subcategory: 'Dals',
    brand: 'Aashirvaad Commercial',
    price: 5800,
    costPrice: 5100,
    stockQuantity: 70,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Bag',
    unitType: 'Kg',
    ratePerUnit: 116.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Indore Dal Mills Co.',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // D. Cooking Oils & Ghee
  {
    id: 10,
    sku: 'OIL-SUN-015',
    name: 'Refined Sunflower Cooking Oil (15L Tin)',
    category: 'Cooking Oils & Ghee',
    subcategory: 'Edible Oils',
    brand: 'Fortune Commercial Pro',
    price: 1980,
    costPrice: 1760,
    stockQuantity: 160,
    unit: 'Tin (15 Litres)',
    packSize: '15L Tamper-Proof Tin',
    unitType: 'Litre',
    ratePerUnit: 132.00,
    minOrderQty: 2,
    stockStatus: 'in_stock',
    supplier: 'Adani Wilmar Bulk Depot',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 11,
    sku: 'GHE-DSG-015',
    name: 'Pure Cow Desi Ghee (15 Kg Commercial Tin)',
    category: 'Cooking Oils & Ghee',
    subcategory: 'Ghee',
    brand: 'Amul Sagar Professional',
    price: 8400,
    costPrice: 7550,
    stockQuantity: 40,
    unit: 'Tin (15 kg)',
    packSize: '15 kg Heavy Metal Tin',
    unitType: 'Kg',
    ratePerUnit: 560.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Gujarat Co-operative Milk Federation',
    gstRate: '12%',
    imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // E. Spices & Masalas
  {
    id: 12,
    sku: 'SPI-CHL-025',
    name: 'Stemless Guntur Teja Red Chillies (Whole)',
    category: 'Spices & Masalas',
    subcategory: 'Whole Spices',
    brand: 'Guntur Spice Yards',
    price: 6000,
    costPrice: 5200,
    stockQuantity: 36,
    unit: 'Bale (25 kg)',
    packSize: '25 kg Compressed Jute Bale',
    unitType: 'Kg',
    ratePerUnit: 240.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'AP Spices Development Corp',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 13,
    sku: 'SPI-TUR-025',
    name: 'Salem Pure Turmeric Powder (Curcumin 3.2%)',
    category: 'Spices & Masalas',
    subcategory: 'Ground Spices',
    brand: 'Everest Food Service',
    price: 3750,
    costPrice: 3200,
    stockQuantity: 5,
    unit: 'Bag (25 kg)',
    packSize: '25 kg Moisture Sealed Bag',
    unitType: 'Kg',
    ratePerUnit: 150.00,
    minOrderQty: 1,
    stockStatus: 'low_stock',
    supplier: 'Erode Turmeric Trading Hub',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // F. Sugar, Salt & Sweeteners
  {
    id: 14,
    sku: 'SWT-SGR-050',
    name: 'Refined White Sulphurless Sugar (M-30)',
    category: 'Sugar, Salt & Sweeteners',
    subcategory: 'Sugar',
    brand: 'Dhampure Commercial',
    price: 2150,
    costPrice: 1900,
    stockQuantity: 110,
    unit: 'Bag (50 kg)',
    packSize: '50 kg Lined Jute Bag',
    unitType: 'Kg',
    ratePerUnit: 43.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Kolhapur Sugar Mills',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // G. Dairy & Refrigerated Products
  {
    id: 15,
    sku: 'DAI-PAN-005',
    name: 'Fresh Malai Paneer Blocks (Commercial 24% Fat)',
    category: 'Dairy & Refrigerated Products',
    subcategory: 'Paneer & Cheese',
    brand: 'Nandini Dairy Pro',
    price: 1800,
    costPrice: 1520,
    stockQuantity: 42,
    unit: 'Block (5 kg)',
    packSize: '5 kg Vacuum Shrink Wrap',
    unitType: 'Kg',
    ratePerUnit: 360.00,
    minOrderQty: 2,
    stockStatus: 'in_stock',
    supplier: 'Karnataka Milk Federation',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // H. Packaged Foods & Beverages
  {
    id: 16,
    sku: 'PKG-TEA-020',
    name: 'Assam CTC Premium Dust Tea (Bulk Bag)',
    category: 'Packaged Foods & Beverages',
    subcategory: 'Tea & Coffee',
    brand: 'Red Label Food Service',
    price: 5600,
    costPrice: 4800,
    stockQuantity: 30,
    unit: 'Bag (20 kg)',
    packSize: '20 kg Foil Lined Sack',
    unitType: 'Kg',
    ratePerUnit: 280.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Guwahati Tea Auction Hub',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // I. Snacks & Dry Fruits
  {
    id: 17,
    sku: 'DRY-ALM-010',
    name: 'California Almonds Whole (Nonpareil 27/30)',
    category: 'Snacks & Dry Fruits',
    subcategory: 'Dry Fruits',
    brand: 'NutriWholesale USA',
    price: 6800,
    costPrice: 6050,
    stockQuantity: 55,
    unit: 'Carton (10 kg)',
    packSize: '10 kg Vacuum Packed Box',
    unitType: 'Kg',
    ratePerUnit: 680.00,
    minOrderQty: 1,
    stockStatus: 'in_stock',
    supplier: 'Dry Fruit Importers Ltd',
    gstRate: '12%',
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },

  // J. Frozen & Other Essentials
  {
    id: 18,
    sku: 'FRZ-PEA-020',
    name: 'IQF Frozen Sweet Green Peas (Export Grade)',
    category: 'Frozen & Other Essentials',
    subcategory: 'Frozen Vegetables',
    brand: 'Safal Cold Kitchen',
    price: 2400,
    costPrice: 2000,
    stockQuantity: 0,
    unit: 'Bag (20 kg)',
    packSize: '20 kg Insulated Cold Bag',
    unitType: 'Kg',
    ratePerUnit: 120.00,
    minOrderQty: 1,
    stockStatus: 'out_of_stock',
    supplier: 'Mother Dairy Cold Chain',
    gstRate: '5%',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>(groceryCatalogData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);

  // Admin CRUD Modal State
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Fruits & Vegetables',
    subcategory: 'Vegetables',
    brand: '',
    unit: 'Bag (50 kg)',
    packSize: '50 kg Bag',
    unitType: 'Kg',
    ratePerUnit: 0,
    price: '',
    costPrice: '',
    stockQuantity: 50,
    stockStatus: 'in_stock',
    supplier: '',
    gstRate: '5%',
    imageUrl: '',
  });

  const categoryOptions = [
    'All',
    'Fruits & Vegetables',
    'Rice & Grains',
    'Pulses & Dals',
    'Cooking Oils & Ghee',
    'Spices & Masalas',
    'Sugar, Salt & Sweeteners',
    'Dairy & Refrigerated Products',
    'Packaged Foods & Beverages',
    'Snacks & Dry Fruits',
    'Frozen & Other Essentials',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { label: 'In Stock', bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'low_stock':
        return { label: 'Low Stock', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'out_of_stock':
        return { label: 'Out of Stock', bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      case 'expiring_soon':
        return { label: 'Expiring Soon', bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' };
      default:
        return { label: 'Active', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'Fruits & Vegetables',
      subcategory: 'Vegetables',
      brand: 'FreshSupply Select',
      unit: 'Bag (50 kg)',
      packSize: '50 kg Bag',
      unitType: 'Kg',
      ratePerUnit: 50,
      price: '2500',
      costPrice: '2100',
      stockQuantity: 100,
      stockStatus: 'in_stock',
      supplier: 'APMC Regional Hub',
      gstRate: '5%',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    });
    setCrudModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || '',
      brand: p.brand || '',
      unit: p.unit,
      packSize: p.packSize || '',
      unitType: p.unitType || 'Kg',
      ratePerUnit: p.ratePerUnit || 0,
      price: p.price?.toString() || '',
      costPrice: p.costPrice?.toString() || '',
      stockQuantity: p.stockQuantity ?? 50,
      stockStatus: p.stockStatus || 'in_stock',
      supplier: p.supplier || '',
      gstRate: p.gstRate || '5%',
      imageUrl: p.imageUrl || '',
    });
    setCrudModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...formData,
                price: parseFloat(formData.price),
                costPrice: parseFloat(formData.costPrice),
                stockQuantity: parseInt(formData.stockQuantity.toString(), 10),
              }
            : p
        )
      );
    } else {
      const newProd = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        stockQuantity: parseInt(formData.stockQuantity.toString(), 10),
        isActive: true,
      };
      setProducts([newProd, ...products]);
    }
    setCrudModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Top Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em' }}>
            Products &amp; Master Catalog
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
            B2B wholesale inventory spanning all 10 core grocery categories, pack sizes &amp; quantity slabs
          </p>
        </div>

        {/* View Toggle & Add SKU CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', backgroundColor: '#FFFFFF', border: '1px solid #E2E8E5', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => setViewLayout('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewLayout === 'grid' ? '#ECFDF5' : 'transparent',
                color: viewLayout === 'grid' ? '#047857' : '#64748B',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewLayout('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewLayout === 'table' ? '#ECFDF5' : 'transparent',
                color: viewLayout === 'table' ? '#047857' : '#64748B',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <TableIcon size={15} />
              <span>Table</span>
            </button>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Search Bar + Horizontal Category Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Search & Meta Count Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter by product name, SKU or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.825rem' }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> Grocery SKUs
          </div>
        </div>

        {/* 10 Grocery Category Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '6px',
            width: '100%',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {categoryOptions.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #047857' : '1px solid #E2E8E5',
                  backgroundColor: isActive ? '#047857' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 2px rgba(4, 120, 87, 0.2)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: PRODUCT GRID (Responsive 4-col -> 2-col -> 1-col)     */}
      {/* ============================================================== */}
      {viewLayout === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
            width: '100%',
          }}
        >
          {filteredProducts.map((p) => {
            const status = getStatusBadge(p.stockStatus);
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Product Thumbnail Header */}
                <div
                  style={{
                    position: 'relative',
                    height: '160px',
                    backgroundColor: '#F8FAFC',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedProductForModal(p)}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Category Pill Tag */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(4px)',
                      color: '#047857',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8E5',
                    }}
                  >
                    {p.subcategory || p.category}
                  </span>

                  {/* Stock Status Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: status.bg,
                      color: status.text,
                      border: `1px solid ${status.border}`,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Details Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div>
                    {p.brand && (
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        {p.brand}
                      </div>
                    )}
                    <h3
                      onClick={() => setSelectedProductForModal(p)}
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#172B24',
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        marginTop: '2px',
                      }}
                    >
                      {p.name}
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      SKU: {p.sku} &nbsp;|&nbsp; GST: {p.gstRate}
                    </div>
                  </div>

                  {/* Packaging & Pricing */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid #EDF2F0',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {p.unit}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                        ₹{Number(p.ratePerUnit || (p.price / 50)).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        per {p.unitType}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedProductForModal(p)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      backgroundColor: '#ECFDF5',
                      color: '#047857',
                      borderColor: '#A7F3D0',
                      fontWeight: 700,
                    }}
                  >
                    + Add Bulk / Slabs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 2: ENTERPRISE SKU DATA TABLE                              */
        /* ============================================================== */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product &amp; Brand</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Packaging Unit</th>
                <th>Wholesale Price</th>
                <th>Effective Rate</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const status = getStatusBadge(p.stockStatus);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#172B24' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {p.brand ? `${p.brand} • ` : ''}GST: {p.gstRate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{p.sku}</td>
                    <td>{p.unit}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#172B24' }}>
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#047857', fontWeight: 600 }}>
                      ₹{Number(p.ratePerUnit || (p.price / 50)).toFixed(2)} / {p.unitType}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {p.stockQuantity} units
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setSelectedProductForModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#047857' }}
                          title="View Bulk Pricing Tiers"
                        >
                          Tiers
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Detail Modal (Image 3) */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={(qty, packType) => {
            alert(`Added ${qty} ${packType} of ${selectedProductForModal.name} to order!`);
          }}
        />
      )}

      {/* Admin CRUD Modal */}
      {crudModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>
                {editingProduct ? 'Edit Grocery SKU' : 'Add New Grocery Product'}
              </h2>
              <button onClick={() => setCrudModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">SKU Code *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categoryOptions.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Brand / Manufacturer</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Packaging Unit *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Bag (50 kg), Tin (15L), Carton"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Unit of Measure (UOM)</label>
                    <select
                      className="form-select"
                      value={formData.unitType}
                      onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    >
                      <option value="Kg">Kg</option>
                      <option value="Gram">Gram</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Litre">Litre</option>
                      <option value="ML">ML</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Boxes">Boxes</option>
                      <option value="Cartons">Cartons</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label">Wholesale Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Cost Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Available Stock *</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Product Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setCrudModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
