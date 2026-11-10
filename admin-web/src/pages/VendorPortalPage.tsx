import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Truck,
  Thermometer,
  ShieldCheck,
  Plus,
  Search,
  FileText,
  AlertCircle,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { VendorRegistrationPage } from './VendorRegistrationPage';

export const VendorPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'pos' | 'grn' | 'register'>('directory');
  const [search, setSearch] = useState('');

  // Sample Suppliers
  const vendors = [
    {
      id: 1,
      code: 'VEND-001',
      name: 'GreenHarvest Agro Pvt Ltd',
      type: 'Direct Producer / Farmer FPO',
      contact: 'Sunil Deshmukh',
      city: 'Nashik, Maharashtra',
      phone: '+91 98765 43210',
      temperature: '0°C - 8°C (Cold Storage)',
      status: 'VERIFIED',
      rating: '4.9 ★',
      suppliedProducts: 'Red Onions, Tomatoes, Potatoes',
    },
    {
      id: 2,
      code: 'VEND-002',
      name: 'Godavari Grain Millers',
      type: 'Rice & Flour Millers',
      contact: 'Manpreet Singh',
      city: 'Amritsar, Punjab',
      phone: '+91 98765 88990',
      temperature: 'Ambient Dry Storage',
      status: 'VERIFIED',
      rating: '4.8 ★',
      suppliedProducts: 'Classic Basmati Rice, Sona Masoori, Wheat',
    },
    {
      id: 3,
      code: 'VEND-003',
      name: 'Nandi Dairy Cooperatives',
      type: 'Dairy Processing Cooperative',
      contact: 'K. Murthy',
      city: 'Bangalore Rural',
      phone: '+91 98450 77112',
      temperature: '2°C - 4°C (Chilled Dairy)',
      status: 'VERIFIED',
      rating: '4.95 ★',
      suppliedProducts: 'Fresh Cow Milk, Malai Paneer, Butter Blocks',
    },
    {
      id: 4,
      code: 'VEND-004',
      name: 'Malnad Spice Plantations',
      type: 'Spice Growers Association',
      contact: 'Cherian Mathew',
      city: 'Coorg, Karnataka',
      phone: '+91 98451 22334',
      temperature: 'Ambient (Low Humidity)',
      status: 'VERIFIED',
      rating: '4.85 ★',
      suppliedProducts: 'Cardamom, Black Pepper, Cumin, Turmeric',
    },
  ];

  // Sample Purchase Orders
  const purchaseOrders = [
    {
      id: 'PO-78421',
      vendor: 'GreenHarvest Agro Pvt Ltd',
      warehouse: 'Bangalore Central Hub',
      total: 425000,
      status: 'RECEIVED',
      date: 'Oct 02, 2026',
      items: 'Tomato Grade-A (5,000 kg), Red Onions (8,000 kg)',
    },
    {
      id: 'PO-78422',
      vendor: 'Godavari Grain Millers',
      warehouse: 'Yeshwanthpur Bulk Grain Silo',
      total: 960000,
      status: 'CONFIRMED',
      date: 'Oct 03, 2026',
      items: 'Basmati Rice Aged (500 Quintals)',
    },
    {
      id: 'PO-78423',
      vendor: 'Nandi Dairy Cooperatives',
      warehouse: 'Bangalore Central Hub',
      total: 185000,
      status: 'RECEIVED',
      date: 'Today, 05:00 AM',
      items: 'Malai Paneer (500 kg), Fresh Milk (2,000 L)',
    },
  ];

  // Goods Received Notes (GRN)
  const grns = [
    {
      id: 'GRN-4421',
      poId: 'PO-78421',
      vendor: 'GreenHarvest Agro Pvt Ltd',
      receivedAt: 'Oct 03, 2026, 04:36 PM',
      temperature: '12°C – 14°C',
      qcGrade: 'Grade-A',
      qcScore: '95%',
      inspector: 'K. Ramesh (Senior Quality Lead)',
    },
    {
      id: 'GRN-4422',
      poId: 'PO-78423',
      vendor: 'Nandi Dairy Cooperatives',
      receivedAt: 'Today, 05:45 AM',
      temperature: '3.2°C',
      qcGrade: 'Grade-A+',
      qcScore: '98%',
      inspector: 'S. Patil (Dairy QC Specialist)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Vendor & Procurement Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Supplier onboarding, procurement purchase orders, goods receipt notes (GRN), and quality audits
          </p>
        </div>

        <button
          onClick={() => setActiveTab('register')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Register New Vendor</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        {[
          { id: 'directory', label: 'Supplier Directory (4)' },
          { id: 'pos', label: 'Purchase Orders (PO)' },
          { id: 'grn', label: 'Goods Received Notes (GRN)' },
          { id: 'register', label: 'Vendor Onboarding Wizard' },
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

      {/* TAB CONTENT */}
      {activeTab === 'register' ? (
        <VendorRegistrationPage />
      ) : activeTab === 'pos' ? (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>Procurement Purchase Orders</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier Entity</th>
                  <th>Receiving Hub</th>
                  <th>Items Procured</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{po.id}</td>
                    <td style={{ fontWeight: 700 }}>{po.vendor}</td>
                    <td>{po.warehouse}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{po.items}</td>
                    <td style={{ fontWeight: 800 }}>₹{po.total.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ backgroundColor: po.status === 'RECEIVED' ? '#ECFDF5' : '#FEF3C7', color: po.status === 'RECEIVED' ? '#047857' : '#D97706', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{po.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'grn' ? (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>Goods Received Notes & Quality Inspection</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>GRN Reference</th>
                  <th>PO Reference</th>
                  <th>Supplier</th>
                  <th>Transit Temperature</th>
                  <th>QC Grade & Score</th>
                  <th>Quality Inspector</th>
                  <th>Dock Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {grns.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{g.id}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{g.poId}</td>
                    <td style={{ fontWeight: 700 }}>{g.vendor}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#F0F9FF', color: '#0284C7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Thermometer size={12} /> {g.temperature}
                      </span>
                    </td>
                    <td>
                      <span style={{ backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {g.qcGrade} ({g.qcScore})
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{g.inspector}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{g.receivedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VENDOR DIRECTORY */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search suppliers by name, code, city, or product lines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {vendors.map(v => (
              <div key={v.id} className="card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{v.code}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '2px' }}>{v.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{v.type}</p>
                  </div>
                  <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                    {v.status}
                  </span>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>📍 Location: <strong>{v.city}</strong></div>
                  <div>📞 Contact: <strong>{v.contact}</strong> ({v.phone})</div>
                  <div>❄️ Storage Temp: <strong>{v.temperature}</strong></div>
                  <div>📦 Supplies: <strong>{v.suppliedProducts}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D97706' }}>{v.rating} Performance</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('pos')}>
                    View Purchase Orders
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

