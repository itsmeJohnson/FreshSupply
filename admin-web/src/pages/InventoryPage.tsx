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
} from 'lucide-react';
import { api } from '../api/client';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('purchase_inward');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Audit Logs Modal
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await api.getInventory({
        search,
        lowStockOnly: lowStockFilter,
      });
      if (res.success) {
        setItems(res.data);
        setSummary(res.summary || {});
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [lowStockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  const openAdjustModal = (item: any) => {
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
      await api.adjustStock({
        productId: selectedProduct.id,
        newQuantity,
        reason: adjustmentReason,
        notes: adjustmentNotes,
      });
      setAdjustModalOpen(false);
      loadInventory();
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const openLogsModal = async (productId?: number) => {
    setLogsModalOpen(true);
    setLoadingLogs(true);
    try {
      const res = await api.getInventoryLogs(productId);
      if (res.success) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Warehouse Inventory & Stock Control
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Monitor real-time warehouse balances, prevent overselling and log intake movements
          </p>
        </div>

        <button onClick={() => openLogsModal()} className="btn btn-secondary btn-sm">
          <History size={15} /> View Audit Movements
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div className="card">
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Total Warehouse SKUs
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>
            {summary.total_skus || 0}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Low Stock Alerts (&le; 30 units)
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '4px' }}>
            {summary.low_stock_skus || 0}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-error)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Out of Stock SKUs
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-error)', marginTop: '4px' }}>
            {summary.out_of_stock_skus || 0}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Total Inventory Valuation
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '4px' }}>
            ₹{parseFloat(summary.total_inventory_valuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="input"
              placeholder="Search by SKU or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`btn btn-sm ${lowStockFilter ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertTriangle size={14} />
          {lowStockFilter ? 'Showing Low Stock Only' : 'Filter Low Stock'}
        </button>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU & Product</th>
              <th>Category</th>
              <th>Unit Size</th>
              <th>Current Stock</th>
              <th>Cost Valuation</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                  Loading stock data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                  No inventory records found.
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const isLow = it.stock_quantity <= 30;
                const isOut = it.stock_quantity === 0;
                return (
                  <tr key={it.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{it.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {it.sku}
                      </div>
                    </td>
                    <td>{it.category_name}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{it.unit}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{it.pack_size}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: isOut ? 'var(--color-error)' : isLow ? 'var(--color-warning)' : 'var(--color-text-main)',
                          }}
                        >
                          {it.stock_quantity}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>units</span>
                      </div>
                      {/* Mini visual indicator */}
                      <div style={{ width: '100px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                        <div
                          style={{
                            width: `${Math.min(100, (it.stock_quantity / 120) * 100)}%`,
                            height: '100%',
                            backgroundColor: isOut ? 'var(--color-error)' : isLow ? 'var(--color-warning)' : 'var(--color-primary)',
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      ₹{parseFloat(it.stock_valuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: isOut ? '#FEE2E2' : isLow ? '#FEF3C7' : 'var(--color-primary-light)',
                          color: isOut ? 'var(--color-error)' : isLow ? 'var(--color-warning)' : 'var(--color-primary-dark)',
                          border: `1px solid ${isOut ? '#FECACA' : isLow ? '#FDE68A' : '#A7F3D0'}`,
                        }}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openAdjustModal(it)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          <ArrowUpDown size={13} /> Adjust Stock
                        </button>
                        <button
                          onClick={() => openLogsModal(it.id)}
                          className="btn btn-secondary btn-sm"
                          title="View history"
                          style={{ padding: '5px 8px' }}
                        >
                          <History size={13} />
                        </button>
                      </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Record Stock Adjustment</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {selectedProduct.name} ({selectedProduct.sku})
                </div>
              </div>
              <button onClick={() => setAdjustModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--color-soft-mint)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Current System Balance
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                  {selectedProduct.stock_quantity} {selectedProduct.unit}
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
                  onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div>
                <label className="label">Adjustment Reason *</label>
                <select
                  className="select"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                >
                  <option value="purchase_inward">Wholesale Inward Shipment / Delivery Received</option>
                  <option value="manual_adjustment">Manual Physical Count Correction</option>
                  <option value="damage_write_off">Damaged / Expired Goods Write-off</option>
                  <option value="customer_return">Customer Return Acceptance</option>
                </select>
              </div>

              <div>
                <label className="label">Notes / Purchase Invoice Reference</label>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="e.g. Graded lot arrival from Bangalore APMC Yard"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setAdjustModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingAdjust} className="btn btn-primary">
                  {submittingAdjust ? 'Applying...' : 'Confirm Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Audit Logs Modal */}
      {logsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ padding: '24px', maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Inventory Movement Audit Trail</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Complete transactional history of stock decrements, returns and adjustments
                </div>
              </div>
              <button onClick={() => setLogsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Product</th>
                    <th>Change</th>
                    <th>Balance</th>
                    <th>Reason</th>
                    <th>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading audit records...</td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No audit records found.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.product_name}</div>
                          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{log.sku}</div>
                        </td>
                        <td style={{ fontWeight: 800, color: log.change_qty > 0 ? '#166534' : 'var(--color-error)' }}>
                          {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                        </td>
                        <td style={{ fontWeight: 700 }}>{log.balance_after}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{log.reason.replace(/_/g, ' ')}</span>
                          {log.reference_id && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Ref: {log.reference_id}</div>}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{log.created_by}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
