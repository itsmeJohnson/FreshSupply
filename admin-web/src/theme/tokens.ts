export const colors = {
  primary: '#16845B',
  darkGreen: '#116747',
  lightGreen: '#E1F2E8',
  softMint: '#F0F7F2',
  mainBackground: '#F7F8FA',
  cardBackground: '#FFFFFF',
  mainText: '#202B27',
  secondaryText: '#66736B',
  borders: '#DCE4DE',
  error: '#C62828',
  warning: '#B7791F',
  info: '#1E40AF',
  infoLight: '#EFF6FF',
  white: '#FFFFFF',
};

export const typography = {
  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoFamily: "'JetBrains Mono', monospace",
};

export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  confirmed: { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE' },
  processing: { bg: '#E1F2E8', text: '#116747', border: '#A7F3D0' },
  dispatched: { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
  delivered: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
};
