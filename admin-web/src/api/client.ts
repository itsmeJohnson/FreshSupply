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

  // Customer Pricing & Credit Management
  getCustomerPricingStats: () => apiRequest('/pricing/stats'),
  getCustomerPricingList: (params?: { search?: string; customerType?: string; priceListId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.customerType) qs.set('customerType', params.customerType);
    if (params?.priceListId) qs.set('priceListId', params.priceListId);
    return apiRequest(`/pricing/customers?${qs.toString()}`);
  },
  getCustomerPricingDetail: (customerId: number) => apiRequest(`/pricing/customers/${customerId}`),
  updateCustomerSkuPrice: (customerId: number, data: { productId: number; customPrice: number; minOrderQty?: number; reason?: string }) =>
    apiRequest(`/pricing/customers/${customerId}/sku`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomerSkuPrice: (customerId: number, productId: number) =>
    apiRequest(`/pricing/customers/${customerId}/sku/${productId}`, { method: 'DELETE' }),
  getProductPricingMatrix: (productId: number) => apiRequest(`/pricing/product-matrix/${productId}`),
  bulkAdjustPrices: (data: { customerIds?: number[]; percentage: number; reason: string; categoryId?: number }) =>
    apiRequest('/pricing/bulk-adjust', { method: 'POST', body: JSON.stringify(data) }),
  getReusablePriceLists: () => apiRequest('/pricing/price-lists'),
  getPricingAuditLogs: () => apiRequest('/pricing/audit-logs'),
  updateCustomerCredit: (customerId: number, data: any) =>
    apiRequest(`/pricing/customers/${customerId}/credit`, { method: 'PUT', body: JSON.stringify(data) }),
  updateCustomerDelivery: (customerId: number, data: any) =>
    apiRequest(`/pricing/customers/${customerId}/delivery`, { method: 'PUT', body: JSON.stringify(data) }),

  // Vendor & Procurement
  registerVendor: (data: any) =>
    apiRequest('/vendors/register', { method: 'POST', body: JSON.stringify(data) }),
  getVendors: (params?: { search?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    return apiRequest(`/vendors?${qs.toString()}`);
  },
  getPurchaseOrders: (status?: string) =>
    apiRequest(`/vendors/procurement/purchase-orders${status ? `?status=${status}` : ''}`),
  createPurchaseOrder: (data: any) =>
    apiRequest('/vendors/procurement/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  recordGrn: (data: any) =>
    apiRequest('/vendors/procurement/grn', { method: 'POST', body: JSON.stringify(data) }),

  // Credit & Accounts Receivable
  getCreditStats: () => apiRequest('/credit/stats'),
  getCreditAccounts: (params?: { search?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    return apiRequest(`/credit/accounts?${qs.toString()}`);
  },
  getCreditLedger: (customerId: number) => apiRequest(`/credit/accounts/${customerId}/ledger`),
  recordCustomerPayment: (data: { customerId: number; amount: number; paymentMethod?: string; transactionId?: string; notes?: string }) =>
    apiRequest('/credit/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Tax Invoices
  getInvoice: (orderId: number) => apiRequest(`/invoices/order/${orderId}`),

  // Phase 3: Sales CRM
  getLeads: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    return apiRequest(`/crm/leads?${qs.toString()}`);
  },
  createLead: (data: any) =>
    apiRequest('/crm/leads', { method: 'POST', body: JSON.stringify(data) }),
  logActivity: (leadId: number, data: any) =>
    apiRequest(`/crm/leads/${leadId}/activity`, { method: 'POST', body: JSON.stringify(data) }),
  convertLead: (leadId: number) =>
    apiRequest(`/crm/leads/${leadId}/convert`, { method: 'POST' }),
  getCustomer360: (customerId: number) =>
    apiRequest(`/crm/customer-360/${customerId}`),

  // Phase 3: Commercial Contracts
  getContracts: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    return apiRequest(`/contracts?${qs.toString()}`);
  },
  getContract: (id: number) => apiRequest(`/contracts/${id}`),
  createContract: (data: any) =>
    apiRequest('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  updateContractStatus: (id: number, status: string, reviewNotes?: string) =>
    apiRequest(`/contracts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reviewNotes }) }),

  // Phase 3: Pricing Automation & Simulator
  getMargins: (params?: { categoryId?: string; customerId?: string; lowMarginOnly?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.categoryId) qs.set('categoryId', params.categoryId);
    if (params?.customerId) qs.set('customerId', params.customerId);
    if (params?.lowMarginOnly) qs.set('lowMarginOnly', 'true');
    return apiRequest(`/pricing-automation/margins?${qs.toString()}`);
  },
  getPriceComparison: (productId: number) =>
    apiRequest(`/pricing-automation/comparison/${productId}`),
  simulatePriceChange: (data: any) =>
    apiRequest('/pricing-automation/simulator', { method: 'POST', body: JSON.stringify(data) }),
  getPriceChangeRequests: (status?: string) =>
    apiRequest(`/pricing-automation/requests${status ? `?status=${status}` : ''}`),
  submitPriceChangeRequest: (data: any) =>
    apiRequest('/pricing-automation/requests', { method: 'POST', body: JSON.stringify(data) }),
  reviewPriceChangeRequest: (id: number, action: 'APPROVED' | 'REJECTED', reviewNotes?: string) =>
    apiRequest(`/pricing-automation/requests/${id}/review`, { method: 'PATCH', body: JSON.stringify({ action, reviewNotes }) }),

  // Phase 3: Procurement Planning
  getQuoteComparison: (productId: number) =>
    apiRequest(`/procurement-planning/quote-comparison/${productId}`),
  getReorderRecommendations: () =>
    apiRequest('/procurement-planning/reorder-recommendations'),
  getRequisitions: () =>
    apiRequest('/procurement-planning/requisitions'),
  createRequisition: (data: any) =>
    apiRequest('/procurement-planning/requisitions', { method: 'POST', body: JSON.stringify(data) }),
  convertRequisitionToPo: (id: number) =>
    apiRequest(`/procurement-planning/requisitions/${id}/convert-po`, { method: 'POST' }),

  // Phase 3: Logistics & Fleet
  getDispatchBoard: () => apiRequest('/logistics/dispatch-board'),
  getTrips: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.date) qs.set('date', params.date);
    return apiRequest(`/logistics/trips?${qs.toString()}`);
  },
  createTrip: (data: any) =>
    apiRequest('/logistics/trips', { method: 'POST', body: JSON.stringify(data) }),
  assignOrdersToTrip: (tripId: number, orderIds: number[]) =>
    apiRequest(`/logistics/trips/${tripId}/assign-orders`, { method: 'POST', body: JSON.stringify({ orderIds }) }),
  updateTripStatus: (tripId: number, status: string) =>
    apiRequest(`/logistics/trips/${tripId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Phase 3: Collections & 5-Bucket Aging
  getAgingReport: () => apiRequest('/collections/aging-report'),
  getCustomerReceivables: () => apiRequest('/collections/customer-receivables'),
  allocatePayment: (data: any) =>
    apiRequest('/collections/allocate-payment', { method: 'POST', body: JSON.stringify(data) }),
  sendPaymentReminder: (data: { customerId: number; invoiceId: number; channel?: string }) =>
    apiRequest('/collections/reminders', { method: 'POST', body: JSON.stringify(data) }),

  // Phase 3: Inventory Intelligence
  getExpiryFefo: () => apiRequest('/inventory-intelligence/expiry-fefo'),
  getStockHealth: () => apiRequest('/inventory-intelligence/stock-health'),

  // Phase 3: Executive BI Dashboard
  getExecutiveKpis: () => apiRequest('/executive-bi/dashboard-kpis'),
  getSalesTrends: () => apiRequest('/executive-bi/sales-trends'),
  getSkuProfitability: () => apiRequest('/executive-bi/sku-profitability'),

  // Phase 3: Notifications
  getNotifications: (params?: { channel?: string; recipientType?: string }) => {
    const qs = new URLSearchParams();
    if (params?.channel) qs.set('channel', params.channel);
    if (params?.recipientType) qs.set('recipientType', params.recipientType);
    return apiRequest(`/notifications?${qs.toString()}`);
  },
  sendNotification: (data: any) =>
    apiRequest('/notifications/send', { method: 'POST', body: JSON.stringify(data) }),

  // Phase 3: Customer Self-Service
  getShoppingLists: () => apiRequest('/self-service/shopping-lists'),
  createShoppingList: (data: any) =>
    apiRequest('/self-service/shopping-lists', { method: 'POST', body: JSON.stringify(data) }),
  repeatOrder: (orderId: number) =>
    apiRequest(`/self-service/repeat-order/${orderId}`, { method: 'POST' }),
  cancelOrderRequest: (orderId: number, reason: string) =>
    apiRequest(`/self-service/cancel-request/${orderId}`, { method: 'POST', body: JSON.stringify({ reason }) }),
};
