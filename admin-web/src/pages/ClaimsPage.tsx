import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Truck,
  XCircle,
  Thermometer,
  Calendar,
  Layers,
} from 'lucide-react';

export const ClaimsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'approved' | 'rejected' | 'picked_up'>('pending');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const claimPhotos = [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=800&auto=format&fit=crop&q=80',
  ];

  const handleAction = (type: string, message: string) => {
    setActionNotice(message);
    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Claims & Returns Review
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Review quality claims, item returns, and take resolution actions.
          </p>
        </div>

        {/* Top 4 KPI Cards (exact from Image 1) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {/* Card 1 */}
          <div className="card" style={{ padding: '12px 16px', minWidth: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-main)' }}>42</span>
              <AlertTriangle size={16} color="var(--color-warning)" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px' }}>Open Claims</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '2px' }}>↑ +12%</div>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ padding: '12px 16px', minWidth: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-main)' }}>186</span>
              <CheckCircle2 size={16} color="var(--color-primary)" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px' }}>Resolved (30d)</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '2px' }}>↑ +96%</div>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ padding: '12px 16px', minWidth: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-main)' }}>2.8 days</span>
              <Clock size={16} color="var(--color-primary)" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px' }}>Avg. Resolution Time</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '2px' }}>↓ -34%</div>
          </div>

          {/* Card 4 */}
          <div className="card" style={{ padding: '12px 16px', minWidth: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-main)' }}>₹6.42L</span>
              <AlertTriangle size={16} color="var(--color-danger)" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px' }}>Claim Value (Open)</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 700, marginTop: '2px' }}>Attention Req.</div>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #10B981', borderRadius: '10px', padding: '12px 20px', color: '#047857', display: 'flex', alignItems: 'center', gap: '10px' }} className="fade-in">
          <CheckCircle2 size={18} color="#047857" />
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{actionNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'pending', label: 'Pending Review (42)' },
          { id: 'in_progress', label: 'In Progress (18)' },
          { id: 'approved', label: 'Approved (186)' },
          { id: 'rejected', label: 'Rejected (64)' },
          { id: 'picked_up', label: 'Returns Picked Up (29)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === tab.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : '#FFFFFF',
              color: activeTab === tab.id ? '#FFFFFF' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Claim Detail Container */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Claim Summary Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-main)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Claim #CLM-98527</span>
                <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px' }}>
                  Pending Review
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Retail Partner: <strong style={{ color: 'var(--color-text-main)' }}>GreenMart Retail</strong> &nbsp;|&nbsp; Order: <span style={{ fontFamily: 'var(--font-mono)' }}>ORD-742893</span> &nbsp;|&nbsp; Raised: Oct 04, 2026, 10:24 AM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 14px', fontSize: '0.875rem' }}>
              Claim Value: <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>₹28,560</strong>
            </div>
            <button style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              •••
            </button>
          </div>
        </div>

        {/* 2-Column Split: Customer Claim vs Dispatch Record */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          
          {/* LEFT: Customer Claim - Received Condition */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 700 }}>
              <Layers size={18} />
              <span>Customer Claim – Received Condition</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '-8px' }}>
              Photo uploaded by customer at delivery (Oct 04, 10:18 AM)
            </div>

            {/* Photo & AI Analysis Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {/* Photo Box with Carousel */}
              <div>
                <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#0F172A' }}>
                  <img
                    src={claimPhotos[photoIndex]}
                    alt="Damaged tomatoes"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {photoIndex + 1} / {claimPhotos.length}
                  </div>
                  <button
                    onClick={() => setPhotoIndex((photoIndex - 1 + claimPhotos.length) % claimPhotos.length)}
                    style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPhotoIndex((photoIndex + 1) % claimPhotos.length)}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Thumbnails */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {claimPhotos.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt="Thumbnail"
                      onClick={() => setPhotoIndex(idx)}
                      style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: photoIndex === idx ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}
                    />
                  ))}
                </div>
              </div>

              {/* AI Quality Analysis Box */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Sparkles size={14} />
                  <span>AI Quality Analysis</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Automated defect grading</div>

                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '6px 10px', textAlign: 'center', color: '#DC2626', fontWeight: 800, fontSize: '0.8rem' }}>
                  Defect Grade: Major (D3)
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Estimated Defect Rate: <strong style={{ color: 'var(--color-text-main)' }}>28.4% (≈ 142.0 kg)</strong>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Issue Detected</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.65rem', padding: '2px 6px', color: '#334155', fontWeight: 600 }}>Fungal Growth</span>
                    <span style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.65rem', padding: '2px 6px', color: '#334155', fontWeight: 600 }}>Bruising</span>
                    <span style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.65rem', padding: '2px 6px', color: '#334155', fontWeight: 600 }}>Over Ripening</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: 'auto' }}>
                  AI Confidence: 96%
                </div>
              </div>
            </div>

            {/* Claim Details Meta */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Claim Type:</span>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>Quality Issue</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Requested Resolution:</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Refund or Replacement</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Quantity Affected:</span>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>≈ 142.0 kg (28.4%)</span>
              </div>
              <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Remarks (Customer): &ldquo;Received a large quantity of spoiled tomatoes. Around 30% are not usable. Requesting refund or replacement at the earliest.&rdquo;
              </div>
            </div>

          </div>

          {/* RIGHT: Dispatch & Quality Control Record */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 700 }}>
              <Truck size={18} />
              <span>Dispatch & Quality Control Record</span>
            </div>

            {/* Product Info Strip */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80"
                  alt="Tomato"
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Product</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Tomato (Grade-A)</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Dispatched Qty</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-main)' }}>500 kg <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>(@ ₹57.12/kg)</span></div>
              </div>
            </div>

            {/* Timeline Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginTop: '2px', fontSize: '0.7rem' }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>QC Passed at Warehouse</span>
                    <span style={{ backgroundColor: '#ECFDF5', color: '#047857', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Grade-A (QC Score: 95%)</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Oct 03, 2026, 04:36 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginTop: '2px', fontSize: '0.7rem' }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Dispatched from Hub (BLR)</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Oct 03, 2026, 05:20 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginTop: '2px', fontSize: '0.7rem' }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Delivered to Customer</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Oct 04, 2026, 09:48 AM</div>
                </div>
              </div>
            </div>

            {/* Metadata 4-Box Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: 'auto' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Dispatch Batch</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>BCH-78421</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>QC Reference</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>QC-55673</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Thermometer size={14} color="#0284C7" />
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Temperature (Transit)</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>12°C – 14°C</div>
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Shelf Life (At Dispatch)</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>5 – 6 days</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM: Resolution Actions (exact from Image 1) */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px' }}>
            Resolution Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Button 1: Approve Refund */}
            <button
              onClick={() => handleAction('refund', 'Claim approved: Processed ₹28,560 refund to GreenMart Retail ledger.')}
              className="btn btn-primary"
              style={{
                borderRadius: '12px',
                padding: '14px 18px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={20} />
              <div style={{ textAlign: 'left' }}>
                <div>Approve Refund</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.85 }}>Process ₹28,560 refund</div>
              </div>
            </button>

            {/* Button 2: Schedule Replacement Truck */}
            <button
              onClick={() => handleAction('replacement', 'Replacement dispatched: Scheduled morning truck for 142 kg Tomato Grade-A.')}
              style={{
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #10B981',
                borderRadius: '12px',
                padding: '14px 18px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <Truck size={20} />
              <div style={{ textAlign: 'left' }}>
                <div>Schedule Replacement Truck</div>
                <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>Pickup damaged stock & deliver fresh batch</div>
              </div>
            </button>

            {/* Button 3: Reject Dispute */}
            <button
              onClick={() => handleAction('reject', 'Dispute closed: Reject notice dispatched with temperature logs.')}
              style={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                padding: '14px 18px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <XCircle size={20} />
              <div style={{ textAlign: 'left' }}>
                <div>Reject Dispute</div>
                <div style={{ fontSize: '0.7rem', color: '#B91C1C', fontWeight: 600 }}>Close claim with remarks</div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
