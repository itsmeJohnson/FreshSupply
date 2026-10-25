import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, UserCheck, UserX, X, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const StaffPage: React.FC = () => {
  const { user: currentStaff } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await api.getStaffList();
      if (res.success) setStaffList(res.data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createStaff({ name, email, password, role });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('staff');
      loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to create staff user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleToggle = async (id: number, currentRole: 'admin' | 'staff') => {
    const newRole = currentRole === 'admin' ? 'staff' : 'admin';
    try {
      await api.updateStaffRole(id, newRole);
      loadStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleActiveToggle = async (id: number) => {
    try {
      await api.toggleStaffActive(id);
      loadStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Staff & Role-Based Access Control
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Separate administrative authority from routine dispatch and catalog operations
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
          <UserPlus size={16} /> New Staff Member
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Access Status</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px' }}>
                  Loading staff accounts...
                </td>
              </tr>
            ) : (
              staffList.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{s.name}</div>
                    {s.id === currentStaff?.staffId && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                        (You)
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{s.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: s.role === 'admin' ? 'var(--color-primary-light)' : '#E2E8F0',
                        color: s.role === 'admin' ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
                      }}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: s.is_active ? 'var(--color-soft-mint)' : '#FEE2E2',
                        color: s.is_active ? 'var(--color-primary-dark)' : 'var(--color-error)',
                      }}
                    >
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(s.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {s.id !== currentStaff?.staffId && (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleRoleToggle(s.id, s.role)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Make {s.role === 'admin' ? 'Staff' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleActiveToggle(s.id)}
                          className={`btn btn-sm ${s.is_active ? 'btn-danger' : 'btn-soft'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ padding: '24px', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create Staff Account</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FEE2E2',
                  color: 'var(--color-error)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '14px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="label">Work Email *</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@freshsupply.com"
                />
              </div>

              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="label">Security Role *</label>
                <select
                  className="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
                >
                  <option value="staff">Operations Staff (Order & Inventory Management)</option>
                  <option value="admin">Administrator (Full Access & Staff Management)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
