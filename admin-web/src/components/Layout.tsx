import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  DollarSign,
  Truck,
  RotateCcw,
  Package,
  Layers,
  Building2,
  Users,
  ShieldCheck,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  MapPin,
  ChevronDown,
  BarChart3,
  Settings,
  LucideIcon,
  Store,
  UserCheck,
  CreditCard,
  ShoppingBag,
  FileText,
  Sliders,
  TrendingUp,
  ClipboardList,
  Navigation,
  UserPlus,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info';
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Grouped Navigation matching Section 7 of specification & Phase 3 ERP
  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'customer-storefront', label: 'Customer Storefront', icon: ShoppingBag, badge: 'Buyer UI', badgeType: 'success' },
      ],
    },
    {
      groupTitle: 'Commerce',
      items: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '12', badgeType: 'info' },
        { id: 'products', label: 'Products & Catalog', icon: Package },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'inventory', label: 'Inventory', icon: Boxes, badge: '6 Low', badgeType: 'warning' },
        { id: 'pricing', label: 'Wholesale Tiers', icon: DollarSign },
        { id: 'customer-pricing', label: 'Customer Pricing', icon: UserCheck, badge: '42 Custom', badgeType: 'info' },
        { id: 'contracts', label: 'Commercial Contracts', icon: FileText, badge: '5 Active', badgeType: 'info' },
        { id: 'pricing-automation', label: 'Pricing Simulator & PCR', icon: Sliders, badge: 'Live Sim', badgeType: 'success' },
        { id: 'credit-finance', label: 'Credit & Receivables', icon: CreditCard, badge: '₹8.08L', badgeType: 'info' },
      ],
    },
    {
      groupTitle: 'Operations',
      items: [
        { id: 'logistics-fleet', label: 'Dispatch & Reefer Fleet', icon: Navigation, badge: 'Dispatch', badgeType: 'success' },
        { id: 'procurement-planning', label: 'Procurement & Quotes', icon: ClipboardList, badge: 'Reorder AI', badgeType: 'info' },
        { id: 'fulfillment', label: 'Fulfillment Tracking', icon: Truck },
        { id: 'claims', label: 'Claims & Returns', icon: RotateCcw, badge: '42', badgeType: 'warning' },
        { id: 'vendor-portal', label: 'Vendor & Procurement', icon: Building2 },
      ],
    },
    {
      groupTitle: 'Business & CRM',
      items: [
        { id: 'sales-crm', label: 'Sales CRM & Leads', icon: UserPlus, badge: 'Pipeline', badgeType: 'success' },
        { id: 'customers', label: 'Customers CRM', icon: Users, badge: '120 Active', badgeType: 'info' },
        { id: 'collections-aging', label: 'Collections & Aging', icon: Receipt, badge: '5 Buckets', badgeType: 'warning' },
        { id: 'partners', label: 'Vendor Registration', icon: Store },
        ...(isAdmin ? [{ id: 'staff', label: 'Staff & Roles', icon: ShieldCheck }] : []),
      ],
    },
    {
      groupTitle: 'Analytics',
      items: [
        { id: 'executive-bi', label: 'Executive BI & P&L', icon: TrendingUp, badge: 'Live BI', badgeType: 'success' },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'Administration',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileDrawerOpen(false);
  };

  const renderNavLinks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {navGroups.map((group, gIdx) => (
        <div key={gIdx}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#94A3B8',
              padding: '0 12px 6px 12px',
            }}
          >
            {group.groupTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {group.items.map((item) => {
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
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                    color: isActive ? '#047857' : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    minHeight: '38px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} color={isActive ? '#047857' : '#64748B'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: item.badgeType === 'warning' ? '#FEF3C7' : '#EFF6FF',
                        color: item.badgeType === 'warning' ? '#B45309' : '#1D4ED8',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F9F8', color: '#172B24', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR: Clean Premium Light Theme                     */}
      {/* ============================================================== */}
      <aside
        className="sidebar-desktop"
        style={{
          width: '240px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8E5',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 18px',
            borderBottom: '1px solid #E2E8E5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#172B24', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              FreshSupply
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#047857', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
              Supply Chain Console
            </div>
          </div>
        </div>

        {/* Navigation Groups List */}
        <nav style={{ padding: '16px 10px', flex: 1, overflowY: 'auto' }}>
          {renderNavLinks()}
        </nav>

        {/* User Profile Footer */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid #E2E8E5',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              JD
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#172B24', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Johnson Doe'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500, textTransform: 'capitalize' }}>
                {user?.role || 'Admin'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE NAVIGATION DRAWER (Slide-in, triggers on mobile only)   */}
      {/* ============================================================== */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
          }}
        >
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Drawer Content */}
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 160,
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#172B24' }}>
                  FreshSupply
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Nav Body */}
            <div style={{ padding: '16px 14px', flex: 1, overflowY: 'auto' }}>
              {renderNavLinks()}
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '14px 18px', borderTop: '1px solid #E2E8E5', backgroundColor: '#F8FAFC' }}>
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8E5',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN VIEWPORT (Occupies 100% of available screen)              */}
      {/* ============================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', overflowX: 'hidden' }}>
        
        {/* Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            width: '100%',
          }}
        >
          {/* Left: Mobile Hamburger & Page Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="hide-desktop"
              style={{
                background: 'none',
                border: 'none',
                color: '#172B24',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#172B24' }}>
                Supply Chain Console
              </span>
              <span
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </span>
            </div>
          </div>

          {/* Center Search Input (flexible & responsive) */}
          <div className="hide-mobile" style={{ flex: 1, maxWidth: '420px', margin: '0 20px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search orders, SKUs, inventory, partners..."
                style={{
                  width: '100%',
                  padding: '8px 36px 8px 36px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8E5',
                  borderRadius: '8px',
                  color: '#172B24',
                  fontSize: '0.825rem',
                  outline: 'none',
                  minHeight: '36px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #E2E8E5',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* 3-Experience Platform Switcher */}
            <div className="hide-mobile" style={{ display: 'flex', backgroundColor: '#F1F5F3', borderRadius: '10px', padding: '3px', border: '1px solid #E2E8E5' }}>
              <button
                onClick={() => onNavigate('dashboard')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: currentPage !== 'customer-storefront' && currentPage !== 'vendor-portal' ? '#FFFFFF' : 'transparent',
                  color: currentPage !== 'customer-storefront' && currentPage !== 'vendor-portal' ? '#047857' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: currentPage !== 'customer-storefront' && currentPage !== 'vendor-portal' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Admin Console
              </button>

              <button
                onClick={() => onNavigate('customer-storefront')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: currentPage === 'customer-storefront' ? '#047857' : 'transparent',
                  color: currentPage === 'customer-storefront' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: currentPage === 'customer-storefront' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Storefront</span>
                <span style={{ fontSize: '0.85rem' }}>🌿</span>
              </button>

              <button
                onClick={() => onNavigate('vendor-portal')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: currentPage === 'vendor-portal' ? '#FFFFFF' : 'transparent',
                  color: currentPage === 'vendor-portal' ? '#047857' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: currentPage === 'vendor-portal' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Vendor Portal
              </button>
            </div>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B' }}>
              <MapPin size={15} color="#047857" />
              <span>Bengaluru Cold Hub</span>
            </div>

            {/* Notification Bell */}
            <button
              style={{
                position: 'relative',
                background: '#FFFFFF',
                border: '1px solid #E2E8E5',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
              }}
              title="Notifications"
            >
              <Bell size={17} />
              <span
                style={{
                  position: 'absolute',
                  top: '7px',
                  right: '7px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                }}
              />
            </button>

            {/* User Avatar Circle */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              JD
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main
          className="main-content-area"
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {children}
        </main>
      </div>

    </div>
  );
};
