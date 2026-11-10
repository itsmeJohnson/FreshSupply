export const colors = {
  // Primary Palette (Premium Enterprise Light Theme)
  primary: '#047857',        // Primary emerald
  primaryHover: '#065F46',   // Deep emerald hover
  primaryLight: '#ECFDF5',   // Light emerald tint
  accent: '#10B981',         // Accent green

  // Surfaces & Backgrounds
  mainBackground: '#F7F9F8', // Primary application background
  contentBackground: '#FFFFFF', // Clean card/content background
  sidebarBackground: '#FFFFFF', // Clean white sidebar
  mutedSurface: '#F1F5F3',   // Muted surface / pill background
  headerBackground: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8E5',
  borderLight: '#EDF2F0',
  borderFocus: '#047857',

  // Typography
  primaryText: '#172B24',    // Deep slate green primary text
  secondaryText: '#64748B',  // Slate secondary text
  mutedText: '#94A3B8',      // Muted placeholder text

  // Semantic Status Colors
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',
};

export const typography = {
  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoFamily: "'JetBrains Mono', monospace",
};

export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  confirmed: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  processing: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  dispatched: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  delivered: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  cancelled: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
  in_stock: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  low_stock: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  out_of_stock: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
  expiring_soon: { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' },
};
