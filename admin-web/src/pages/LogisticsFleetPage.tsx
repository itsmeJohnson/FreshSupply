import React, { useEffect, useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Package,
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { api } from '../api/client';

export const LogisticsFleetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'trips'>('dispatch');

  // Dispatch Board
  const [dispatchOrders, setDispatchOrders] = useState<any[]>([]);
  const [loadingDispatch, setLoadingDispatch] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Trips State
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // New Trip Modal
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    vehicleNumber: 'KA-04-E-9944',
    vehicleType: 'Refrigerated 3.5T Reefer (Cold Chain)',
    driverName: 'Ramesh Gowda',
    driverPhone: '+91 98455 33445',
    routeZone: 'Whitefield - Mahadevapura - Marathahalli',
    plannedDate: new Date().toISOString().split('T')[0],
    departureTime: '05:30 AM',
    transportCost: 1950,
  });

  const loadDispatchBoard = async () => {
    try {
      setLoadingDispatch(true);
      const res = await api.getDispatchBoard();
      if (res?.success && Array.isArray(res.data)) {
        setDispatchOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load dispatch board:', err);
    } finally {
      setLoadingDispatch(false);
    }
  };

  const loadTrips = async () => {
    try {
      setLoadingTrips(true);
      const res = await api.getTrips();
      if (res?.success && Array.isArray(res.data)) {
        setTrips(res.data);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dispatch') loadDispatchBoard();
    if (activeTab === 'trips') loadTrips();
  }, [activeTab]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createTrip(newTrip);
      if (res?.success) {
        setShowNewTripModal(false);
        if (selectedOrders.length > 0 && res.data?.id) {
          await api.assignOrdersToTrip(res.data.id, selectedOrders);
          setSelectedOrders([]);
        }
        setActiveTab('trips');
        loadTrips();
      }
    } catch (err) {
      console.error('Failed to create trip:', err);
    }
  };

  const handleUpdateTripStatus = async (tripId: number, status: string) => {
    try {
      const res = await api.updateTripStatus(tripId, status);
      if (res?.success) {
        loadTrips();
      }
    } catch (err) {
      console.error('Failed to update trip status:', err);
    }
  };

  const toggleOrderSelection = (id: number) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#172B24' }}>Logistics, Fleet Routing & Dispatch Board</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Module 6 &bull; Cold Chain Fulfillment
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Real-time staging, vehicle temperature zones, driver assignments, route staging, and delivery confirmations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#F1F5F3', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8E5' }}>
            <button
              onClick={() => setActiveTab('dispatch')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === 'dispatch' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'dispatch' ? '#047857' : '#64748B',
                boxShadow: activeTab === 'dispatch' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Dispatch Board ({dispatchOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === 'trips' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'trips' ? '#047857' : '#64748B',
                boxShadow: activeTab === 'trips' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Reefer Delivery Trips
            </button>
          </div>

          <button
            onClick={() => setShowNewTripModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Plan New Delivery Trip
          </button>
        </div>
      </div>

      {activeTab === 'dispatch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Bar for selected orders */}
          {selectedOrders.length > 0 && (
            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #10B981', padding: '12px 18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>
                {selectedOrders.length} wholesale orders selected for batch vehicle loading
              </div>
              <button
                onClick={() => setShowNewTripModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Truck size={14} /> Assign to Refrigerated Van &rarr;
              </button>
            </div>
          )}

          {/* Dispatch Board Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Orders Awaiting Cold Chain Transportation</h2>
                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Confirmed orders ready for warehouse staging and dispatch.</p>
              </div>
              <button onClick={loadDispatchBoard} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refresh Board
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px', width: '30px' }}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === dispatchOrders.length && dispatchOrders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOrders(dispatchOrders.map(o => o.order_id));
                        else setSelectedOrders([]);
                      }}
                    />
                  </th>
                  <th style={{ padding: '12px 16px' }}>Order #</th>
                  <th style={{ padding: '12px 16px' }}>Buyer & Receiving Bay</th>
                  <th style={{ padding: '12px 16px' }}>Scheduled Delivery Slot</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Est. Cargo Weight</th>
                  <th style={{ padding: '12px 16px' }}>Trip Assignment</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingDispatch ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading dispatch queue...</td>
                  </tr>
                ) : dispatchOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No orders awaiting transportation.</td>
                  </tr>
                ) : (
                  dispatchOrders.map(ord => (
                    <tr key={ord.order_id} style={{ borderBottom: '1px solid #F1F5F3', backgroundColor: selectedOrders.includes(ord.order_id) ? '#F0FDF4' : '#FFFFFF' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(ord.order_id)}
                          onChange={() => toggleOrderSelection(ord.order_id)}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857' }}>
                        {ord.order_number}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700 }}>{ord.business_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {ord.delivery_address || 'Central Receiving Dock'}, {ord.delivery_city}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{new Date(ord.delivery_date).toLocaleDateString('en-IN')}</div>
                        <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>{ord.delivery_slot}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800 }}>
                        ₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <strong>{Math.round(ord.estimated_weight_kg)} kg</strong> &bull; {ord.item_count} lines
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {ord.assigned_trip_number ? (
                          <div>
                            <span style={{ fontWeight: 700, color: '#047857' }}>{ord.assigned_trip_number}</span>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{ord.assigned_vehicle} ({ord.assigned_driver})</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: ord.status === 'dispatched' ? '#EFF6FF' : '#ECFDF5',
                            color: ord.status === 'dispatched' ? '#1D4ED8' : '#047857',
                            border: '1px solid currentColor',
                          }}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Scheduled Refrigerated Delivery Runs</h2>
            <button onClick={loadTrips} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh Fleet
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8E5', textAlign: 'left', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Trip Run #</th>
                <th style={{ padding: '12px 16px' }}>Reefer Van & Driver</th>
                <th style={{ padding: '12px 16px' }}>Delivery Route Zone</th>
                <th style={{ padding: '12px 16px' }}>Departure Time</th>
                <th style={{ padding: '12px 16px' }}>Loaded Orders</th>
                <th style={{ padding: '12px 16px' }}>Run Cost</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingTrips ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading fleet runs...</td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No delivery trips scheduled today.</td>
                </tr>
              ) : (
                trips.map(tr => (
                  <tr key={tr.id} style={{ borderBottom: '1px solid #F1F5F3' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#047857' }}>{tr.trip_number}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{tr.vehicle_number}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {tr.driver_name} &bull; {tr.driver_phone}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{tr.route_zone}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{tr.warehouse_name}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong>{tr.departure_time}</strong>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{new Date(tr.planned_date).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>
                      {tr.orders_assigned_count} Drops ({tr.orders_delivered_count} Completed)
                    </td>
                    <td style={{ padding: '12px 16px' }}>₹{parseFloat(tr.transport_cost).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: tr.status === 'COMPLETED' ? '#ECFDF5' : tr.status === 'DISPATCHED' ? '#EFF6FF' : '#FFFBEB',
                          color: tr.status === 'COMPLETED' ? '#047857' : tr.status === 'DISPATCHED' ? '#1D4ED8' : '#B45309',
                          border: '1px solid currentColor',
                        }}
                      >
                        {tr.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {tr.status === 'PLANNED' && (
                          <button
                            onClick={() => handleUpdateTripStatus(tr.id, 'DISPATCHED')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Dispatch Van &rarr;
                          </button>
                        )}
                        {tr.status === 'DISPATCHED' && (
                          <button
                            onClick={() => handleUpdateTripStatus(tr.id, 'COMPLETED')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Mark Completed
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
      )}

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Schedule Refrigerated Delivery Run</h2>
            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Vehicle Registration</label>
                  <input className="input" required value={newTrip.vehicleNumber} onChange={e => setNewTrip({ ...newTrip, vehicleNumber: e.target.value })} placeholder="KA-04-E-1234" />
                </div>
                <div>
                  <label className="label">Driver Name</label>
                  <input className="input" required value={newTrip.driverName} onChange={e => setNewTrip({ ...newTrip, driverName: e.target.value })} placeholder="Ramesh" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Driver Phone</label>
                  <input className="input" required value={newTrip.driverPhone} onChange={e => setNewTrip({ ...newTrip, driverPhone: e.target.value })} placeholder="+91 9845..." />
                </div>
                <div>
                  <label className="label">Departure Slot</label>
                  <input className="input" value={newTrip.departureTime} onChange={e => setNewTrip({ ...newTrip, departureTime: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Corridor / Delivery Route Zone</label>
                <input className="input" required value={newTrip.routeZone} onChange={e => setNewTrip({ ...newTrip, routeZone: e.target.value })} />
              </div>

              <div>
                <label className="label">Contract Logistics Cost (₹)</label>
                <input className="input" type="number" value={newTrip.transportCost} onChange={e => setNewTrip({ ...newTrip, transportCost: parseFloat(e.target.value) })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowNewTripModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Trip & Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

