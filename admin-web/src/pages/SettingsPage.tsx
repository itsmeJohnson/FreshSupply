import React, { useState } from 'react';
import {
  Settings,
  Building,
  Bell,
  Lock,
  Globe,
  CheckCircle,
  Save,
  ShieldCheck,
  Truck,
  Warehouse,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [savedNotice, setSavedNotice] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'FreshSupply Supply Chain Logistics India Pvt. Ltd.',
    gstin: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    defaultHub: 'Central Cold Chain Hub (BLR)',
    minOrderValue: 10000,
    freeDeliveryThreshold: 50000,
    coldStorageTempMin: 2,
    coldStorageTempMax: 6,
    autoApproveClaimsUnder: 5000,
    smsAlertsEnabled: true,
    emailDispatchNotification: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Toast */}
      {savedNotice && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#047857',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(4, 120, 87, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle size={18} />
          <span>System configuration and supply chain parameters updated!</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={24} color="#047857" />
            Platform Administration & Operational Settings
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Enterprise entity configuration, minimum wholesale thresholds, cold chain standards, and automated rules
          </p>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 18px' }}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Company & Legal Configuration */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building size={18} color="#047857" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#172B24' }}>
              Corporate Entity & Tax Registration
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label className="label">Registered Corporate Name</label>
              <input
                type="text"
                className="input"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="label">GSTIN Identification Number</label>
              <input
                type="text"
                className="input"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label className="label">Income Tax PAN Number</label>
              <input
                type="text"
                className="input"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label className="label">Primary Central Hub</label>
              <input
                type="text"
                className="input"
                value={formData.defaultHub}
                onChange={(e) => setFormData({ ...formData, defaultHub: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Wholesale Order Thresholds */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Truck size={18} color="#047857" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#172B24' }}>
              Wholesale Order Rules & Logistics Thresholds
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label className="label">Minimum Order Value (MOV in ₹)</label>
              <input
                type="number"
                className="input"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>B2B orders below this amount cannot be booked</span>
            </div>

            <div>
              <label className="label">Free Freight Delivery Threshold (₹)</label>
              <input
                type="number"
                className="input"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseInt(e.target.value) || 0 })}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Standard carrier fee waived above this value</span>
            </div>

            <div>
              <label className="label">Cold Chain Reefer Target Range (°C)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="input"
                  value={formData.coldStorageTempMin}
                  onChange={(e) => setFormData({ ...formData, coldStorageTempMin: parseInt(e.target.value) || 0 })}
                  style={{ width: '80px', fontFamily: 'var(--font-mono)' }}
                />
                <span>to</span>
                <input
                  type="number"
                  className="input"
                  value={formData.coldStorageTempMax}
                  onChange={(e) => setFormData({ ...formData, coldStorageTempMax: parseInt(e.target.value) || 0 })}
                  style={{ width: '80px', fontFamily: 'var(--font-mono)' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>°Celsius</span>
              </div>
            </div>

            <div>
              <label className="label">Auto-Approve Quality Claims Below (₹)</label>
              <input
                type="number"
                className="input"
                value={formData.autoApproveClaimsUnder}
                onChange={(e) => setFormData({ ...formData, autoApproveClaimsUnder: parseInt(e.target.value) || 0 })}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Instant credit issued if AI defect confidence &gt; 95%</span>
            </div>
          </div>
        </div>

        {/* Notifications & Alert Preferences */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell size={18} color="#047857" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#172B24' }}>
              Automated Operations Alerts & Notifications
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={formData.smsAlertsEnabled}
                onChange={(e) => setFormData({ ...formData, smsAlertsEnabled: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#047857' }}
              />
              <span>Send SMS and WhatsApp dispatch OTPs to driver and receiving store manager</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={formData.emailDispatchNotification}
                onChange={(e) => setFormData({ ...formData, emailDispatchNotification: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#047857' }}
              />
              <span>Email daily stock depletion risk summary to Central Procurement team every morning at 06:00 AM</span>
            </label>
          </div>
        </div>

      </form>
    </div>
  );
};

