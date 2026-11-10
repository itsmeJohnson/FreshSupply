import React, { useEffect, useState } from 'react';
import {
  Boxes,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Info,
  RotateCcw,
  Check,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'new' | 'in_progress' | 'urgent'>('new');
  const [editMode, setEditMode] = useState(false);
  const [selectedProductPricing, setSelectedProductPricing] = useState('onion');
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(6);
  const [savedPricingNotice, setSavedPricingNotice] = useState(false);
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSavePricing = () => {
    setSavedPricingNotice(true);
    setTimeout(() => setSavedPricingNotice(false), 3000);
  };

  const chartDays = ['Sep 28', 'Sep 29', 'Sep 30', 'Oct 01', 'Oct 02', 'Oct 03', 'Oct 04'];
  const chartData = [
    { day: 'Sep 28', inbound: 320, outbound: 210, fulfilled: 195 },
    { day: 'Sep 29', inbound: 345, outbound: 230, fulfilled: 215 },
    { day: 'Sep 30', inbound: 380, outbound: 260, fulfilled: 240 },
    { day: 'Oct 01', inbound: 360, outbound: 250, fulfilled: 235 },
    { day: 'Oct 02', inbound: 405, outbound: 285, fulfilled: 260 },
    { day: 'Oct 03', inbound: 395, outbound: 275, fulfilled: 255 },
    { day: 'Oct 04', inbound: 428.6, outbound: 298.4, fulfilled: 276.1 },
  ];

  const inventoryProduce = [
    { name: 'Tomato (Grade-A)', category: 'fruits_veg', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100', stock: '162.5 MT', daily: '28.4 MT/day', cover: '5.7 days', risk: 'High', color: '#DC2626', bg: '#FEE2E2' },
    { name: 'Onion (Nashik Red)', category: 'fruits_veg', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100', stock: '586.0 MT', daily: '61.2 MT/day', cover: '9.6 days', risk: 'Medium', color: '#D97706', bg: '#FEF3C7' },
    { name: 'Potato (Agra Jyoti)', category: 'fruits_veg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100', stock: '1,024.0 MT', daily: '84.0 MT/day', cover: '12.2 days', risk: 'Low', color: '#16A34A', bg: '#DCFCE7' },
    { name: 'Basmati Rice (1121)', category: 'rice_grains', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100', stock: '840.0 MT', daily: '42.0 MT/day', cover: '20.0 days', risk: 'Low', color: '#16A34A', bg: '#DCFCE7' },
    { name: 'Toor Dal (Premium)', category: 'pulses_dals', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100', stock: '320.0 MT', daily: '38.5 MT/day', cover: '8.3 days', risk: 'Medium', color: '#D97706', bg: '#FEF3C7' },
    { name: 'Sunflower Oil (15L)', category: 'oils_ghee', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100', stock: '115.0 MT', daily: '22.0 MT/day', cover: '5.2 days', risk: 'High', color: '#DC2626', bg: '#FEE2E2' },
    { name: 'Carrot (Ooty Orange)', category: 'fruits_veg', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100', stock: '218.0 MT', daily: '24.6 MT/day', cover: '8.9 days', risk: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  ];

  const filteredInventory = inventoryProduce.filter((it) => {
    if (inventoryCategoryFilter === 'all') return true;
    return it.category === inventoryCategoryFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Top Welcome Strip & Date Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#047857',
              border: '1px solid #A7F3D0',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Good Morning, {user?.name?.split(' ')[0] || 'Johnson'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Here&apos;s your B2B supply chain overview for today
            </p>
          </div>
        </div>

        {/* Date Selector + Live Updates Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8E5',
              borderRadius: '10px',
              padding: '7px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#172B24',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              cursor: 'pointer',
            }}
          >
            <Calendar size={14} color="#047857" />
            <span>Oct 04, 2026</span>
            <ChevronDown size={14} color="#64748B" />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#047857',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
              }}
            />
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Section 4 & Specification) */}
      <div className="dashboard-kpi-grid">
        
        {/* Total Inventory */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Total Inventory</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Boxes size={18} color="#047857" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#172B24', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            3,842.5 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>MT</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑ +6.8%</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs. yesterday</span>
          </div>
        </div>

        {/* Orders Today */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Orders Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#172B24', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            128
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑ +18%</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>active orders</span>
          </div>
        </div>

        {/* Dispatch Throughput */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Dispatch Throughput</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} color="#047857" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#172B24', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            298.4 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>MT</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑ +12.6%</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>fleet volume</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Low Stock Items</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#DC2626" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#DC2626', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            6
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↓ -40%</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>action required</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Fully Responsive Layout */}
      <div className="dashboard-main-grid">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: INCOMING ORDERS (12)                          */}
        {/* ========================================================== */}
        <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#172B24' }}>
              Incoming Orders <span style={{ color: '#64748B', fontWeight: 600 }}>(12)</span>
            </h2>
            <button
              onClick={() => onNavigate('orders')}
              style={{
                background: 'none',
                border: 'none',
                color: '#047857',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => setOrderFilter('new')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: orderFilter === 'new' ? '1px solid #047857' : '1px solid #E2E8E5',
                backgroundColor: orderFilter === 'new' ? '#047857' : '#F8FAFC',
                color: orderFilter === 'new' ? '#FFFFFF' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              New (5)
            </button>
            <button
              onClick={() => setOrderFilter('in_progress')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: orderFilter === 'in_progress' ? '1px solid #047857' : '1px solid #E2E8E5',
                backgroundColor: orderFilter === 'in_progress' ? '#047857' : '#F8FAFC',
                color: orderFilter === 'in_progress' ? '#FFFFFF' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              In Progress (4)
            </button>
            <button
              onClick={() => setOrderFilter('urgent')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: orderFilter === 'urgent' ? '1px solid #DC2626' : '1px solid #E2E8E5',
                backgroundColor: orderFilter === 'urgent' ? '#DC2626' : '#F8FAFC',
                color: orderFilter === 'urgent' ? '#FFFFFF' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Urgent (3)
            </button>
          </div>

          {/* Partner Order Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'ORD-84271', partner: 'GreenMart Retail', avatar: 'GR', time: '2 min ago', amount: '₹4,72,500', weight: '12.5 MT', badge: 'New', color: '#047857', bg: '#ECFDF5' },
              { id: 'ORD-84270', partner: 'FreshHub Stores', avatar: 'FH', time: '5 min ago', amount: '₹3,21,000', weight: '8.0 MT', badge: 'New', color: '#2563EB', bg: '#EFF6FF' },
              { id: 'ORD-84269', partner: 'SuperFood Retail', avatar: 'SF', time: '8 min ago', amount: '₹7,98,400', weight: '21.0 MT', badge: 'New', color: '#7C3AED', bg: '#F5F3FF' },
              { id: 'ORD-84268', partner: 'EasyVegi Mart', avatar: 'EV', time: '12 min ago', amount: '₹2,19,600', weight: '6.0 MT', badge: 'New', color: '#0D9488', bg: '#F0FDFA' },
              { id: 'ORD-84267', partner: 'QuickNest Retail', avatar: 'QN', time: '14 min ago', amount: '₹5,36,000', weight: '15.0 MT', badge: 'New', color: '#EA580C', bg: '#FFF7ED' },
            ].map((ord, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('orders')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8E5',
                  borderRadius: '10px',
                  padding: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#047857';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8E5';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: ord.bg,
                      color: ord.color,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {ord.avatar}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ord.partner}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>#{ord.id}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', marginTop: '1px', fontFamily: 'var(--font-mono)' }}>
                      {ord.amount}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{ord.time}</div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                    {ord.weight}
                  </div>
                  <span
                    style={{
                      backgroundColor: '#ECFDF5',
                      color: '#047857',
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      marginTop: '2px',
                      display: 'inline-block',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    {ord.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================== */}
        {/* CENTER COLUMN: LOGISTICS CHART + INVENTORY TABLE           */}
        {/* ========================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Logistics Throughput Chart Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#172B24' }}>Logistics Throughput</h2>
                  <Info size={14} color="#64748B" />
                </div>
                <p style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                  Daily inbound, outbound and fulfilled volume (MT)
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: 700 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#047857' }} />
                    Inbound
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 700 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                    Outbound
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    Fulfilled
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8E5',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    color: '#172B24',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Last 7 Days</span>
                  <ChevronDown size={12} color="#64748B" />
                </div>
              </div>
            </div>

            {/* Premium Light Theme SVG Chart */}
            <div style={{ position: 'relative', width: '100%', height: '175px' }}>
              <svg width="100%" height="100%" viewBox="0 0 500 170" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lightInboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#047857" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lightOutboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F3" strokeDasharray="3" strokeWidth="1.5" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F3" strokeDasharray="3" strokeWidth="1.5" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F3" strokeDasharray="3" strokeWidth="1.5" />

                {/* Outbound Area & Curve */}
                <path
                  d="M0,130 C70,115 140,105 210,110 C280,95 350,100 420,80 C460,75 500,68 500,68 L500,160 L0,160 Z"
                  fill="url(#lightOutboundGrad)"
                />
                <path
                  d="M0,130 C70,115 140,105 210,110 C280,95 350,100 420,80 C460,75 500,68 500,68"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />

                {/* Inbound Area & Curve */}
                <path
                  d="M0,100 C70,90 140,75 210,80 C280,60 350,68 420,40 C460,35 500,25 500,25 L500,160 L0,160 Z"
                  fill="url(#lightInboundGrad)"
                />
                <path
                  d="M0,100 C70,90 140,75 210,80 C280,60 350,68 420,40 C460,35 500,25 500,25"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="3"
                />

                {/* Fulfilled Curve (Dashed) */}
                <path
                  d="M0,140 C70,125 140,115 210,120 C280,105 350,110 420,90 C460,85 500,78 500,78"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4"
                />

                {/* Marker Points */}
                <circle cx="500" cy="25" r="5" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="500" cy="68" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="500" cy="78" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* Tooltip Card Overlay (Light theme styled) */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '25px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8E5',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.72rem',
                  color: '#172B24',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ fontWeight: 800, color: '#64748B', marginBottom: '4px', fontSize: '0.7rem' }}>Oct 04 Throughput</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#047857', fontWeight: 600 }}>● Inbound:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>428.6 MT</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#2563EB', fontWeight: 600 }}>● Outbound:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>298.4 MT</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>● Fulfilled:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>276.1 MT</strong>
                </div>
              </div>
            </div>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.72rem', color: '#64748B' }}>
              {chartDays.map((d, i) => (
                <span key={i} style={{ fontWeight: i === 6 ? 800 : 500, color: i === 6 ? '#047857' : '#64748B' }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Inventory Status – Fresh Produce & Grocery */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#172B24' }}>Inventory Status – Fresh Produce & Groceries</h2>
                <p style={{ fontSize: '0.74rem', color: '#64748B' }}>Real-time stock levels, consumption trend and depletion risk</p>
              </div>

              {/* Category Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8E5',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    color: '#172B24',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Grocery Categories</option>
                  <option value="fruits_veg">Fruits & Vegetables</option>
                  <option value="rice_grains">Rice & Grains</option>
                  <option value="pulses_dals">Pulses & Dals</option>
                  <option value="oils_ghee">Cooking Oils & Ghee</option>
                </select>
              </div>
            </div>

            {/* Table inside responsive container */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', minWidth: '520px' }}>
                <thead>
                  <tr style={{ color: '#64748B', borderBottom: '1px solid #E2E8E5', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 6px' }}>Product</th>
                    <th style={{ padding: '10px 6px' }}>Current Stock</th>
                    <th style={{ padding: '10px 6px' }}>Daily Burn</th>
                    <th style={{ padding: '10px 6px' }}>Stock Cover</th>
                    <th style={{ padding: '10px 6px' }}>Depletion Risk</th>
                    <th style={{ padding: '10px 6px', textAlign: 'right' }}>Trend (7D)</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#172B24' }}>
                  {filteredInventory.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < filteredInventory.length - 1 ? '1px solid #F1F5F3' : 'none' }}>
                      <td style={{ padding: '10px 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={row.img}
                          alt={row.name}
                          style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8E5', flexShrink: 0 }}
                        />
                        <strong style={{ color: '#172B24', fontSize: '0.82rem' }}>{row.name}</strong>
                      </td>
                      <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.stock}</td>
                      <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>{row.daily}</td>
                      <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.cover}</td>
                      <td style={{ padding: '10px 6px' }}>
                        <span
                          style={{
                            backgroundColor: row.bg,
                            color: row.color,
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            display: 'inline-block',
                          }}
                        >
                          {row.risk}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                        <svg width="48" height="18" viewBox="0 0 48 18" style={{ display: 'inline-block' }}>
                          <path
                            d={row.risk === 'High' ? "M0,4 Q12,14 24,8 T48,16" : row.risk === 'Medium' ? "M0,10 Q12,6 24,10 T48,8" : "M0,14 Q12,12 24,6 T48,2"}
                            fill="none"
                            stroke={row.color}
                            strokeWidth="2"
                          />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onNavigate('inventory')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Open Full Inventory Manager</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: PRICING TIERS & FULFILLMENT QUEUE            */}
        {/* ========================================================== */}
        <div className="dashboard-side-column-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Wholesale Pricing Tiers Card */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#172B24' }}>Wholesale Pricing Tiers</h2>
                <p style={{ fontSize: '0.72rem', color: '#64748B' }}>Set quantity-based pricing for partners</p>
              </div>

              {/* Edit Mode Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B' }}>
                <span style={{ fontWeight: 600 }}>Edit Mode</span>
                <div
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    width: '32px',
                    height: '18px',
                    borderRadius: '9999px',
                    backgroundColor: editMode ? '#047857' : '#E2E8E5',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      position: 'absolute',
                      top: '2px',
                      left: editMode ? '16px' : '2px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Product Selector with thumbnail */}
            <div
              style={{
                marginTop: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8E5',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=80"
                  alt="Onion"
                  style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#172B24' }}>Onion (Nashik Red Grade-A)</span>
              </div>
              <ChevronDown size={14} color="#64748B" />
            </div>

            {/* Tiers Table */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', color: '#64748B', fontWeight: 700, padding: '0 6px', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                <span>Quantity</span>
                <span>Price / Kg</span>
                <span style={{ textAlign: 'right' }}>Discount</span>
              </div>

              {[
                { qty: '1 kg – 49 kg', price: '₹22.00', discount: 'Base Rate', active: false },
                { qty: '50 kg – 249 kg', price: '₹21.00', discount: '4.5% Off', active: false },
                { qty: '250 kg – 999 kg', price: '₹19.50', discount: '11.4% Off', active: false },
                { qty: '≥ 1,000 kg', price: '₹18.75', discount: '14.8% Off', active: true },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: tier.active ? '#ECFDF5' : '#FFFFFF',
                    border: tier.active ? '1px solid #047857' : '1px solid #E2E8E5',
                    color: tier.active ? '#047857' : '#172B24',
                    fontWeight: tier.active ? 800 : 600,
                    boxShadow: tier.active ? '0 1px 3px rgba(4, 120, 87, 0.1)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{tier.qty}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{tier.price}</span>
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: tier.active ? '#047857' : '#64748B' }}>
                    {tier.discount}
                  </span>
                </div>
              ))}
            </div>

            {/* Tier Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <button
                onClick={() => setSelectedProductPricing('onion')}
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>

              <button
                onClick={handleSavePricing}
                style={{
                  backgroundColor: '#047857',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)',
                }}
              >
                <Check size={14} />
                <span>{savedPricingNotice ? 'Saved!' : 'Save Changes'}</span>
              </button>
            </div>

            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8E5', textAlign: 'center' }}>
              <button
                onClick={() => onNavigate('pricing')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Wholesale Pricing Manager</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Order Fulfillment Queue (8) */}
          <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#047857" />
                <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#172B24' }}>Fulfillment Queue (8)</h2>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Queue Items with Step Tracker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Queue 1: Packing */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8E5',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                    #ORD-84258
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    12.5 MT
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>GreenMart Retail</div>

                {/* 4-Stage Stepper Tracker */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '2px', backgroundColor: '#E2E8E5', zIndex: 1 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2, boxShadow: '0 0 0 3px #A7F3D0' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#CBD5E1', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#CBD5E1', zIndex: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                  <span style={{ color: '#047857' }}>Pick</span>
                  <span style={{ color: '#047857', fontWeight: 800 }}>Pack</span>
                  <span>Dispatch</span>
                  <span>Deliver</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.7rem' }}>
                  <span style={{ color: '#047857', fontWeight: 800 }}>● Packing at Hub</span>
                  <span style={{ color: '#64748B' }}>ETA: Today, 4:30 PM</span>
                </div>
              </div>

              {/* Queue 2: Dispatching */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8E5',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                    #ORD-84255
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    21.0 MT
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>SuperFood Retail</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '2px', backgroundColor: '#E2E8E5', zIndex: 1 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563EB', zIndex: 2, boxShadow: '0 0 0 3px #BFDBFE' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#CBD5E1', zIndex: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                  <span style={{ color: '#047857' }}>Pick</span>
                  <span style={{ color: '#047857' }}>Pack</span>
                  <span style={{ color: '#2563EB', fontWeight: 800 }}>Dispatch</span>
                  <span>Deliver</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.7rem' }}>
                  <span style={{ color: '#2563EB', fontWeight: 800 }}>● Dispatching</span>
                  <span style={{ color: '#64748B' }}>ETA: Today, 6:15 PM</span>
                </div>
              </div>

              {/* Queue 3: Out for Delivery */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8E5',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                    #ORD-84252
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    6.0 MT
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>EasyVegi Mart</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '2px', backgroundColor: '#E2E8E5', zIndex: 1 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#047857', zIndex: 2 }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', zIndex: 2, boxShadow: '0 0 0 3px #A7F3D0' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                  <span style={{ color: '#047857' }}>Pick</span>
                  <span style={{ color: '#047857' }}>Pack</span>
                  <span style={{ color: '#047857' }}>Dispatch</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>Deliver</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.7rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>● Out for Delivery</span>
                  <span style={{ color: '#64748B' }}>ETA: Today, 8:00 PM</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
