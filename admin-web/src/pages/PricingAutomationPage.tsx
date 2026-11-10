import React, { useEffect, useState } from 'react';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileCheck,
  Search,
  ArrowRight,
  ShieldAlert,
  Percent,
  RefreshCw,
  Building,
} from 'lucide-react';
import { api } from '../api/client';

export const PricingAutomationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'approvals' | 'margins'>('simulator');

  // Simulator State
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(11); // Default to Basmati Rice
  const [proposedPrice, setProposedPrice] = useState<number>(1950);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [submitReason, setSubmitReason] = useState('Adjusting wholesale rate to accommodate new procurement costs.');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Approvals State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Margins State
  const [margins, setMargins] = useState<any[]>([]);
  const [loadingMargins, setLoadingMargins] = useState(false);
  const [lowMarginOnly, setLowMarginOnly] = useState(false);

  useEffect(() => {
    // Load active products for simulator
    api.getProducts().then(res => {
      if (res?.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    }).catch(err => console.error('Failed to load products:', err));
  }, []);

  const runSimulation = async (pId: number, price: number) => {
    try {
      setSimulating(true);
      const res = await api.simulatePriceChange({
        productId: pId,
        proposedPrice: price,
      });
      if (res?.success) {
        setSimResult(res.data);
      }
    } catch (err) {
      console.error('Failed to run simulation:', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedProductId && proposedPrice > 0) {
      runSimulation(selectedProductId, proposedPrice);
    }
  }, [selectedProductId, proposedPrice]);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.getPriceChangeRequests();
      if (res?.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load PCRs:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadMargins = async () => {
    try {
      setLoadingMargins(true);
      const res = await api.getMargins({ lowMarginOnly });
      if (res?.success && Array.isArray(res.data)) {
        setMargins(res.data);
      }
    } catch (err) {
      console.error('Failed to load margins:', err);
    } finally {
      setLoadingMargins(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') loadRequests();
    if (activeTab === 'margins') loadMargins();
  }, [activeTab, lowMarginOnly]);

  const handleSubmitPCR = async () => {
    if (!submitReason) return;
    try {
      setSubmittingRequest(true);
      const res = await api.submitPriceChangeRequest({
        requestType: 'CUSTOMER_SKU',
        entityId: selectedProductId,
        proposedPrice,
        reason: submitReason,
      });
      if (res?.success) {
        alert(`Price Change Request #${res.data.request_number} submitted to Approval Queue.`);
        setActiveTab('approvals');
      }
    } catch (err) {
      console.error('Failed to submit PCR:', err);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleReviewPCR = async (id: number, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.reviewPriceChangeRequest(id, action, `Actioned via admin console: ${action}`);
      if (res?.success) {
        loadRequests();
      }
    } catch (err) {
      console.error('Failed to review PCR:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#172B24' }}>Wholesale Pricing Automation & Simulator</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Module 3 &bull; Governance & Revenue
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Simulate revenue and gross margin impact before publishing rate changes. Enforce four-eyes approval workflows.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F3', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'simulator' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'simulator' ? '#047857' : '#64748B',
              boxShadow: activeTab === 'simulator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Pricing Simulator
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'approvals' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'approvals' ? '#047857' : '#64748B',
              boxShadow: activeTab === 'approvals' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Approval Queue ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('margins')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'margins' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'margins' ? '#047857' : '#64748B',
              boxShadow: activeTab === 'margins' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Margin Analysis
          </button>
        </div>
      </div>

      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '24px' }}>
          {/* Controls Panel */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>
              Simulate Wholesale Price Revision
            </h2>

            <div>
              <label className="label">Target Wholesale Product SKU</label>
              <select
                className="select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(parseInt(e.target.value, 10))}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) &bull; Current Base: ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="label" style={{ margin: 0 }}>Proposed Price per Unit (₹)</label>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#047857' }}>₹{proposedPrice}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="25"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#047857' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {[1700, 1800, 1950, 2100, 2400].map(val => (
                  <button
                    key={val}
                    onClick={() => setProposedPrice(val)}
                    style={{
                      flex: 1,
                      padding: '4px',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: proposedPrice === val ? '1px solid #047857' : '1px solid #E2E8E5',
                      backgroundColor: proposedPrice === val ? '#ECFDF5' : '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Commercial Justification for Revision</label>
              <textarea
                className="textarea"
                rows={3}
                value={submitReason}
                onChange={(e) => setSubmitReason(e.target.value)}
                placeholder="Market mandi arrivals, diesel freight changes, seasonal supplier contract adjustments..."
              />
            </div>

            <button
              onClick={handleSubmitPCR}
              disabled={submittingRequest}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FileCheck size={16} /> Submit for Commercial Approval
            </button>
          </div>

          {/* Real-Time Impact Assessment */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172B24' }}>
                Real-Time Revenue & Margin Projection
              </h2>
              {simulating && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Recalculating...</span>}
            </div>

            {simResult && (
              <>
                {simResult.minMarginWarning && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #F87171',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#B91C1C',
                    }}
                  >
                    <AlertTriangle size={20} />
                    <div style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                      <strong>CRITICAL MINIMUM MARGIN VIOLATION:</strong> Proposed rate produces a gross margin of{' '}
                      <strong>{simResult.proposedMarginPct}%</strong> (below company threshold of 10.0%). Requires CFO authorization.
                    </div>
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  <div style={{ backgroundColor: '#F8FAF9', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Affected Customer Base</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#172B24', marginTop: '2px' }}>
                      {simResult.affectedCustomersCount} Accounts
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#047857' }}>100% Active Buyer Coverage</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAF9', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Forecasted Monthly Volume</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#172B24', marginTop: '2px' }}>
                      {simResult.estimatedMonthlyVolume} Units
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Based on 30-day velocity</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAF9', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Estimated Revenue Impact</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: simResult.estimatedRevenueImpact >= 0 ? '#047857' : '#DC2626', marginTop: '2px' }}>
                      {simResult.estimatedRevenueImpact >= 0 ? '+' : ''}₹{Math.abs(simResult.estimatedRevenueImpact).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{simResult.percentageDelta}% delta per unit</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAF9', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>New Gross Margin %</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: simResult.proposedMarginPct >= 10 ? '#047857' : '#DC2626', marginTop: '2px' }}>
                      {simResult.proposedMarginPct}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Previous: {simResult.currentMarginPct}%</div>
                  </div>
                </div>

                {/* Price Comparison Summary */}
                <div style={{ border: '1px solid #E2E8E5', borderRadius: '8px', padding: '14px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Weighted Current Average Price:</span>
                    <strong>₹{simResult.currentAvgPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Proposed New Selling Price:</span>
                    <strong style={{ color: '#047857' }}>₹{simResult.proposedAvgPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', marginTop: '4px' }}>
                    <span style={{ color: '#64748B' }}>Gross Profit Impact (Monthly):</span>
                    <strong style={{ color: simResult.estimatedMarginImpact >= 0 ? '#047857' : '#DC2626' }}>
                      {simResult.estimatedMarginImpact >= 0 ? '+' : ''}₹{Math.abs(simResult.estimatedMarginImpact).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Price Change Requests (PCR Queue)</h2>
            <button onClick={loadRequests} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh Queue
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Request #</th>
                <th style={{ padding: '12px 16px' }}>Product SKU</th>
                <th style={{ padding: '12px 16px' }}>Previous</th>
                <th style={{ padding: '12px 16px' }}>Proposed</th>
                <th style={{ padding: '12px 16px' }}>Change</th>
                <th style={{ padding: '12px 16px' }}>Reason & Justification</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingRequests ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No price change requests pending approval.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857' }}>{req.request_number}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{req.product_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{req.product_sku}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>₹{parseFloat(req.previous_price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>₹{parseFloat(req.proposed_price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', color: parseFloat(req.percentage_change) >= 0 ? '#047857' : '#DC2626', fontWeight: 700 }}>
                      {parseFloat(req.percentage_change) >= 0 ? '+' : ''}{req.percentage_change}%
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '280px', color: '#475569', fontSize: '0.78rem' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: req.status === 'APPROVED' ? '#ECFDF5' : req.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
                          color: req.status === 'APPROVED' ? '#047857' : req.status === 'REJECTED' ? '#DC2626' : '#B45309',
                          border: '1px solid currentColor',
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {req.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleReviewPCR(req.id, 'APPROVED')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewPCR(req.id, 'REJECTED')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{req.reviewed_by}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'margins' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Customer-wise Product Margin Analysis</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Gross margins calculated as (Effective Wholesale Price - Cost Price) / Effective Price</p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={lowMarginOnly}
                onChange={e => setLowMarginOnly(e.target.checked)}
              />
              Show Only Low Margin (&lt; 10%) Warnings
            </label>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Wholesale SKU</th>
                <th style={{ padding: '12px 16px' }}>Buyer Account</th>
                <th style={{ padding: '12px 16px' }}>Procurement Cost</th>
                <th style={{ padding: '12px 16px' }}>Selling Price</th>
                <th style={{ padding: '12px 16px' }}>Gross Margin (₹)</th>
                <th style={{ padding: '12px 16px' }}>Margin %</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingMargins ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Analyzing margins...</td>
                </tr>
              ) : margins.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No products matching criteria.</td>
                </tr>
              ) : (
                margins.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F3' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{m.product_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{m.sku} &bull; {m.unit}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{m.business_name}</td>
                    <td style={{ padding: '12px 16px' }}>₹{parseFloat(m.cost_price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{parseFloat(m.effective_price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 700 }}>
                      +₹{parseFloat(m.margin_amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: parseFloat(m.margin_percentage) < 10 ? '#DC2626' : '#047857' }}>
                      {m.margin_percentage}%
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {parseFloat(m.margin_percentage) < 10 ? (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #F87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Sub-optimal (&lt; 10%)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Healthy Margin
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

