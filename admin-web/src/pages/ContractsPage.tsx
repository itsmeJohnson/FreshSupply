import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  CreditCard,
  Building,
  ShieldCheck,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../api/client';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [contractDetail, setContractDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Create Contract Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [newContract, setNewContract] = useState({
    customerId: 10,
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-03-31',
    creditPeriodDays: 30,
    creditLimit: 500000,
    minOrderValue: 10000,
    freeDeliveryThreshold: 15000,
    paymentTerms: 'Net 30 Days (Bank Transfer / NEFT)',
    specialTerms: 'Refrigerated early morning delivery before 08:00 AM.',
    skuTerms: [
      { productId: 11, agreedPrice: 1800, minOrderQty: 10, notes: 'Basmati Rice Volume Rate' }
    ],
  });

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await api.getContracts({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search,
      });
      if (res?.success && Array.isArray(res.data)) {
        setContracts(res.data);
      }
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    api.getCustomers().then(r => { if (r?.success) setCustomers(r.data); });
    api.getProducts().then(r => { if (r?.success) setProducts(r.data); });
  }, [statusFilter]);

  const openDetail = async (id: number) => {
    setSelectedContractId(id);
    setLoadingDetail(true);
    try {
      const res = await api.getContract(id);
      if (res?.success && res.data) {
        setContractDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load contract details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createContract(newContract);
      if (res?.success) {
        setShowCreateModal(false);
        loadContracts();
      }
    } catch (err) {
      console.error('Failed to create contract:', err);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await api.updateContractStatus(id, status, `Manual review: ${status}`);
      if (res?.success) {
        loadContracts();
        if (selectedContractId === id) openDetail(id);
      }
    } catch (err) {
      console.error('Failed to update contract status:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#172B24' }}>Commercial Contracts & Agreements</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Module 2 &bull; Enterprise Legal & Pricing
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Customer-specific negotiated agreements, pricing locks, payment terms, minimum order quantities, and delivery thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Draft New Agreement
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Contracts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>
            {contracts.filter(c => c.status === 'ACTIVE').length} Agreements
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>Legally binding negotiated rates</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Locked Sourcing Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#172B24', marginTop: '4px' }}>₹60.0 Lakhs</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Annual committed buyer volume</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pre-Approved Credit</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>₹5,00,000</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Net 30 Days commercial terms</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Contract Compliance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#172B24', marginTop: '4px' }}>100%</div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>Integrated with billing engine</div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Agreement #</th>
              <th style={{ padding: '12px 16px' }}>Customer Enterprise</th>
              <th style={{ padding: '12px 16px' }}>Validity Period</th>
              <th style={{ padding: '12px 16px' }}>Credit Limit</th>
              <th style={{ padding: '12px 16px' }}>Payment Terms</th>
              <th style={{ padding: '12px 16px' }}>Contracted SKUs</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading commercial agreements...</td>
              </tr>
            ) : contracts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No commercial agreements found.</td>
              </tr>
            ) : (
              contracts.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>
                    {c.contract_number}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800 }}>{c.business_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{c.title}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{new Date(c.start_date).toLocaleDateString('en-IN')} &rarr; {new Date(c.end_date).toLocaleDateString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>v{c.version}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 800 }}>
                    ₹{parseFloat(c.credit_limit).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 700 }}>
                    {c.payment_terms}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {c.contracted_skus_count} Locked SKUs
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: c.status === 'ACTIVE' ? '#ECFDF5' : '#FFFBEB',
                        color: c.status === 'ACTIVE' ? '#047857' : '#B45309',
                        border: '1px solid currentColor',
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openDetail(c.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      View Terms &rarr;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contract Detail Modal */}
      {selectedContractId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedContractId(null); }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '28px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8E5', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Master Wholesale Commercial Agreement
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#172B24', marginTop: '6px' }}>
                  {contractDetail?.contract?.title || 'Loading Agreement...'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Contract #{contractDetail?.contract?.contract_number} &bull; Customer: <strong>{contractDetail?.contract?.business_name}</strong>
                </div>
              </div>

              <button onClick={() => setSelectedContractId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading contract clauses and agreed SKU rates...</div>
            ) : !contractDetail ? (
              <div style={{ padding: '40px', color: '#DC2626' }}>Failed to load contract terms.</div>
            ) : (
              <>
                {/* Commercial Clauses Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', backgroundColor: '#F8FAF9', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Credit Facility</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>
                      ₹{parseFloat(contractDetail.contract.credit_limit).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>{contractDetail.contract.payment_terms}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Min. Order Value (MOV)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172B24' }}>
                      ₹{parseFloat(contractDetail.contract.min_order_value).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>Free dispatch above ₹{parseFloat(contractDetail.contract.free_delivery_threshold).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Contract Validity</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#172B24', marginTop: '2px' }}>
                      {new Date(contractDetail.contract.start_date).toLocaleDateString('en-IN')} &rarr; {new Date(contractDetail.contract.end_date).toLocaleDateString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981' }}>Approved by {contractDetail.contract.approved_by}</div>
                  </div>
                </div>

                {/* Special Clauses */}
                {contractDetail.contract.special_terms && (
                  <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.8rem', color: '#065F46' }}>
                    <strong>Special Negotiated Terms:</strong> {contractDetail.contract.special_terms}
                  </div>
                )}

                {/* Agreed SKU Rates Table */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B24', marginBottom: '10px' }}>
                    Agreed Contract Product Rates (Priority 1 in Pricing Engine)
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #E2E8E5', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F3', textAlign: 'left', color: '#64748B' }}>
                        <th style={{ padding: '8px 12px' }}>Product</th>
                        <th style={{ padding: '8px 12px' }}>Catalog Price</th>
                        <th style={{ padding: '8px 12px' }}>Agreed Contract Price</th>
                        <th style={{ padding: '8px 12px' }}>Min Order Qty</th>
                        <th style={{ padding: '8px 12px' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractDetail.skuTerms.map((t: any) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700 }}>{t.product_name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{t.sku} &bull; {t.unit}</div>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{parseFloat(t.catalog_price).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
                            ₹{parseFloat(t.agreed_price).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700 }}>{t.min_order_qty} units</td>
                          <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '0.75rem' }}>{t.notes || 'Locked contract rate'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8E5', paddingTop: '16px' }}>
                  {contractDetail.contract.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleStatusChange(contractDetail.contract.id, 'ACTIVE')}
                      className="btn btn-primary"
                    >
                      Approve & Activate Contract
                    </button>
                  )}
                  <button onClick={() => setSelectedContractId(null)} className="btn btn-secondary">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Draft Commercial Agreement</h2>
            <form onSubmit={handleCreateContract} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label">Wholesale Customer Account</label>
                <select
                  className="select"
                  value={newContract.customerId}
                  onChange={e => setNewContract({ ...newContract, customerId: parseInt(e.target.value, 10) })}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.business_name} ({c.contact_person})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Agreement Title</label>
                <input
                  className="input"
                  required
                  value={newContract.title}
                  onChange={e => setNewContract({ ...newContract, title: e.target.value })}
                  placeholder="e.g. Annual Master Wholesale Supply Contract 2026-27"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Start Date</label>
                  <input className="input" type="date" required value={newContract.startDate} onChange={e => setNewContract({ ...newContract, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input className="input" type="date" required value={newContract.endDate} onChange={e => setNewContract({ ...newContract, endDate: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Credit Limit (₹)</label>
                  <input className="input" type="number" value={newContract.creditLimit} onChange={e => setNewContract({ ...newContract, creditLimit: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Credit Period (Days)</label>
                  <select className="select" value={newContract.creditPeriodDays} onChange={e => setNewContract({ ...newContract, creditPeriodDays: parseInt(e.target.value, 10) })}>
                    <option value={7}>7 Days</option>
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={45}>45 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Special Delivery & SLA Clauses</label>
                <textarea className="textarea" rows={2} value={newContract.specialTerms} onChange={e => setNewContract({ ...newContract, specialTerms: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Activate Agreement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

