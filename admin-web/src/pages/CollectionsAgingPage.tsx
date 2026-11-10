import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle,
  FileText,
  Search,
  Plus,
  RefreshCw,
  Phone,
  MessageSquare,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { api } from '../api/client';

export const CollectionsAgingPage: React.FC = () => {
  const [agingData, setAgingData] = useState<any | null>(null);
  const [customerReceivables, setCustomerReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'aging' | 'customers'>('aging');

  // Allocate Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payData, setPayData] = useState({
    customerId: 11,
    amount: 25000,
    paymentMethod: 'NEFT_RTGS',
    transactionId: `HDFC-${Date.now().toString().slice(-6)}`,
    notes: 'Commercial settlement against overdue invoices',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [agingRes, custRes] = await Promise.all([
        api.getAgingReport(),
        api.getCustomerReceivables(),
      ]);
      if (agingRes?.success) setAgingData(agingRes.data);
      if (custRes?.success && Array.isArray(custRes.data)) setCustomerReceivables(custRes.data);
    } catch (err) {
      console.error('Failed to load collections aging data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendReminder = async (customerId: number, invoiceId: number, channel: string) => {
    try {
      const res = await api.sendPaymentReminder({ customerId, invoiceId, channel });
      if (res?.success) {
        alert(`Payment collection notice dispatched via ${channel}!`);
      }
    } catch (err) {
      console.error('Failed to dispatch payment reminder:', err);
    }
  };

  const handleAllocatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.allocatePayment(payData);
      if (res?.success) {
        setShowPayModal(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to allocate payment:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#172B24' }}>Collections & Accounts Receivable Aging</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Module 7 &bull; 5-Bucket Ledger Reconciliation
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Strict statutory aging analysis, credit utilization tracking, WhatsApp payment follow-ups, and invoice reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowPayModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Record & Allocate Payment
          </button>
        </div>
      </div>

      {/* The 5 Statutory Aging Buckets Grid */}
      {agingData?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px', borderTop: '3px solid #10B981' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>1. Not Due</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>
              ₹{agingData.summary.notDueTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Within credit terms</div>
          </div>

          <div className="card" style={{ padding: '16px', borderTop: '3px solid #F59E0B' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>2. 1–30 Days Overdue</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>
              ₹{agingData.summary.days1To30Total.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Grace period reminders</div>
          </div>

          <div className="card" style={{ padding: '16px', borderTop: '3px solid #EA580C' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>3. 31–60 Days Overdue</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
              ₹{agingData.summary.days31To60Total.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Order hold warning</div>
          </div>

          <div className="card" style={{ padding: '16px', borderTop: '3px solid #DC2626' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>4. 61–90 Days Overdue</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
              ₹{agingData.summary.days61To90Total.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#DC2626', marginTop: '2px' }}>Restricted account</div>
          </div>

          <div className="card" style={{ padding: '16px', borderTop: '3px solid #991B1B' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>5. &gt; 90 Days Overdue</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#991B1B', marginTop: '4px' }}>
              ₹{agingData.summary.days90PlusTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#991B1B', marginTop: '2px' }}>Commercial legal notice</div>
          </div>
        </div>
      )}

      {/* Main Table: Open Invoices with Reminder Triggers */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Aging Receivables Ledger ({agingData?.invoices?.length || 0} Open Invoices)</h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Outstanding Exposure: <strong>₹{agingData?.summary?.totalReceivables?.toLocaleString('en-IN')}</strong></p>
          </div>

          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh Aging
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Invoice #</th>
              <th style={{ padding: '12px 16px' }}>Customer Enterprise</th>
              <th style={{ padding: '12px 16px' }}>Due Date</th>
              <th style={{ padding: '12px 16px' }}>Aging Bucket</th>
              <th style={{ padding: '12px 16px' }}>Invoice Amount</th>
              <th style={{ padding: '12px 16px' }}>Balance Due</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Follow-up Reminders</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Calculating aging buckets...</td>
              </tr>
            ) : !agingData || agingData.invoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>All invoices reconciled! No open receivables.</td>
              </tr>
            ) : (
              agingData.invoices.map((inv: any) => {
                const isOverdue = inv.aging_bucket !== 'NOT_DUE';
                return (
                  <tr key={inv.invoice_id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>
                      {inv.invoice_number}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800 }}>{inv.business_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {inv.contact_person} &bull; {inv.contact_phone}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{new Date(inv.due_date).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: '0.7rem', color: isOverdue ? '#DC2626' : '#047857', fontWeight: 700 }}>
                        {isOverdue ? `${inv.days_overdue} days overdue` : 'On track'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            inv.aging_bucket === 'NOT_DUE' ? '#ECFDF5' :
                            inv.aging_bucket === 'DAYS_1_30' ? '#FFFBEB' :
                            inv.aging_bucket === 'DAYS_31_60' ? '#FFEDD5' : '#FEF2F2',
                          color:
                            inv.aging_bucket === 'NOT_DUE' ? '#047857' :
                            inv.aging_bucket === 'DAYS_1_30' ? '#D97706' :
                            inv.aging_bucket === 'DAYS_31_60' ? '#EA580C' : '#DC2626',
                          border: '1px solid currentColor',
                        }}
                      >
                        {inv.aging_bucket.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 900, color: isOverdue ? '#DC2626' : '#172B24', fontSize: '0.95rem' }}>
                      ₹{parseFloat(inv.balance_due).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSendReminder(inv.customer_id, inv.invoice_id, 'WHATSAPP')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Dispatch WhatsApp Reminder"
                        >
                          <MessageSquare size={13} color="#16A34A" /> WhatsApp
                        </button>
                        <button
                          onClick={() => handleSendReminder(inv.customer_id, inv.invoice_id, 'SMS')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Dispatch SMS Notice"
                        >
                          <Send size={13} color="#2563EB" /> SMS
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

      {/* Allocate Payment Modal */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Record Customer Payment Receipt</h2>
            <form onSubmit={handleAllocatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label">Customer Account</label>
                <select
                  className="select"
                  value={payData.customerId}
                  onChange={e => setPayData({ ...payData, customerId: parseInt(e.target.value, 10) })}
                >
                  {customerReceivables.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.business_name} &bull; Due: ₹{c.total_invoice_due}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Received Amount (₹)</label>
                  <input className="input" type="number" required value={payData.amount} onChange={e => setPayData({ ...payData, amount: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Payment Mode</label>
                  <select className="select" value={payData.paymentMethod} onChange={e => setPayData({ ...payData, paymentMethod: e.target.value })}>
                    <option value="NEFT_RTGS">NEFT / RTGS</option>
                    <option value="BANK_TRANSFER">IMPS / Direct Transfer</option>
                    <option value="UPI">UPI Corporate QR</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Bank UTR / Transaction Reference</label>
                <input className="input" required value={payData.transactionId} onChange={e => setPayData({ ...payData, transactionId: e.target.value })} />
              </div>

              <div>
                <label className="label">Reconciliation Notes</label>
                <textarea className="textarea" rows={2} value={payData.notes} onChange={e => setPayData({ ...payData, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowPayModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate & Reconcile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

