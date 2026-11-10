import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  TrendingDown,
  Building,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';

export const ProcurementPlanningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'reorder' | 'requisitions'>('quotes');

  // Multi-Supplier Quotes State
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(3); // Default Tomato
  const [quoteComparison, setQuoteComparison] = useState<any | null>(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Reorder Recommendations State
  const [reorders, setReorders] = useState<any[]>([]);
  const [loadingReorders, setLoadingReorders] = useState(false);

  // Requisitions State
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  useEffect(() => {
    api.getProducts().then(r => {
      if (r?.success && Array.isArray(r.data)) setProducts(r.data);
    });
  }, []);

  const loadQuotes = async (pId: number) => {
    try {
      setLoadingQuotes(true);
      const res = await api.getQuoteComparison(pId);
      if (res?.success) setQuoteComparison(res.data);
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) loadQuotes(selectedProductId);
  }, [selectedProductId]);

  const loadReorders = async () => {
    try {
      setLoadingReorders(true);
      const res = await api.getReorderRecommendations();
      if (res?.success && Array.isArray(res.data)) setReorders(res.data);
    } catch (err) {
      console.error('Failed to load reorders:', err);
    } finally {
      setLoadingReorders(false);
    }
  };

  const loadRequisitions = async () => {
    try {
      setLoadingReqs(true);
      const res = await api.getRequisitions();
      if (res?.success && Array.isArray(res.data)) setRequisitions(res.data);
    } catch (err) {
      console.error('Failed to load requisitions:', err);
    } finally {
      setLoadingReqs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reorder') loadReorders();
    if (activeTab === 'requisitions') loadRequisitions();
  }, [activeTab]);

  const handleConvertToPo = async (prId: number) => {
    try {
      setConvertingId(prId);
      const res = await api.convertRequisitionToPo(prId);
      if (res?.success) {
        alert(`Requisition converted to Purchase Order #${res.data?.po_number}`);
        loadRequisitions();
      }
    } catch (err) {
      console.error('Failed to convert PR to PO:', err);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#172B24' }}>Procurement Planning & Supplier Intelligence</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Module 4 &bull; Multi-Vendor Sourcing
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Compare competitive supplier quotations for identical SKUs, view historical QC track records, and trigger automated reorders.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F3', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
          <button
            onClick={() => setActiveTab('quotes')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'quotes' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'quotes' ? '#047857' : '#64748B',
              boxShadow: activeTab === 'quotes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Multi-Supplier Quotations
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'reorder' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'reorder' ? '#047857' : '#64748B',
              boxShadow: activeTab === 'reorder' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Stock Cover Reorder Alerts
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'requisitions' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'requisitions' ? '#047857' : '#64748B',
              boxShadow: activeTab === 'requisitions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Purchase Requisitions
          </button>
        </div>
      </div>

      {activeTab === 'quotes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SKU Selector Card */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#172B24' }}>Select Wholesale SKU:</span>
              <select
                className="select"
                style={{ width: '360px' }}
                value={selectedProductId}
                onChange={e => setSelectedProductId(parseInt(e.target.value, 10))}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku}) &bull; Current Cost: ₹{p.cost_price}</option>
                ))}
              </select>
            </div>

            {quoteComparison?.recommendationReason && (
              <div style={{ backgroundColor: '#ECFDF5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #10B981', fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>
                💡 Recommendation: {quoteComparison.recommendationReason}
              </div>
            )}
          </div>

          {/* Quotations Matrix */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                Competitive Quotations Matrix for {quoteComparison?.product?.name || 'Selected SKU'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Comparing price, lead time, minimum volume, and historical receiving quality scores.
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Supplier / FPO Producer</th>
                  <th style={{ padding: '12px 16px' }}>Quoted Unit Rate</th>
                  <th style={{ padding: '12px 16px' }}>Min Order Qty</th>
                  <th style={{ padding: '12px 16px' }}>Lead Time</th>
                  <th style={{ padding: '12px 16px' }}>Available Supply</th>
                  <th style={{ padding: '12px 16px' }}>Historical QC Score</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Procurement Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingQuotes ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Comparing vendor quotations...</td>
                  </tr>
                ) : !quoteComparison || quoteComparison.quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No active quotations logged for this SKU.</td>
                  </tr>
                ) : (
                  quoteComparison.quotations.map((q: any) => {
                    const isRecommended = q.id === quoteComparison.recommendedQuoteId;
                    return (
                      <tr key={q.id} style={{ borderBottom: '1px solid #F1F5F3', backgroundColor: isRecommended ? '#F0FDF4' : '#FFFFFF' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#172B24' }}>{q.vendor_name}</strong>
                            {isRecommended && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#047857', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                OPTIMAL CHOICE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{q.vendor_city} &bull; {q.vendor_code}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '1rem', fontWeight: 900, color: '#047857' }}>
                          ₹{parseFloat(q.quoted_price).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>{q.min_order_qty} units</td>
                        <td style={{ padding: '12px 16px' }}>{q.lead_time_days} days</td>
                        <td style={{ padding: '12px 16px' }}>{q.available_supply} units</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Award size={14} color="#047857" />
                            <strong>{q.historical_qc_score}%</strong>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{q.quality_guarantee}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => alert(`Issued Purchase Requisition to ${q.vendor_name} for ${q.min_order_qty} units @ ₹${q.quoted_price}`)}
                            className={isRecommended ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          >
                            Generate PO &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reorder' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Inventory Depletion & Reorder Recommendations</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Calculated from actual 14-day daily consumption and safety stock covers.</p>
            </div>
            <button onClick={loadReorders} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh Burn Rates
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Current Stock</th>
                <th style={{ padding: '12px 16px' }}>Daily Burn Rate</th>
                <th style={{ padding: '12px 16px' }}>Days of Cover</th>
                <th style={{ padding: '12px 16px' }}>Depletion Risk</th>
                <th style={{ padding: '12px 16px' }}>Recommended Reorder</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Primary Supplier</th>
              </tr>
            </thead>
            <tbody>
              {loadingReorders ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Calculating stock forecasting...</td>
                </tr>
              ) : (
                reorders.map((r: any) => (
                  <tr key={r.product_id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{r.product_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{r.sku} &bull; {r.unit}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>{r.current_stock} units</td>
                    <td style={{ padding: '12px 16px' }}>{r.daily_burn_rate} units/day</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: parseFloat(r.days_of_cover) <= 7 ? '#DC2626' : '#047857' }}>
                      {r.days_of_cover} days
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: r.stock_risk === 'CRITICAL' ? '#FEF2F2' : r.stock_risk === 'HIGH' ? '#FFFBEB' : '#ECFDF5',
                          color: r.stock_risk === 'CRITICAL' ? '#DC2626' : r.stock_risk === 'HIGH' ? '#B45309' : '#047857',
                          border: '1px solid currentColor',
                        }}
                      >
                        {r.stock_risk}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857' }}>
                      +{r.recommended_reorder_qty} units
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{r.primary_supplier || 'GreenHarvest Agro'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Quoted: ₹{r.best_supplier_quote || r.cost_price}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'requisitions' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Internal Purchase Requisitions (PR &rarr; PO Workflow)</h2>
            <button onClick={loadRequisitions} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh Requisitions
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Requisition #</th>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Requested Qty</th>
                <th style={{ padding: '12px 16px' }}>Warehouse Hub</th>
                <th style={{ padding: '12px 16px' }}>Urgency</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingReqs ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading requisitions...</td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No purchase requisitions created yet.</td>
                </tr>
              ) : (
                requisitions.map((pr: any) => (
                  <tr key={pr.id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857' }}>{pr.pr_number}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{pr.product_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{pr.sku}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>{pr.requested_quantity} units</td>
                    <td style={{ padding: '12px 16px' }}>{pr.warehouse_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: pr.urgency === 'HIGH' ? '#FEF2F2' : '#EFF6FF',
                          color: pr.urgency === 'HIGH' ? '#DC2626' : '#1D4ED8',
                          border: '1px solid currentColor',
                        }}
                      >
                        {pr.urgency}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{pr.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {pr.status === 'PENDING' ? (
                        <button
                          onClick={() => handleConvertToPo(pr.id)}
                          disabled={convertingId === pr.id}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          {convertingId === pr.id ? 'Converting...' : 'Convert to PO &rarr;'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>PO Issued</span>
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

