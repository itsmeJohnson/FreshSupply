import React, { useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ArrowUpRight,
  TrendingDown,
  Building2,
  FileText,
  DollarSign,
  X,
} from 'lucide-react';

export const CreditFinancePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('NEFT_RTGS');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Accounts Receivable Ledger
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      code: 'FS-CUST-001',
      name: 'GreenMart Retail',
      type: 'Retailer',
      limit: 500000,
      outstanding: 125000,
      available: 375000,
      period: 'Net 30 Days',
      status: 'GOOD_STANDING',
      overdue: 0,
      utilization: 25.0,
      lastPayment: '₹85,000 (3 days ago)',
    },
    {
      id: 2,
      code: 'FS-CUST-002',
      name: 'FreshHub Stores',
      type: 'Retail Chain',
      limit: 300000,
      outstanding: 45000,
      available: 255000,
      period: 'Net 15 Days',
      status: 'GOOD_STANDING',
      overdue: 0,
      utilization: 15.0,
      lastPayment: '₹1,20,000 (1 week ago)',
    },
    {
      id: 3,
      code: 'FS-CUST-003',
      name: 'SuperFood Retail',
      type: 'Supermarket',
      limit: 800000,
      outstanding: 160000,
      available: 640000,
      period: 'Net 45 Days',
      status: 'GOOD_STANDING',
      overdue: 0,
      utilization: 20.0,
      lastPayment: '₹2,50,000 (2 weeks ago)',
    },
    {
      id: 4,
      code: 'FS-CUST-004',
      name: 'EasyVegi Mart',
      type: 'Kirana Group',
      limit: 150000,
      outstanding: 88000,
      available: 62000,
      period: 'Net 7 Days',
      status: 'ATTENTION',
      overdue: 18000,
      utilization: 58.7,
      lastPayment: '₹42,000 (4 days ago)',
    },
    {
      id: 5,
      code: 'FS-CUST-005',
      name: 'QuickNest Retail',
      type: 'Modern Trade',
      limit: 600000,
      outstanding: 210000,
      available: 390000,
      period: 'Net 30 Days',
      status: 'GOOD_STANDING',
      overdue: 0,
      utilization: 35.0,
      lastPayment: '₹1,40,000 (5 days ago)',
    },
    {
      id: 6,
      code: 'FS-CUST-006',
      name: 'SpiceRoute Cloud Kitchens',
      type: 'Cloud Kitchen',
      limit: 250000,
      outstanding: 180000,
      available: 70000,
      period: 'Net 15 Days',
      status: 'OVERDUE',
      overdue: 42000,
      utilization: 72.0,
      lastPayment: '₹50,000 (18 days ago)',
    },
  ]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;

    const amt = parseFloat(paymentAmount);
    setAccounts(accounts.map(acc => {
      if (acc.id === selectedCustomer.id) {
        const newOutstanding = Math.max(0, acc.outstanding - amt);
        const newAvailable = acc.limit - newOutstanding;
        const newOverdue = Math.max(0, acc.overdue - amt);
        return {
          ...acc,
          outstanding: newOutstanding,
          available: newAvailable,
          overdue: newOverdue,
          utilization: Number(((newOutstanding / acc.limit) * 100).toFixed(1)),
          lastPayment: `₹${amt.toLocaleString('en-IN')} (Just Now)`,
          status: newOverdue > 0 ? 'ATTENTION' : 'GOOD_STANDING',
        };
      }
      return acc;
    }));

    setSuccessToast(`Payment of ₹${amt.toLocaleString('en-IN')} recorded for ${selectedCustomer.name}. Credit balance restored.`);
    setTimeout(() => setSuccessToast(null), 4000);
    setPaymentModalOpen(false);
    setSelectedCustomer(null);
    setPaymentAmount('');
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || acc.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'overdue' && acc.overdue > 0) || (statusFilter === 'good' && acc.status === 'GOOD_STANDING');
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Credit Management & Accounts Receivable
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Customer credit limits, exposure tracking, invoice aging, and payment receipts
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCustomer(accounts[0]);
            setPaymentModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Record Customer Payment</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#047857', padding: '12px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }} className="fade-in">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* 4 Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Credit Exposure</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', marginTop: '4px' }}>
            ₹8,08,000
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Across 120 Wholesale Buyers
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Credit Pool</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '4px' }}>
            ₹2.85 Cr
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '4px' }}>
            28.3% Total Utilization
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Overdue Receivables</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-danger)', marginTop: '4px' }}>
            ₹60,000
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-danger)', fontWeight: 700, marginTop: '4px' }}>
            2 Accounts Require Follow-up
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Collection Efficiency</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>
            96.4%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '4px' }}>
            ↑ +2.1% this month
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by customer name, account code, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'good', label: 'Good Standing' },
            { id: 'overdue', label: 'Overdue Attention' },
          ].map(flt => (
            <button
              key={flt.id}
              onClick={() => setStatusFilter(flt.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === flt.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: statusFilter === flt.id ? '#ECFDF5' : '#FFFFFF',
                color: statusFilter === flt.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Business Entity</th>
                <th>Payment Terms</th>
                <th>Credit Limit</th>
                <th>Outstanding Balance</th>
                <th>Available Exposure</th>
                <th>Utilization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(acc => (
                <tr key={acc.id}>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{acc.code}</td>
                  <td>
                    <div style={{ fontWeight: 800 }}>{acc.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{acc.type}</div>
                  </td>
                  <td>
                    <span style={{ backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {acc.period}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800 }}>₹{acc.limit.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 800, color: acc.outstanding > 0 ? '#172B24' : '#64748B' }}>
                    ₹{acc.outstanding.toLocaleString('en-IN')}
                    {acc.overdue > 0 && (
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-danger)', fontWeight: 700 }}>
                        (₹{acc.overdue.toLocaleString('en-IN')} overdue)
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                    ₹{acc.available.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, backgroundColor: '#E2E8E5', height: '6px', borderRadius: '9999px', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{ width: `${Math.min(100, acc.utilization)}%`, height: '100%', backgroundColor: acc.utilization > 60 ? '#EF4444' : '#10B981' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, minWidth: '35px' }}>{acc.utilization}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: acc.status === 'GOOD_STANDING' ? '#ECFDF5' : '#FEF2F2',
                      color: acc.status === 'GOOD_STANDING' ? '#047857' : '#DC2626',
                      border: acc.status === 'GOOD_STANDING' ? '1px solid #10B981' : '1px solid #FECACA',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}>
                      {acc.status === 'GOOD_STANDING' ? 'Active' : 'Attention'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedCustomer(acc);
                        setPaymentModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Receive Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Recording Modal */}
      {paymentModalOpen && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Record Customer Payment</h3>
              <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Customer Account</label>
                <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontWeight: 800 }}>
                  {selectedCustomer.name} ({selectedCustomer.code})
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Current Outstanding: <strong>₹{selectedCustomer.outstanding.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedCustomer.outstanding}
                  placeholder={`Up to ₹${selectedCustomer.outstanding}`}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="select"
                >
                  <option value="NEFT_RTGS">NEFT / RTGS Bank Transfer</option>
                  <option value="UPI">UPI Virtual Payment Address</option>
                  <option value="CHEQUE">Banker Cheque / DD</option>
                  <option value="CREDIT_NOTE">Commercial Credit Note Settlement</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm & Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

