import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  Layers,
} from 'lucide-react';
import { api } from '../api/client';
import { statusColors } from '../theme/tokens';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Loading dashboard metrics...</div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const customers = data?.customers || {};
  const inventory = data?.inventory || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockItems = data?.lowStockItems || [];
  const categoryBreakdown = data?.categoryBreakdown || [];

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Operations & Fulfillment Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Authoritative B2B order routing, inventory levels and delivery pipeline
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="btn btn-primary btn-sm"
          >
            View Live Orders
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Revenue */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Total B2B Revenue
            </span>
            <div style={{ padding: '6px', backgroundColor: 'var(--color-soft-mint)', borderRadius: '8px', color: 'var(--color-primary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '8px' }}>
            ₹{parseFloat(metrics.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 600, marginTop: '4px' }}>
            Across delivered & active orders
          </div>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Total Wholesale Orders
            </span>
            <div style={{ padding: '6px', backgroundColor: '#EFF6FF', borderRadius: '8px', color: '#3B82F6' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '8px' }}>
            {metrics.total_orders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {metrics.pending_orders || 0} pending review
          </div>
        </div>

        {/* Active Customers */}
        <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Registered Businesses
            </span>
            <div style={{ padding: '6px', backgroundColor: '#F5F3FF', borderRadius: '8px', color: '#8B5CF6' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '8px' }}>
            {customers.total_customers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, marginTop: '4px' }}>
            {customers.active_customers || 0} active procurement accounts
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          className="card"
          style={{
            borderLeft: `4px solid ${parseInt(inventory.low_stock_count, 10) > 0 ? 'var(--color-warning)' : 'var(--color-primary)'}`,
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('inventory')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Low Stock Warnings
            </span>
            <div style={{ padding: '6px', backgroundColor: '#FEF3C7', borderRadius: '8px', color: 'var(--color-warning)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '8px' }}>
            {inventory.low_stock_count || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 600, marginTop: '4px' }}>
            Products below 30 unit safety buffer
          </div>
        </div>
      </div>

      {/* Fulfillment Pipeline Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '14px' }}>
          Order Pipeline Status Breakdown
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: statusColors.pending.bg, border: `1px solid ${statusColors.pending.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColors.pending.text, fontSize: '0.75rem', fontWeight: 700 }}>
              <Clock size={14} /> Pending
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColors.pending.text, marginTop: '4px' }}>
              {metrics.pending_orders || 0}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: statusColors.confirmed.bg, border: `1px solid ${statusColors.confirmed.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColors.confirmed.text, fontSize: '0.75rem', fontWeight: 700 }}>
              <CheckCircle size={14} /> Confirmed
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColors.confirmed.text, marginTop: '4px' }}>
              {metrics.confirmed_orders || 0}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: statusColors.processing.bg, border: `1px solid ${statusColors.processing.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColors.processing.text, fontSize: '0.75rem', fontWeight: 700 }}>
              <PackageCheck size={14} /> Processing
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColors.processing.text, marginTop: '4px' }}>
              {metrics.processing_orders || 0}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: statusColors.dispatched.bg, border: `1px solid ${statusColors.dispatched.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColors.dispatched.text, fontSize: '0.75rem', fontWeight: 700 }}>
              <Truck size={14} /> Dispatched
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColors.dispatched.text, marginTop: '4px' }}>
              {metrics.dispatched_orders || 0}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: statusColors.delivered.bg, border: `1px solid ${statusColors.delivered.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColors.delivered.text, fontSize: '0.75rem', fontWeight: 700 }}>
              <CheckCircle size={14} /> Delivered
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColors.delivered.text, marginTop: '4px' }}>
              {metrics.delivered_orders || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders and Low-Stock Alert List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Recent Orders Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Recent Wholesale Orders
            </h2>
            <button
              onClick={() => onNavigate('orders')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              All Orders <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord: any) => {
                  const s = statusColors[ord.status] || { bg: '#eee', text: '#333', border: '#ccc' };
                  return (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {ord.order_number}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.business_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {ord.item_count} items
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Inventory Attention List
            </h2>
            <button
              onClick={() => onNavigate('inventory')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Manage Stock <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                All products meet minimum safe stock levels.
              </div>
            ) : (
              lowStockItems.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FDE68A',
                    backgroundColor: '#FEFDF8',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{item.sku}</span>
                      <span>•</span>
                      <span>{item.category_name}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: item.stock_quantity === 0 ? 'var(--color-error)' : 'var(--color-warning)',
                      }}
                    >
                      {item.stock_quantity} {item.unit} left
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      MOQ: {item.min_order_qty}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
