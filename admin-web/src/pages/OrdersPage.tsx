import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Search,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Clock,
  Eye,
  X,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';
import { statusColors } from '../theme/tokens';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Order Details Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Action Modal
  const [statusUpdateAction, setStatusUpdateAction] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search,
      });
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openOrderDetail = async (orderId: number) => {
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await api.getOrder(orderId);
      if (res.success) {
        setCurrentOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to get order details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!currentOrder) return;
    setStatusUpdateAction(newStatus);
    setStatusNotes('');
    setCancellationReason('');
  };

  const submitStatusTransition = async () => {
    if (!currentOrder || !statusUpdateAction) return;
    setUpdatingStatus(true);
    try {
      await api.updateOrderStatus(
        currentOrder.order.id,
        statusUpdateAction,
        statusNotes,
        cancellationReason
      );
      setStatusUpdateAction(null);
      // Reload detail & list
      await openOrderDetail(currentOrder.order.id);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'dispatched', label: 'Dispatched' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Order Management & Fulfillment
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          View, route and update restaurant wholesale orders with live status synchronization
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '18px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: selectedStatus === tab.id ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              borderBottom: selectedStatus === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              borderRadius: '4px 4px 0 0',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '14px', marginBottom: '18px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by order number (e.g. FS-20261025), restaurant name, or PO reference..."
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
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Business</th>
              <th>Delivery Date & Slot</th>
              <th>PO Ref</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                  Loading wholesale orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((ord) => {
                const s = statusColors[ord.status] || { bg: '#eee', text: '#333', border: '#ccc' };
                return (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                        {ord.order_number}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                        {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{ord.business_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {ord.contact_person} • {ord.contact_phone}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>
                        {new Date(ord.delivery_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                        {ord.delivery_slot}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {ord.po_reference || '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ord.item_count} items</td>
                    <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      ₹{parseFloat(ord.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openOrderDetail(ord.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px' }}
                      >
                        <Eye size={14} /> Open
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '820px', padding: '28px' }}>
            {loadingDetail || !currentOrder ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading order details...</div>
            ) : (
              <div>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #edf1ee', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary-dark)' }}>
                        {currentOrder.order.order_number}
                      </h2>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: statusColors[currentOrder.order.status]?.bg,
                          color: statusColors[currentOrder.order.status]?.text,
                          border: `1px solid ${statusColors[currentOrder.order.status]?.border}`,
                          fontSize: '0.8rem',
                          padding: '4px 10px',
                        }}
                      >
                        {currentOrder.order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Submitted on {new Date(currentOrder.order.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                    </div>
                  </div>

                  <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={22} />
                  </button>
                </div>

                {/* Status Workflow Action Bar */}
                <div
                  style={{
                    backgroundColor: 'var(--color-soft-mint)',
                    border: '1px solid var(--color-primary-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    Fulfillment Operations:
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {currentOrder.order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition('confirmed')}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle size={14} /> Confirm & Reserve Inventory
                        </button>
                        <button
                          onClick={() => handleStatusTransition('cancelled')}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={14} /> Cancel Order
                        </button>
                      </>
                    )}

                    {currentOrder.order.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition('processing')}
                          className="btn btn-primary btn-sm"
                        >
                          <PackageCheck size={14} /> Mark Processing (Staging & Packing)
                        </button>
                        <button
                          onClick={() => handleStatusTransition('cancelled')}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={14} /> Cancel Order
                        </button>
                      </>
                    )}

                    {currentOrder.order.status === 'processing' && (
                      <button
                        onClick={() => handleStatusTransition('dispatched')}
                        className="btn btn-primary btn-sm"
                      >
                        <Truck size={14} /> Dispatch via Refrigerated Delivery Van
                      </button>
                    )}

                    {currentOrder.order.status === 'dispatched' && (
                      <button
                        onClick={() => handleStatusTransition('delivered')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} /> Confirm Delivered & Handover Complete
                      </button>
                    )}

                    {currentOrder.order.status === 'delivered' && (
                      <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} /> Order successfully delivered and closed.
                      </div>
                    )}

                    {currentOrder.order.status === 'cancelled' && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-error)', fontWeight: 700 }}>
                        Cancelled: {currentOrder.order.cancellation_reason || 'No reason specified'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFA' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Customer & Purchase Reference
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{currentOrder.order.business_name}</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-main)', marginTop: '2px' }}>
                      Contact: {currentOrder.order.contact_person} ({currentOrder.order.contact_phone})
                    </div>
                    {currentOrder.order.po_reference && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        PO Ref: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{currentOrder.order.po_reference}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFA' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Delivery Dock & Schedule
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {new Date(currentOrder.order.delivery_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                      Slot: {currentOrder.order.delivery_slot}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      {currentOrder.order.address_snapshot?.address_line1}, {currentOrder.order.address_snapshot?.city} - {currentOrder.order.address_snapshot?.postal_code}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                    Authoritative Order Items & Historical Snapshots
                  </div>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Item Description</th>
                          <th>Wholesale Unit</th>
                          <th>Unit Price</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrder.items.map((it: any) => (
                          <tr key={it.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{it.product_name_snapshot}</div>
                              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                                {it.sku_snapshot}
                              </div>
                            </td>
                            <td>
                              <div>{it.unit_snapshot}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{it.pack_size_snapshot}</div>
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              ₹{parseFloat(it.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800 }}>{it.quantity}</td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>
                              ₹{parseFloat(it.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                  <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>₹{parseFloat(currentOrder.order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>GST (5%):</span>
                      <span style={{ fontWeight: 600 }}>₹{parseFloat(currentOrder.order.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee:</span>
                      <span style={{ fontWeight: 600 }}>₹{parseFloat(currentOrder.order.delivery_charge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, borderTop: '2px solid var(--color-border)', paddingTop: '6px', color: 'var(--color-primary-dark)' }}>
                      <span>Total Amount:</span>
                      <span>₹{parseFloat(currentOrder.order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Status Audit Timeline */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                    Status Progression Audit Log
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentOrder.history.map((h: any) => (
                      <div
                        key={h.id}
                        style={{
                          fontSize: '0.8rem',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#F8FAF9',
                          border: '1px solid #E6ECE8',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-text-main)' }}>
                            {h.status}:
                          </span>{' '}
                          <span style={{ color: 'var(--color-text-secondary)' }}>{h.notes}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(h.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {h.updated_by_type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Transition Confirmation Modal */}
      {statusUpdateAction && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-content fade-in" style={{ maxWidth: '440px', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
              Confirm Status Transition to: <span style={{ textTransform: 'uppercase', color: 'var(--color-primary)' }}>{statusUpdateAction}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              This will update the order state across Android customer app and web console in real time.
            </p>

            {statusUpdateAction === 'cancelled' && (
              <div style={{ marginBottom: '14px' }}>
                <label className="label">Cancellation Reason *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Out of stock / Restaurant request / Delivery route cancelled"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '4px' }}>
                  Cancelling will automatically restore reserved stock to warehouse inventory.
                </p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="label">Internal Notes</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Optional notes for operations team..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStatusUpdateAction(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitStatusTransition}
                disabled={updatingStatus}
                className={statusUpdateAction === 'cancelled' ? 'btn btn-danger' : 'btn btn-primary'}
              >
                {updatingStatus ? 'Updating...' : 'Confirm Transition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
