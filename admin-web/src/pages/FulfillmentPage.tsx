import React, { useState } from 'react';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  User,
  Phone,
  Thermometer,
  Layers,
} from 'lucide-react';

interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  partnerName: string;
  partnerSegment: string;
  weightMT: number;
  totalValue: number;
  itemsCount: number;
  stage: 'pick' | 'pack' | 'dispatch' | 'delivered';
  hub: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  eta: string;
  tempRequirement: string;
  dispatchTime: string;
}

const fulfillmentSeed: FulfillmentOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-84258',
    partnerName: 'GreenMart Supermarkets (8 Branches)',
    partnerSegment: 'Supermarket Chain',
    weightMT: 12.5,
    totalValue: 472500,
    itemsCount: 42,
    stage: 'pack',
    hub: 'Central Cold Chain Hub (BLR)',
    vehicleNo: 'KA-01-MJ-8821 (Reefer)',
    driverName: 'Ramesh Gowda',
    driverPhone: '+91 98451 22910',
    eta: 'Today, 4:30 PM',
    tempRequirement: '4°C – 8°C (Monitored)',
    dispatchTime: 'Estimated 02:45 PM',
  },
  {
    id: '2',
    orderNumber: 'ORD-84255',
    partnerName: 'SuperFood Retail Hubs',
    partnerSegment: 'Wholesale Buyer',
    weightMT: 21.0,
    totalValue: 798400,
    itemsCount: 65,
    stage: 'dispatch',
    hub: 'Peenya Fulfillment Center',
    vehicleNo: 'KA-04-EL-4912 (16-Wheeler)',
    driverName: 'Suresh Kumar',
    driverPhone: '+91 97410 88201',
    eta: 'Today, 6:15 PM',
    tempRequirement: 'Ambient Dry (Ventilated)',
    dispatchTime: 'Dispatched at 01:10 PM',
  },
  {
    id: '3',
    orderNumber: 'ORD-84252',
    partnerName: 'EasyVegi Mart Network',
    partnerSegment: 'Retail Chain',
    weightMT: 6.0,
    totalValue: 219600,
    itemsCount: 18,
    stage: 'delivered',
    hub: 'Whitefield Logistics Depot',
    vehicleNo: 'KA-51-AB-3091 (EV Cargo)',
    driverName: 'Manjunath B.',
    driverPhone: '+91 94480 31109',
    eta: 'Delivered (01:25 PM)',
    tempRequirement: 'Direct Ambient',
    dispatchTime: 'Dispatched at 11:40 AM',
  },
  {
    id: '4',
    orderNumber: 'ORD-84250',
    partnerName: 'QuickNest Express Marts',
    partnerSegment: 'Quick Commerce Dark Store',
    weightMT: 15.0,
    totalValue: 536000,
    itemsCount: 38,
    stage: 'pick',
    hub: 'Ambient Dry Goods Silo 4',
    vehicleNo: 'KA-03-NC-7714 (Heavy Goods)',
    driverName: 'Anil Patil',
    driverPhone: '+91 96320 44012',
    eta: 'Today, 8:45 PM',
    tempRequirement: 'Standard Ambient',
    dispatchTime: 'Scheduled 04:00 PM',
  },
];

export const FulfillmentPage: React.FC = () => {
  const [orders, setOrders] = useState<FulfillmentOrder[]>(fulfillmentSeed);
  const [stageFilter, setStageFilter] = useState<'all' | 'pick' | 'pack' | 'dispatch' | 'delivered'>('all');
  const [search, setSearch] = useState('');
  const [confirmToast, setConfirmToast] = useState<string | null>(null);

  const handleAdvanceStage = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          let nextStage: FulfillmentOrder['stage'] = 'delivered';
          if (o.stage === 'pick') nextStage = 'pack';
          else if (o.stage === 'pack') nextStage = 'dispatch';
          else if (o.stage === 'dispatch') nextStage = 'delivered';

          setConfirmToast(`Order #${o.orderNumber} successfully moved to ${nextStage.toUpperCase()}!`);
          setTimeout(() => setConfirmToast(null), 3000);

          return { ...o, stage: nextStage };
        }
        return o;
      })
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStage = stageFilter === 'all' || o.stage === stageFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      o.vehicleNo.toLowerCase().includes(search.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      
      {/* Toast */}
      {confirmToast && (
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
          <span>{confirmToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B24', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={24} color="#047857" />
            Wholesale Order Fulfillment & Fleet Dispatch
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Active pick-list verification, cold-chain reefer loading, and real-time route dispatch tracker
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} className="live-pulse" />
            <span>4 Vehicles Active in Transit</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Total Active Dispatch Weight</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#172B24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            54.5 <span style={{ fontSize: '0.85rem', color: '#64748B' }}>MT</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            ● Across 4 primary routes
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #047857' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Packing & Staging</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            2 Orders
          </div>
          <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, marginTop: '4px' }}>
            Dock Bay 04 & Bay 07
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #2563EB' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Out on Road (In Transit)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            1 Truck (21 MT)
          </div>
          <div style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
            ETA: 6:15 PM (On Track)
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Delivered Today</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            1 Order (6 MT)
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
            Digital Proof of Delivery Verified
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by order #, retail buyer, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        {/* Stage Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Orders (4)' },
            { id: 'pick', label: 'Picking (1)' },
            { id: 'pack', label: 'Packing (1)' },
            { id: 'dispatch', label: 'In Transit (1)' },
            { id: 'delivered', label: 'Delivered (1)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStageFilter(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: stageFilter === tab.id ? '1px solid #047857' : '1px solid #E2E8E5',
                backgroundColor: stageFilter === tab.id ? '#047857' : '#FFFFFF',
                color: stageFilter === tab.id ? '#FFFFFF' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List with 4-Stage Steppers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredOrders.map((ord) => {
          const stages = ['pick', 'pack', 'dispatch', 'delivered'];
          const currentStageIndex = stages.indexOf(ord.stage);

          return (
            <div
              key={ord.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#172B24', fontFamily: 'var(--font-mono)' }}>
                      #{ord.orderNumber}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#047857',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      {ord.partnerSegment}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      From: <strong style={{ color: '#172B24' }}>{ord.hub}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#172B24', marginTop: '4px' }}>
                    {ord.partnerName}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                    ₹{ord.totalValue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    {ord.weightMT} MT ({ord.itemsCount} Wholesale SKUs)
                  </div>
                </div>
              </div>

              {/* 4-Stage Stepper Tracker */}
              <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8E5' }}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', right: '16px', height: '2px', backgroundColor: '#E2E8E5', zIndex: 1 }} />
                  
                  {stages.map((stg, sIdx) => {
                    const isPassed = sIdx <= currentStageIndex;
                    const isCurrent = sIdx === currentStageIndex;
                    return (
                      <div key={stg} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div
                          style={{
                            width: isCurrent ? '18px' : '14px',
                            height: isCurrent ? '18px' : '14px',
                            borderRadius: '50%',
                            backgroundColor: isPassed ? (ord.stage === 'delivered' ? '#16A34A' : '#047857') : '#CBD5E1',
                            boxShadow: isCurrent ? '0 0 0 4px #A7F3D0' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: isCurrent ? 800 : isPassed ? 700 : 500,
                            color: isCurrent ? '#047857' : isPassed ? '#172B24' : '#94A3B8',
                            textTransform: 'capitalize',
                            marginTop: '2px',
                          }}
                        >
                          {stg === 'pick' ? '1. Pick' : stg === 'pack' ? '2. Pack' : stg === 'dispatch' ? '3. Dispatch' : '4. Delivered'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fleet & Logistics Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.78rem', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={15} color="#047857" />
                  <span>Assigned Vehicle: <strong style={{ color: '#172B24' }}>{ord.vehicleNo}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={15} color="#047857" />
                  <span>Driver: <strong style={{ color: '#172B24' }}>{ord.driverName}</strong> ({ord.driverPhone})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Thermometer size={15} color="#047857" />
                  <span>Cold Chain: <strong style={{ color: '#047857' }}>{ord.tempRequirement}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="#047857" />
                  <span>ETA: <strong style={{ color: '#172B24' }}>{ord.eta}</strong></span>
                </div>
              </div>

              {/* Action Button Strip */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8E5' }}>
                {ord.stage !== 'delivered' && (
                  <button
                    onClick={() => handleAdvanceStage(ord.id)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                  >
                    <span>Advance to Next Stage</span>
                    <ArrowRight size={14} />
                  </button>
                )}
                {ord.stage === 'delivered' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '0.8rem', fontWeight: 700 }}>
                    <ShieldCheck size={18} />
                    <span>Fulfilled & Signed off by Retail Store Manager</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

