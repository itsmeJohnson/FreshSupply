const rawBase = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
const API_BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

export function getStoredToken(): string | null {
  return localStorage.getItem('freshsupply_admin_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('freshsupply_admin_token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('freshsupply_admin_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      removeStoredToken();
    }
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/staff/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/staff/me'),

  // Dashboard
  getDashboardStats: () => apiRequest('/dashboard/stats'),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/products${qs}`);
  },
  getProduct: (id: number) => apiRequest(`/products/${id}`),
  createProduct: (productData: any) =>
    apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id: number, productData: any) =>
    apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  toggleProductActive: (id: number) =>
    apiRequest(`/products/${id}/toggle-active`, { method: 'PATCH' }),

  // Categories
  getCategories: (all: boolean = true) =>
    apiRequest(`/categories?all=${all}`),
  createCategory: (catData: any) =>
    apiRequest('/categories', { method: 'POST', body: JSON.stringify(catData) }),
  updateCategory: (id: number, catData: any) =>
    apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(catData) }),

  // Inventory
  getInventory: (params?: { lowStockOnly?: boolean; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.lowStockOnly) qs.set('lowStockOnly', 'true');
    if (params?.search) qs.set('search', params.search);
    return apiRequest(`/inventory?${qs.toString()}`);
  },
  getInventoryLogs: (productId?: number) => {
    const qs = productId ? `?productId=${productId}` : '';
    return apiRequest(`/inventory/logs${qs}`);
  },
  adjustStock: (adjustment: { productId: number; newQuantity: number; reason: string; notes?: string }) =>
    apiRequest('/inventory/adjust', { method: 'POST', body: JSON.stringify(adjustment) }),

  // Orders
  getOrders: (params?: { status?: string; search?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.date) qs.set('date', params.date);
    return apiRequest(`/orders/admin/all?${qs.toString()}`);
  },
  getOrder: (id: number) => apiRequest(`/orders/admin/${id}`),
  updateOrderStatus: (id: number, status: string, notes?: string, cancellationReason?: string) =>
    apiRequest(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, cancellationReason }),
    }),

  // Customers
  getCustomers: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/customers/admin/all${qs}`);
  },
  getCustomer: (id: number) => apiRequest(`/customers/admin/${id}`),
  toggleCustomerStatus: (id: number) =>
    apiRequest(`/customers/admin/${id}/toggle-status`, { method: 'PATCH' }),

  // Staff
  getStaffList: () => apiRequest('/staff/users'),
  createStaff: (userData: any) =>
    apiRequest('/staff/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateStaffRole: (id: number, role: 'admin' | 'staff') =>
    apiRequest(`/staff/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  toggleStaffActive: (id: number) =>
    apiRequest(`/staff/users/${id}/toggle`, { method: 'PATCH' }),
};
