import React, { useEffect, useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  History,
  CheckCircle,
  X,
  Search,
  Filter,
  Calendar,
  Warehouse,
  Clock,
  TrendingDown,
  Layers,
  ChevronDown,
  Download,
  Plus,
} from 'lucide-react';
import { api } from '../api/client';

interface GroceryInventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  image: string;
  unit: string;
  pack_size: string;
  warehouse: string;
  location_bay: string;
  batch_number: string;
  expiry_date: string;
  stock_quantity: number;
  reorder_level: number;
  cost_price: number;
  stock_valuation: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon';
}

const groceryInventorySeed: GroceryInventoryItem[] = [
  {
    id: 1,
    sku: 'VEG-TOM-025',
    name: 'Hybrid Salad Tomatoes (Crimson Grade)',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100',
    unit: 'Crate (25 kg)',
    pack_size: '25 kg Uniform Crate',
    warehouse: 'Central Cold Chain Hub (BLR)',
    location_bay: 'Cold Zone A-04',
    batch_number: 'BCH-TOM-8921',
    expiry_date: 'Oct 14, 2026',
    stock_quantity: 14,
    reorder_level: 25,
    cost_price: 750,
    stock_valuation: 10500,
    status: 'low_stock',
  },
  {
    id: 2,
    sku: 'VEG-ONI-050',
    name: 'Nashik Red Sautéing Onions',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100',
    unit: 'Bag (50 kg)',
    pack_size: '50 kg Jute Bag',
    warehouse: 'Peenya Fulfillment Center',
    location_bay: 'Ventilated Shed B-12',
    batch_number: 'BCH-ONI-4432',
    expiry_date: 'Nov 20, 2026',
    stock_quantity: 118,
    reorder_level: 40,
    cost_price: 1550,
    stock_valuation: 182900,
    status: 'in_stock',
  },
  {
    id: 3,
    sku: 'GRP-RIC-050',
    name: 'Aged 1121 Royal Basmati Rice (XXL Grain)',
    category: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100',
    unit: 'Bag (50 kg)',
    pack_size: '50 kg Moisture-Proof Bag',
    warehouse: 'Ambient Dry Goods Silo 4',
    location_bay: 'Silo Bay 3-D',
    batch_number: 'BCH-RIC-9002',
    expiry_date: 'Sep 30, 2027',
    stock_quantity: 240,
    reorder_level: 50,
    cost_price: 3600,
    stock_valuation: 864000,
    status: 'in_stock',
  },
  {
    id: 4,
    sku: 'GRP-SON-050',
    name: 'Premium Sona Masoori Raw Rice',
    category: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=100',
    unit: 'Bag (50 kg)',
    pack_size: '50 kg Bag',
    warehouse: 'Ambient Dry Goods Silo 4',
    location_bay: 'Silo Bay 1-A',
    batch_number: 'BCH-SON-7128',
    expiry_date: 'Aug 15, 2027',
    stock_quantity: 180,
    reorder_level: 40,
    cost_price: 2400,
    stock_valuation: 432000,
    status: 'in_stock',
  },
  {
    id: 5,
    sku: 'PUL-TOO-050',
    name: 'Desi Fatka Unpolished Toor Dal',
    category: 'Pulses & Dals',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100',
    unit: 'Bag (50 kg)',
    pack_size: '50 kg Gunny Sack',
    warehouse: 'Peenya Fulfillment Center',
    location_bay: 'Dry Rack D-08',
    batch_number: 'BCH-TOO-3312',
    expiry_date: 'Dec 10, 2026',
    stock_quantity: 65,
    reorder_level: 30,
    cost_price: 6600,
    stock_valuation: 429000,
    status: 'in_stock',
  },
  {
    id: 6,
    sku: 'PUL-MOO-050',
    name: 'Yellow Washed Moong Dal Special',
    category: 'Pulses & Dals',
    image: 'https://images.unsplash.com/photo-1585994192700-4e16104b60b9?w=100',
    unit: 'Bag (50 kg)',
    pack_size: '50 kg Bag',
    warehouse: 'Peenya Fulfillment Center',
    location_bay: 'Dry Rack D-09',
    batch_number: 'BCH-MOO-2109',
    expiry_date: 'Oct 28, 2026',
    stock_quantity: 8,
    reorder_level: 25,
    cost_price: 5400,
    stock_valuation: 43200,
    status: 'low_stock',
  },
  {
    id: 7,
    sku: 'OIL-SUN-015',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    category: 'Cooking Oils & Ghee',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100',
    unit: 'Tin (15 Litres)',
    pack_size: '15L Sealed Metal Tin',
    warehouse: 'Whitefield Logistics Depot',
    location_bay: 'Oil Storage Bay O-2',
    batch_number: 'BCH-OIL-5521',
    expiry_date: 'Apr 18, 2027',
    stock_quantity: 95,
    reorder_level: 20,
    cost_price: 1580,
    stock_valuation: 150100,
    status: 'in_stock',
  },
  {
    id: 8,
    sku: 'DAI-PAN-005',
    name: 'Fresh Vacuum Malai Paneer Blocks',
    category: 'Dairy & Refrigerated Products',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100',
    unit: 'Block (5 kg)',
    pack_size: '5 kg Vacuum Tub',
    warehouse: 'Central Cold Chain Hub (BLR)',
    location_bay: 'Dairy Chiller C-02 (2°C-4°C)',
    batch_number: 'BCH-PAN-9810',
    expiry_date: 'Oct 09, 2026',
    stock_quantity: 22,
    reorder_level: 15,
    cost_price: 1750,
    stock_valuation: 38500,
    status: 'expiring_soon',
  },
  {
    id: 9,
    sku: 'DAI-BUT-020',
    name: 'Amul Salted Table Butter Bulk Crate',
    category: 'Dairy & Refrigerated Products',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100',
    unit: 'Carton (20 kg)',
    pack_size: '40 x 500g Packs',
    warehouse: 'Central Cold Chain Hub (BLR)',
    location_bay: 'Cold Zone C-05',
    batch_number: 'BCH-BUT-1102',
    expiry_date: 'Nov 12, 2026',
    stock_quantity: 0,
    reorder_level: 10,
    cost_price: 9400,
    stock_valuation: 0,
    status: 'out_of_stock',
  },
  {
    id: 10,
    sku: 'SPI-CHI-025',
    name: 'Guntur Stemless High Pungency Red Chilli',
    category: 'Spices & Masalas',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=100',
    unit: 'Bag (25 kg)',
    pack_size: '25 kg Bag',
    warehouse: 'Ambient Dry Goods Silo 4',
    location_bay: 'Spice Vault S-01',
    batch_number: 'BCH-CHI-3881',
    expiry_date: 'Jun 22, 2027',
    stock_quantity: 42,
    reorder_level: 15,
    cost_price: 6250,
    stock_valuation: 262500,
    status: 'in_stock',
  },
  {
    id: 11,
    sku: 'SUG-M30-050',
    name: 'Refined Sparkling White Sugar (M-30)',
    category: 'Sugar, Salt & Sweeteners',
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=100',
    unit: 'Bag (50 kg)',
    pack_size: '50 kg Bag',
    warehouse: 'Ambient Dry Goods Silo 4',
    location_bay: 'Sugar Bay SB-03',
    batch_number: 'BCH-SUG-6229',
    expiry_date: 'Aug 30, 2028',
    stock_quantity: 320,
    reorder_level: 60,
    cost_price: 1950,
    stock_valuation: 624000,
    status: 'in_stock',
  },
  {
    id: 12,
    sku: 'FRZ-PEA-030',
    name: 'IQF Sweet Garden Green Peas',
    category: 'Frozen & Other Essentials',
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=100',
    unit: 'Carton (30 kg)',
    pack_size: '6 x 5 kg Sub-Packs',
    warehouse: 'Central Cold Chain Hub (BLR)',
    location_bay: 'Deep Freeze F-01 (-18°C)',
    batch_number: 'BCH-PEA-4490',
    expiry_date: 'Oct 12, 2026',
    stock_quantity: 18,
    reorder_level: 20,
    cost_price: 3600,
    stock_valuation: 64800,
    status: 'expiring_soon',
  },
];

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<GroceryInventoryItem[]>(groceryInventorySeed);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<GroceryInventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('purchase_inward');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Audit Logs Modal
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 1, sku: 'VEG-ONI-050', type: 'INWARD', change: '+50 Bags', reason: 'Farmer Direct Procurement (Nashik)', user: 'Rahul Verma', timestamp: 'Today, 08:30 AM' },
    { id: 2, sku: 'DAI-PAN-005', type: 'OUTWARD', change: '-12 Blocks', reason: 'Order Dispatch #ORD-84271', user: 'Auto Dispatch System', timestamp: 'Today, 07:15 AM' },
    { id: 3, sku: 'GRP-RIC-050', type: 'ADJUSTMENT', change: '-2 Bags', reason: 'Bags punctured during forklift transit', user: 'Johnson (Supervisor)', timestamp: 'Yesterday, 05:40 PM' },
    { id: 4, sku: 'DAI-BUT-020', type: 'OUTWARD', change: '-10 Cartons', reason: 'Order Dispatch #ORD-84255', user: 'Fulfillment Bot', timestamp: 'Yesterday, 02:10 PM' },
  ]);

  // Dynamic filter application
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'All' || item.warehouse === warehouseFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesWarehouse;
  });

  // Calculate Aggregated Metrics
  const totalValuation = items.reduce((acc, curr) => acc + curr.stock_valuation, 0);
  const lowStockCount = items.filter((i) => i.status === 'low_stock').length;
  const outOfStockCount = items.filter((i) => i.status === 'out_of_stock').length;
  const expiringSoonCount = items.filter((i) => i.status === 'expiring_soon').length;

  const openAdjustModal = (item: GroceryInventoryItem) => {
    setSelectedProduct(item);
    setNewQuantity(item.stock_quantity);
    setAdjustmentReason('purchase_inward');
    setAdjustmentNotes('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmittingAdjust(true);

    try {
      // Update local item
      const updated = items.map((it) => {
        if (it.id === selectedProduct.id) {
          const qty = Number(newQuantity);
          let newStatus: GroceryInventoryItem['status'] = 'in_stock';
          if (qty === 0) newStatus = 'out_of_stock';
          else if (qty <= it.reorder_level) newStatus = 'low_stock';
          else if (it.status === 'expiring_soon') newStatus = 'expiring_soon';

          return {
            ...it,
            stock_quantity: qty,
            stock_valuation: qty * it.cost_price,
            status: newStatus,
          };
        }
        return it;
      });

      setItems(updated);

      // Add to audit logs
      const logEntry = {
        id: Date.now(),
        sku: selectedProduct.sku,
        type: newQuantity > selectedProduct.stock_quantity ? 'INWARD' : 'ADJUSTMENT',
        change: `${newQuantity > selectedProduct.stock_quantity ? '+' : ''}${newQuantity - selectedProduct.stock_quantity} units`,
        reason: adjustmentReason === 'purchase_inward' ? 'Intake Batch Inward' : adjustmentNotes || 'Manual Reconciliation',
        user: 'Johnson (Admin)',
        timestamp: 'Just now',
      };
      setAuditLogs((prev) => [logEntry, ...prev]);

      setAdjustModalOpen(false);
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Boxes size={24} color="#047857" />
            Grocery Inventory & Multi-Hub Warehouse Control
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Real-time B2B stock tracking, cold chain bay allocation, batch & expiry monitoring, and intake adjustment
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setLogsModalOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <History size={15} color="#047857" />
            <span>Stock Movement History</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Total Warehouse SKUs</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {items.length} SKUs
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            Across 4 distribution hubs
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #047857' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Inventory Valuation</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
            Current physical asset value
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #D97706' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Low Stock & Reorder Alerts</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {lowStockCount + outOfStockCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: '4px' }}>
            {outOfStockCount} out of stock, {lowStockCount} below threshold
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #EA580C' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Expiring Soon (&lt; 30 Days)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#EA580C', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {expiringSoonCount} Batches
          </div>
          <div style={{ fontSize: '0.7rem', color: '#EA580C', fontWeight: 700, marginTop: '4px' }}>
            Perishables in cold storage
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Section 5) */}
      <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by SKU, product name, or batch #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
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
          <option value="All">All Categories ({items.length})</option>
          <option value="Fruits & Vegetables">Fruits & Vegetables</option>
          <option value="Rice & Grains">Rice & Grains</option>
          <option value="Pulses & Dals">Pulses & Dals</option>
          <option value="Cooking Oils & Ghee">Cooking Oils & Ghee</option>
          <option value="Spices & Masalas">Spices & Masalas</option>
          <option value="Sugar, Salt & Sweeteners">Sugar, Salt & Sweeteners</option>
          <option value="Dairy & Refrigerated Products">Dairy & Refrigerated</option>
          <option value="Frozen & Other Essentials">Frozen Essentials</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          <option value="All">All Stock Statuses</option>
          <option value="in_stock">In Stock (Green)</option>
          <option value="low_stock">Low Stock (Amber)</option>
          <option value="out_of_stock">Out of Stock (Red)</option>
          <option value="expiring_soon">Expiring Soon (Orange)</option>
        </select>

        {/* Warehouse Filter */}
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
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
          <option value="All">All Storage Locations</option>
          <option value="Central Cold Chain Hub (BLR)">Central Cold Chain (BLR)</option>
          <option value="Ambient Dry Goods Silo 4">Dry Goods Silo 4</option>
          <option value="Peenya Fulfillment Center">Peenya Hub</option>
          <option value="Whitefield Logistics Depot">Whitefield Depot</option>
        </select>

      </div>

      {/* Inventory Table inside responsive horizontal scroll wrapper */}
      <div className="table-container card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', minWidth: '940px' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>SKU & Product</th>
              <th style={{ width: '14%' }}>Category</th>
              <th style={{ width: '18%' }}>Warehouse Bay</th>
              <th style={{ width: '13%' }}>Batch & Expiry</th>
              <th style={{ width: '15%' }}>Stock Balance</th>
              <th style={{ width: '15%' }}>Status</th>
              <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No inventory records match the selected filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((it) => {
                const stockRatio = Math.min(100, Math.round((it.stock_quantity / (it.reorder_level * 3)) * 100));
                
                // Status badge config
                let badgeStyle = { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC', label: 'In Stock' };
                if (it.status === 'low_stock') {
                  badgeStyle = { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', label: 'Low Stock' };
                } else if (it.status === 'out_of_stock') {
                  badgeStyle = { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', label: 'Out of Stock' };
                } else if (it.status === 'expiring_soon') {
                  badgeStyle = { bg: '#FFEDD5', text: '#EA580C', border: '#FDBA74', label: 'Expiring Soon' };
                }

                return (
                  <tr key={it.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8E5', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#172B24', fontSize: '0.85rem' }}>{it.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>
                              {it.sku}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {it.pack_size}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                        {it.category}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#172B24' }}>
                          {it.warehouse.split('(')[0]}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          <Warehouse size={12} />
                          <span>{it.location_bay}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, color: '#172B24' }}>
                          {it.batch_number}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: it.status === 'expiring_soon' ? '#EA580C' : '#64748B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px', fontWeight: it.status === 'expiring_soon' ? 700 : 500 }}>
                          <Clock size={11} />
                          <span>{it.expiry_date}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#172B24' }}>
                            {it.stock_quantity}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{it.unit.split(' ')[0]}s</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ width: '90px', height: '5px', backgroundColor: '#F1F5F3', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                          <div
                            style={{
                              width: `${stockRatio}%`,
                              height: '100%',
                              backgroundColor: badgeStyle.text,
                              borderRadius: '4px',
                            }}
                          />
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
                          Reorder at {it.reorder_level}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.text,
                          border: `1px solid ${badgeStyle.border}`,
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badgeStyle.text }} />
                        {badgeStyle.label}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>
                        Val: ₹{it.stock_valuation.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openAdjustModal(it)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                      >
                        <ArrowUpDown size={13} color="#047857" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ padding: '24px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>Record Stock Adjustment</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {selectedProduct.name} ({selectedProduct.sku})
                </div>
              </div>
              <button onClick={() => setAdjustModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ padding: '12px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#047857' }}>
                  Current System Balance
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  {selectedProduct.stock_quantity} {selectedProduct.unit}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                  Location: {selectedProduct.location_bay} ({selectedProduct.warehouse})
                </div>
              </div>

              <div>
                <label className="label">New Authoritative Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="input"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label className="label">Reason for Movement *</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.82rem' }}
                >
                  <option value="purchase_inward">Purchase Inward Intake (Farmer / Factory)</option>
                  <option value="damaged">Quality Rejection / Damaged in Cold Chain</option>
                  <option value="expiry_discard">Expired Batch Clearance</option>
                  <option value="audit_correction">Physical Audit Stock Reconciliation</option>
                  <option value="sample_transfer">QC Lab Testing Sample Deduction</option>
                </select>
              </div>

              <div>
                <label className="label">Inspector Remarks / QC Reference</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Inward truck verified at Bay A-04, seal intact"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem' }}
                >
                  {submittingAdjust ? 'Updating...' : 'Commit Stock Balance'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {logsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ padding: '24px', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>Warehouse Stock Movement Audit Log</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Immutable chronological audit trail of all intakes, dispatches and adjustments
                </div>
              </div>
              <button onClick={() => setLogsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8E5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: log.type === 'INWARD' ? '#ECFDF5' : log.type === 'OUTWARD' ? '#EFF6FF' : '#FEF3C7',
                          color: log.type === 'INWARD' ? '#047857' : log.type === 'OUTWARD' ? '#2563EB' : '#D97706',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {log.type}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#172B24' }}>
                        {log.sku}
                      </span>
                      <strong style={{ fontSize: '0.78rem', color: log.type === 'INWARD' ? '#16A34A' : '#DC2626', fontFamily: 'var(--font-mono)' }}>
                        {log.change}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                      {log.reason}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{log.timestamp}</div>
                    <div style={{ fontSize: '0.72rem', color: '#172B24', fontWeight: 600 }}>{log.user}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8E5' }}>
              <button onClick={() => setLogsModalOpen(false)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
