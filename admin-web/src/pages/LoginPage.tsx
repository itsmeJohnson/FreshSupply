import React, { useState } from 'react';
import { Store, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@freshsupply.com');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
      } else {
        setError(res.error || 'Failed to authenticate');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'ops') => {
    if (role === 'admin') {
      setEmail('admin@freshsupply.com');
      setPassword('Admin@12345');
    } else {
      setEmail('ops@freshsupply.com');
      setPassword('Ops@12345');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-main)',
        padding: '20px',
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: '0 6px 16px rgba(22, 132, 91, 0.28)',
            }}
          >
            <Store size={30} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            FreshSupply Admin
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            B2B Wholesale Ordering & Fulfillment Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: 'var(--color-error)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Staff Email Address</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@freshsupply.com"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '28px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            Demo Quick Credentials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="btn btn-secondary btn-sm"
            >
              <ShieldCheck size={14} color="var(--color-primary)" />
              Admin Role
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ops')}
              className="btn btn-secondary btn-sm"
            >
              Operations Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
