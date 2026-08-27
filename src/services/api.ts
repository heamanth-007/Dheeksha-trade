const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

// Generic Request Helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || `HTTP error! Status: ${response.status}`);
    }

    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error(`[API Error] Request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Customers API
export const CustomersApi = {
  getAll: () => request<any[]>('/customers'),
  getById: (id: string) => request<any>(`/customers/${id}`),
  create: (data: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/customers/${id}`, { method: 'DELETE' }),
};

// Companies API
export const CompaniesApi = {
  getAll: () => request<any[]>('/companies'),
  getById: (id: string) => request<any>(`/companies/${id}`),
  create: (data: any) => request<any>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/companies/${id}`, { method: 'DELETE' }),
};

// Products API
export const ProductsApi = {
  getAll: () => request<any[]>('/products'),
  getById: (id: string) => request<any>(`/products/${id}`),
  create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
};

// Particulars API
export const ParticularsApi = {
  getAll: (customerName?: string) =>
    request<any[]>(`/particulars${customerName && customerName !== 'ALL' ? `?customerName=${encodeURIComponent(customerName)}` : ''}`),
  getNextBillNo: () => request<{ nextBillNo: string }>('/particulars/next-bill-no'),
  getById: (id: string) => request<any>(`/particulars/${id}`),
  create: (data: any) => request<any>('/particulars', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/particulars/${id}`, { method: 'DELETE' }),
};

// Account / Ledger API
export const AccountsApi = {
  getAll: (customerName?: string) =>
    request<any[]>(`/accounts${customerName && customerName !== 'ALL' ? `?customerName=${encodeURIComponent(customerName)}` : ''}`),
  addCredit: (data: { customerName: string; companyName: string; creditAmount: string; date: string }) =>
    request<any>('/accounts/credit', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/accounts/${id}`, { method: 'DELETE' }),
};

// Auth API
export const AuthApi = {
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; user: { username: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<any>('/auth/me'),
};
