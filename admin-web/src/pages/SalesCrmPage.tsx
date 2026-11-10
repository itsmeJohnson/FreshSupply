import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Building,
  UserCheck,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  X,
  CreditCard,
  Package,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';

export const SalesCrmPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Register Lead Modal
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: 'Restaurant',
    city: 'Bangalore',
    estimatedMonthlyValue: 350000,
    notes: '',
  });

  // Log Activity Modal
  const [activityLead, setActivityLead] = useState<any | null>(null);
  const [activityData, setActivityData] = useState({
    activityType: 'CALL',
    summary: '',
    details: '',
    newLeadStatus: '',
  });

  // Customer 360 Profile Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customer360, setCustomer360] = useState<any | null>(null);
  const [loading360, setLoading360] = useState(false);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await api.getLeads({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search,
      });
      if (res?.success && Array.isArray(res.data)) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load CRM leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createLead(newLead);
      if (res?.success) {
        setShowAddLead(false);
        setNewLead({
          businessName: '',
          contactPerson: '',
          email: '',
          phone: '',
          businessType: 'Restaurant',
          city: 'Bangalore',
          estimatedMonthlyValue: 350000,
          notes: '',
        });
        loadLeads();
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityLead) return;
    try {
      const res = await api.logActivity(activityLead.id, activityData);
      if (res?.success) {
        setActivityLead(null);
        setActivityData({ activityType: 'CALL', summary: '', details: '', newLeadStatus: '' });
        loadLeads();
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleConvertLead = async (leadId: number) => {
    if (!window.confirm('Convert this prospective lead into an active wholesale customer account with pre-approved credit?')) {
      return;
    }
    try {
      const res = await api.convertLead(leadId);
      if (res?.success) {
        alert('Lead successfully converted! Customer account created.');
        loadLeads();
        if (res.customerId) {
          openCustomer360(res.customerId);
        }
      }
    } catch (err) {
      console.error('Failed to convert lead:', err);
    }
  };

  const openCustomer360 = async (customerId: number) => {
    setSelectedCustomerId(customerId);
    setLoading360(true);
    try {
      const res = await api.getCustomer360(customerId);
      if (res?.success && res.data) {
        setCustomer360(res.data);
      }
    } catch (err) {
      console.error('Failed to load customer 360 profile:', err);
    } finally {
      setLoading360(false);
    }
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#172B24' }}>B2B Wholesale Sales CRM</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Module 1 &bull; Active Pipeline
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Lead generation, sales representative assignments, follow-ups, conversion workflows, and 360° buyer profile.
          </p>
        </div>

        <button
          onClick={() => setShowAddLead(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Register New Lead
        </button>
      </div>

      {/* Pipeline KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Pipeline Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>₹14.50 Lakh/mo</div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>3 High-potential accounts</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Proposal Sent</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#172B24', marginTop: '4px' }}>1 Hotel Chain</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Grand Chola (Est. ₹4.5L/mo)</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Conversion Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#172B24', marginTop: '4px' }}>76.4%</div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>Qualified &rarr; Customer</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Wholesale Customer 360</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>123 Accounts</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Click any buyer to inspect</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: statusFilter === st ? '1px solid #047857' : '1px solid #E2E8E5',
                backgroundColor: statusFilter === st ? '#ECFDF5' : '#FFFFFF',
                color: statusFilter === st ? '#047857' : '#64748B',
                cursor: 'pointer',
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '36px' }}
            placeholder="Search leads, chefs, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') loadLeads(); }}
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Prospective Business</th>
              <th style={{ padding: '12px 16px' }}>Decision Maker</th>
              <th style={{ padding: '12px 16px' }}>Est. Monthly Value</th>
              <th style={{ padding: '12px 16px' }}>Sales Rep</th>
              <th style={{ padding: '12px 16px' }}>Stage</th>
              <th style={{ padding: '12px 16px' }}>Recent Activity</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading sales pipeline...</td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No leads found in this pipeline stage.</td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#172B24' }}>{lead.business_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{lead.business_type} &bull; {lead.city}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{lead.contact_person}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{lead.phone} &bull; {lead.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857' }}>
                    ₹{parseFloat(lead.estimated_monthly_value || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {lead.rep_name || 'Accounts Lead'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: lead.status === 'CONVERTED' ? '#ECFDF5' : lead.status === 'PROPOSAL_SENT' ? '#EFF6FF' : '#FFFBEB',
                        color: lead.status === 'CONVERTED' ? '#047857' : lead.status === 'PROPOSAL_SENT' ? '#1D4ED8' : '#B45309',
                        border: '1px solid currentColor',
                      }}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{lead.last_activity_summary || 'No interactions logged'}</div>
                    {lead.last_activity_date && (
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        {new Date(lead.last_activity_date).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => setActivityLead(lead)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      >
                        Log Activity
                      </button>
                      {lead.status !== 'CONVERTED' ? (
                        <button
                          onClick={() => handleConvertLead(lead.id)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        >
                          Convert &rarr;
                        </button>
                      ) : (
                        <button
                          onClick={() => openCustomer360(lead.customer_id || 10)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: '#047857', color: '#047857' }}
                        >
                          360° Profile
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer 360-Degree Modal Drawer */}
      {selectedCustomerId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCustomerId(null); }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8E5', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Customer 360° Profile
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#172B24', marginTop: '6px' }}>
                  {customer360?.customer?.business_name || 'Loading Account Profile...'}
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {customer360?.customer?.contact_person} &bull; {customer360?.customer?.phone}
                </div>
              </div>

              <button onClick={() => setSelectedCustomerId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {loading360 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading real-time buyer analytics...</div>
            ) : !customer360 ? (
              <div style={{ padding: '40px', color: '#DC2626' }}>Could not load customer analytics.</div>
            ) : (
              <>
                {/* Financial Health & Credit Exposure */}
                <div style={{ backgroundColor: '#F8FAF9', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Credit & Commercial Terms
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Credit Limit</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>₹{customer360.creditProfile.creditLimit.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Outstanding Exposure</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#D97706' }}>₹{customer360.creditProfile.outstandingBalance.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Available Balance</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857' }}>₹{customer360.creditProfile.availableCredit.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#475569' }}>
                    Approved Terms: <strong>{customer360.creditProfile.paymentTerms}</strong> &bull; Utilization: <strong>{customer360.creditProfile.utilizationPercentage}%</strong>
                  </div>
                </div>

                {/* Lifetime Order Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Lifetime Spend</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#172B24' }}>₹{customer360.metrics.lifetimeSpend.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Orders Placed</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#172B24' }}>{customer360.metrics.totalOrders}</div>
                  </div>
                  <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Average Order Value</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#047857' }}>₹{customer360.metrics.averageOrderValue.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Most Purchased Products */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24', marginBottom: '8px' }}>
                    Top Purchased Wholesale SKUs
                  </div>
                  {customer360.topProducts.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>No historical orders recorded yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {customer360.topProducts.map((p: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAF9', borderRadius: '6px', fontSize: '0.78rem' }}>
                          <div>
                            <strong>{p.name}</strong> <span style={{ color: '#64748B' }}>({p.sku})</span>
                          </div>
                          <div>
                            {p.total_qty} units &bull; <strong>₹{parseFloat(p.total_spent).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contracted Negotiated Prices */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#172B24', marginBottom: '8px' }}>
                    Active Negotiated SKU Overrides
                  </div>
                  {customer360.negotiatedPrices.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Using standard wholesale catalog rates.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {customer360.negotiatedPrices.map((np: any) => (
                        <div key={np.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid #E2E8E5', borderRadius: '6px', fontSize: '0.78rem' }}>
                          <div>
                            <strong>{np.product_name}</strong>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{np.notes || 'Contracted override'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, color: '#047857', fontSize: '0.9rem' }}>₹{parseFloat(np.custom_price).toLocaleString('en-IN')}</span>
                            <div style={{ fontSize: '0.68rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹{parseFloat(np.catalog_price).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Register Prospective B2B Lead</h2>
            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label">Business / Entity Name</label>
                <input className="input" required value={newLead.businessName} onChange={e => setNewLead({ ...newLead, businessName: e.target.value })} placeholder="e.g. Royal Orchid Banquets" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Decision Maker / Chef</label>
                  <input className="input" required value={newLead.contactPerson} onChange={e => setNewLead({ ...newLead, contactPerson: e.target.value })} placeholder="Chef Anita" />
                </div>
                <div>
                  <label className="label">Business Type</label>
                  <select className="select" value={newLead.businessType} onChange={e => setNewLead({ ...newLead, businessType: e.target.value })}>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel & Banquets">Hotel & Banquets</option>
                    <option value="Cloud Kitchen Chain">Cloud Kitchen Chain</option>
                    <option value="Supermarket Retail">Supermarket Retail</option>
                    <option value="Corporate Catering">Corporate Catering</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Contact Phone</label>
                  <input className="input" required value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="+91 98450 ..." />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" required value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="buyer@outlet.com" />
                </div>
              </div>
              <div>
                <label className="label">Estimated Monthly Value (₹)</label>
                <input className="input" type="number" value={newLead.estimatedMonthlyValue} onChange={e => setNewLead({ ...newLead, estimatedMonthlyValue: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="label">Sourcing Notes & Special Requirements</label>
                <textarea className="textarea" rows={2} value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} placeholder="Perishable delivery times, organic certificate requests..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddLead(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {activityLead && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Log Sales Activity</h2>
            <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700, marginBottom: '14px' }}>
              {activityLead.business_name}
            </div>

            <form onSubmit={handleLogActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label">Activity Type</label>
                <select className="select" value={activityData.activityType} onChange={e => setActivityData({ ...activityData, activityType: e.target.value })}>
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">On-Site Kitchen Meeting</option>
                  <option value="EMAIL">Email / Commercial Quotation</option>
                  <option value="SAMPLE_DELIVERY">Sample Produce Handover</option>
                  <option value="NOTE">Internal Sourcing Note</option>
                </select>
              </div>
              <div>
                <label className="label">Activity Summary</label>
                <input className="input" required value={activityData.summary} onChange={e => setActivityData({ ...activityData, summary: e.target.value })} placeholder="e.g. Discussed 50-crate weekly tomato requirement" />
              </div>
              <div>
                <label className="label">Detailed Notes / Outcome</label>
                <textarea className="textarea" rows={3} value={activityData.details} onChange={e => setActivityData({ ...activityData, details: e.target.value })} placeholder="Chef requested 30-day payment terms..." />
              </div>
              <div>
                <label className="label">Update Pipeline Stage</label>
                <select className="select" value={activityData.newLeadStatus} onChange={e => setActivityData({ ...activityData, newLeadStatus: e.target.value })}>
                  <option value="">Keep current stage ({activityLead.status})</option>
                  <option value="CONTACTED">Mark Contacted</option>
                  <option value="QUALIFIED">Mark Qualified</option>
                  <option value="PROPOSAL_SENT">Mark Proposal Sent</option>
                  <option value="LOST">Mark Lost</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActivityLead(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

