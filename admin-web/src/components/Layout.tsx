import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 'Live' },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'customers', label: 'Customers', icon: Users },
    ...(isAdmin ? [{ id: 'staff', label: 'Staff & Roles', icon: ShieldCheck }] : []),
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="sidebar-desktop"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #edf1ee',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(22, 132, 91, 0.25)',
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              FreshSupply
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              B2B Admin Console
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 8px 8px' }}>
            Main Menu
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-soft-mint)' : 'transparent',
                  color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#FAFCFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Staff User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: user?.role === 'admin' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  backgroundColor: user?.role === 'admin' ? 'var(--color-primary-light)' : '#E2E8F0',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                {user?.role}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Header */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-main)',
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize', color: 'var(--color-text-main)' }}>
              {currentPage}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-soft-mint)',
                border: '1px solid var(--color-primary-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-primary-dark)',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></span>
              PostgreSQL Live Sync
            </div>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--color-border)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--color-soft-mint)' : 'transparent',
                    color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    fontSize: '0.9rem',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Page Content Body */}
        <main style={{ padding: '24px 28px', flex: 1, minWidth: 0 }} className="fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
