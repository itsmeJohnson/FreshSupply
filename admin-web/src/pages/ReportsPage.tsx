import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  Truck,
  RotateCcw,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="#047857" />
            Supply Chain Intelligence & Performance Reports
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Procurement GMV, inventory turnover, vehicle fill efficiency, and claims defect metrics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
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
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Current Quarter (Q3 2026)">Current Quarter (Q3 2026)</option>
            <option value="Fiscal Year 2026">Fiscal Year 2026</option>
          </select>

          <button
            onClick={() => alert('Exporting FreshSupply Analytics Report (CSV/PDF)...')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <Download size={15} color="#047857" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Total B2B Wholesale GMV</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            ₹1,84,32,000
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            ↑ +24.8% vs. prior month
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #047857' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>On-Time Fleet Fulfillment</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            98.6%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            Target &gt; 96.0% achieved
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #2563EB' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Average Order Weight</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            14.8 <span style={{ fontSize: '0.85rem' }}>MT</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
            Across 128 daily dispatches
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Defect & Claims Rate</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            0.42%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            ↓ 34% drop with AI QC grading
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Category Volume Share */}
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#172B24', marginBottom: '6px' }}>
            Volume Distribution by Grocery Category
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '16px' }}>
            Wholesale metric tonnage dispatched during {timeRange}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Fruits & Vegetables', share: 38, volume: '1,460 MT', color: '#047857' },
              { label: 'Rice & Grains', share: 28, volume: '1,075 MT', color: '#10B981' },
              { label: 'Cooking Oils & Ghee', share: 16, volume: '614 MT', color: '#2563EB' },
              { label: 'Pulses & Dals', share: 11, volume: '422 MT', color: '#D97706' },
              { label: 'Dairy & Refrigerated', share: 7, volume: '269 MT', color: '#7C3AED' },
            ].map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <strong style={{ color: '#172B24' }}>{cat.label}</strong>
                  <span style={{ color: '#64748B', fontFamily: 'var(--font-mono)' }}>{cat.volume} ({cat.share}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F3', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.share}%`, height: '100%', backgroundColor: cat.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Wholesale Buyers */}
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#172B24', marginBottom: '6px' }}>
            Top Wholesale Enterprise Buyers
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '16px' }}>
            Highest volume retail partners with fulfillment health scores
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'GreenMart Supermarkets', orders: 48, gmv: '₹42,80,000', score: '99.2%', badge: 'Tier-1 Partner' },
              { name: 'SuperFood Retail Hubs', orders: 36, gmv: '₹34,50,000', score: '98.5%', badge: 'Tier-1 Partner' },
              { name: 'FreshHub Hypermarkets', orders: 29, gmv: '₹28,10,000', score: '97.8%', badge: 'Contracted' },
              { name: 'QuickNest Express Marts', orders: 22, gmv: '₹21,40,000', score: '99.0%', badge: 'Q-Commerce' },
            ].map((buyer, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8E5',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#172B24' }}>{buyer.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                    {buyer.orders} dispatches fulfilled · Score: <strong style={{ color: '#047857' }}>{buyer.score}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                    {buyer.gmv}
                  </div>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#ECFDF5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {buyer.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

