import React, { useEffect, useState } from 'react';
import { Users, Search, Eye, X, ShieldAlert, CheckCircle, MapPin, ShoppingBag } from 'lucide-react';
import { api } from '../api/client';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Detail Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers(search);
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  const openCustomerDetail = async (id: number) => {
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await api.getCustomer(id);
      if (res.success) setSelectedCustomer(res.data);
    } catch (err) {
      console.error('Failed to get customer detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.toggleCustomerStatus(id);
      loadCustomers();
      if (selectedCustomer && selectedCustomer.customer.id === id) {
        openCustomerDetail(id);
      }
    } catch (err) {
      console.error('Failed to toggle customer status:', err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Business Customer Accounts
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Procurement profiles, delivery docks, GST credentials and ordering history
        </p>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px', marginBottom: '18px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by restaurant name, contact person, or phone number..."
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

      {/* Customer List */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Business Entity</th>
              <th>Contact Person</th>
              <th>GSTIN</th>
              <th>Orders</th>
              <th>Lifetime Spend</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px' }}>
                  Loading customer accounts...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px' }}>
                  No customer businesses found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.business_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{c.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.contact_person}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{c.phone}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {c.gst_number || 'Unregistered'}
                  </td>
                  <td style={{ fontWeight: 700 }}>{c.total_orders} orders</td>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    ₹{parseFloat(c.total_spend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: c.is_active ? 'var(--color-primary-light)' : '#FEE2E2',
                        color: c.is_active ? 'var(--color-primary-dark)' : 'var(--color-error)',
                        border: `1px solid ${c.is_active ? '#A7F3D0' : '#FECACA'}`,
                      }}
                    >
                      {c.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openCustomerDetail(c.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`btn btn-sm ${c.is_active ? 'btn-danger' : 'btn-soft'}`}
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      >
                        {c.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '680px', padding: '24px' }}>
            {loadingDetail || !selectedCustomer ? (
              <div style={{ textAlign: 'center', padding: '36px' }}>Loading customer details...</div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', borderBottom: '1px solid #edf1ee', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedCustomer.customer.business_name}</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {selectedCustomer.customer.email} • {selectedCustomer.customer.phone}
                    </div>
                  </div>
                  <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#FAFCFA', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Contact Representative
                    </div>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedCustomer.customer.contact_person}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>GST: {selectedCustomer.customer.gst_number || 'N/A'}</div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: '#FAFCFA', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Onboarding Date
                    </div>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>
                      {new Date(selectedCustomer.customer.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: selectedCustomer.customer.is_active ? 'var(--color-primary-dark)' : 'var(--color-error)' }}>
                      Status: {selectedCustomer.customer.is_active ? 'Verified & Active' : 'Suspended'}
                    </div>
                  </div>
                </div>

                {/* Delivery Locations */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>
                    Registered Delivery Docks & Kitchens ({selectedCustomer.addresses.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCustomer.addresses.map((a: any) => (
                      <div
                        key={a.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="var(--color-primary)" />
                          {a.label}
                          {a.is_default && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-soft-mint)', color: 'var(--color-primary-dark)', padding: '1px 6px', borderRadius: '4px' }}>
                              Default
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {a.address_line1}, {a.address_line2 ? `${a.address_line2}, ` : ''}{a.city} - {a.postal_code}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders History */}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>
                    Order History ({selectedCustomer.orders.length})
                  </div>
                  <div className="table-container" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.orders.map((o: any) => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{o.order_number}</td>
                            <td style={{ fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                            <td style={{ fontWeight: 700 }}>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                            <td>
                              <span className="badge" style={{ textTransform: 'capitalize' }}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
