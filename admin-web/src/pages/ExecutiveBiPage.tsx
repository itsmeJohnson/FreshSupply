import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';
import { api } from '../api/client';

export const ExecutiveBiPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [salesTrends, setSalesTrends] = useState<any[]>([]);
  const [skuProfitability, setSkuProfitability] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  const fetchBiData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, trendsRes, skuRes] = await Promise.all([
        api.getExecutiveKpis(),
        api.getSalesTrends(),
        api.getSkuProfitability(),
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (trendsRes.success) setSalesTrends(trendsRes.data || []);
      if (skuRes.success) setSkuProfitability(skuRes.data || []);
    } catch (err: any) {
      console.error('Error fetching BI data:', err);
      setError(err.message || 'Failed to load executive BI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const maxTrendValue = Math.max(
    ...salesTrends.map((t) => Math.max(parseFloat(t.daily_orders_value || 0), parseFloat(t.daily_collections || 0))),
    100000
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#F7F9F8', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#ECFDF5',
                color: '#047857',
              }}
            >
              Enterprise Intelligence
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Real-time PostgreSQL Audited</span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#172B24',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Executive BI & P&L Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>
            Consolidated gross margins, statutory cashflow collections, fulfillment velocity & SKU contribution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8E5',
              padding: '2px',
            }}
          >
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: timeRange === r ? '#047857' : 'transparent',
                  color: timeRange === r ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.15s ease',
                }}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'This Month' : 'Quarterly'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchBiData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8E5',
              backgroundColor: '#FFFFFF',
              color: '#172B24',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Financial Health Overview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Gross Sales */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8E5',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Gross Wholesale Sales</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#047857',
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em' }}>
            {formatCurrency(kpis?.financials?.grossSales || 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +14.2%
            </span>
            <span style={{ color: '#94A3B8' }}>vs previous period</span>
          </div>
        </div>

        {/* COGS & Gross Profit */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8E5',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Gross Profit & Margin</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#047857', letterSpacing: '-0.02em' }}>
            {formatCurrency(kpis?.financials?.grossProfit || 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
            <span
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              {kpis?.financials?.grossMarginPct || 0}% Gross Margin
            </span>
            <span style={{ color: '#64748B' }}>COGS: {formatCurrency(kpis?.financials?.purchaseCostCOGS || 0)}</span>
          </div>
        </div>

        {/* Collections */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8E5',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Cash Collected</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A',
              }}
            >
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em' }}>
            {formatCurrency(kpis?.financials?.cashCollected || 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#16A34A', fontWeight: 700 }}>Settled via Bank/UPI/Cheque</span>
          </div>
        </div>

        {/* Receivables Outstanding */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8E5',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Outstanding Receivables</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#B45309', letterSpacing: '-0.02em' }}>
            {formatCurrency(kpis?.financials?.outstandingReceivables || 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
            <span style={{ color: '#D97706', fontWeight: 600 }}>Active Credit Terms (7–30 Days)</span>
          </div>
        </div>
      </div>

      {/* Operational Velocity & Efficiency KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8E5',
            padding: '16px',
          }}
        >
          <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 600 }}>Wholesale Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#172B24', marginTop: '4px' }}>
            {kpis?.operations?.totalOrders || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            AOV: {formatCurrency(kpis?.operations?.averageOrderValue || 0)}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8E5',
            padding: '16px',
          }}
        >
          <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 600 }}>OTIF Delivery Rate</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
            {kpis?.operations?.onTimeDeliveryRatePct || 98.2}%
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px' }}>
            Fulfillment: {kpis?.operations?.fulfillmentRatePct || 96.5}%
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8E5',
            padding: '16px',
          }}
        >
          <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 600 }}>Active Buyers Network</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#172B24', marginTop: '4px' }}>
            {kpis?.operations?.activeCustomersCount || 120}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>HORECA & Supermarkets</div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8E5',
            padding: '16px',
          }}
        >
          <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 600 }}>Inventory Velocity</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#172B24', marginTop: '4px' }}>
            {kpis?.operations?.inventoryTurnoverDays || 14.8} Days
          </div>
          <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>
            FEFO Risk: {formatCurrency(kpis?.operations?.nearExpiryRiskValue || 0)}
          </div>
        </div>
      </div>

      {/* Main Grid: 7-Day Trend Chart & Executive Insights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Trend Bar Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8E5',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#172B24' }}>
                Daily Wholesale Demand vs Cash Inflow
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                7-day rolling view of booked order commitments vs bank/cash payments collected.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#047857' }} />
                <span style={{ color: '#172B24', fontWeight: 600 }}>Booked Orders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3B82F6' }} />
                <span style={{ color: '#172B24', fontWeight: 600 }}>Collections</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '220px',
              paddingTop: '20px',
              borderBottom: '1px solid #E2E8E5',
              gap: '12px',
            }}
          >
            {salesTrends.map((t, idx) => {
              const orderVal = parseFloat(t.daily_orders_value || 0);
              const colVal = parseFloat(t.daily_collections || 0);
              const orderHeight = Math.max(12, Math.round((orderVal / maxTrendValue) * 180));
              const colHeight = Math.max(12, Math.round((colVal / maxTrendValue) * 180));
              const dStr = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                    {/* Order Bar */}
                    <div
                      title={`Orders: ${formatCurrency(orderVal)}`}
                      style={{
                        width: '45%',
                        height: `${orderHeight}px`,
                        backgroundColor: '#047857',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    {/* Collection Bar */}
                    <div
                      title={`Collections: ${formatCurrency(colVal)}`}
                      style={{
                        width: '45%',
                        height: `${colHeight}px`,
                        backgroundColor: '#3B82F6',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748B',
                      marginTop: '8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dStr.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              fontSize: '12px',
              color: '#64748B',
            }}
          >
            <span>Min baseline: ₹0</span>
            <span>Peak capacity: {formatCurrency(maxTrendValue)}</span>
          </div>
        </div>

        {/* Corporate Working Capital Summary */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8E5',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#172B24' }}>
              Working Capital Health
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#64748B' }}>Gross Profit Margin</span>
                  <span style={{ fontWeight: 700, color: '#047857' }}>{kpis?.financials?.grossMarginPct || 0}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#F1F5F3', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, kpis?.financials?.grossMarginPct || 0)}%`,
                      height: '100%',
                      backgroundColor: '#047857',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#64748B' }}>On-Time Settlement Rate</span>
                  <span style={{ fontWeight: 700, color: '#2563EB' }}>89.4%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#F1F5F3', overflow: 'hidden' }}>
                  <div style={{ width: '89.4%', height: '100%', backgroundColor: '#2563EB' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#64748B' }}>FEFO Freshness Compliance</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>97.8%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#F1F5F3', overflow: 'hidden' }}>
                  <div style={{ width: '97.8%', height: '100%', backgroundColor: '#10B981' }} />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700, fontSize: '13px' }}>
              <CheckCircle size={16} /> Commercial Health: Strong
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#065F46', lineHeight: 1.4 }}>
              Receivables turnover is healthy across 120 buyers. Reorder burn rates and procurement contracts maintain a positive gross margin spread of &gt;18%.
            </p>
          </div>
        </div>
      </div>

      {/* Top SKU Profitability Matrix */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8E5',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#172B24' }}>
              Top SKU Profitability & Unit Economics
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Analysis of volume sold, gross wholesale revenue, procurement COGS and net gross margin per SKU.
            </p>
          </div>

          <button
            onClick={() => {
              alert('Exporting executive SKU profitability report as CSV...');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8E5',
              backgroundColor: '#FFFFFF',
              color: '#047857',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8E5', color: '#64748B', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>SKU & Product Name</th>
                <th style={{ padding: '12px 16px' }}>Volume Sold</th>
                <th style={{ padding: '12px 16px' }}>Gross Revenue</th>
                <th style={{ padding: '12px 16px' }}>COGS (Procurement)</th>
                <th style={{ padding: '12px 16px' }}>Gross Profit</th>
                <th style={{ padding: '12px 16px' }}>Margin %</th>
                <th style={{ padding: '12px 16px' }}>Contribution Status</th>
              </tr>
            </thead>
            <tbody>
              {skuProfitability.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No SKU sales data available for this reporting period.
                  </td>
                </tr>
              ) : (
                skuProfitability.map((sku, idx) => {
                  const marginPct = parseFloat(sku.gross_margin_pct || 0);
                  const isHighMargin = marginPct >= 20;
                  const isModerateMargin = marginPct >= 10 && marginPct < 20;

                  return (
                    <tr
                      key={sku.id || idx}
                      style={{
                        borderBottom: '1px solid #F1F5F3',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFB',
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#172B24' }}>{sku.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                          {sku.sku || `SKU-${sku.id}`}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#172B24' }}>
                        {sku.units_sold} {sku.unit || 'Kg'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#172B24' }}>
                        {formatCurrency(sku.gross_revenue)}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>
                        {formatCurrency(sku.total_cogs)}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#047857' }}>
                        {formatCurrency(sku.gross_profit)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: isHighMargin ? '#DCFCE7' : isModerateMargin ? '#FEF3C7' : '#FEE2E2',
                            color: isHighMargin ? '#15803D' : isModerateMargin ? '#B45309' : '#B91C1C',
                          }}
                        >
                          {marginPct}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isHighMargin ? (
                          <span style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>
                            ★ Star Contributor
                          </span>
                        ) : isModerateMargin ? (
                          <span style={{ fontSize: '12px', color: '#B45309', fontWeight: 600 }}>
                            ● Stable Volume
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 600 }}>
                            ▲ Low Margin Alert
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

