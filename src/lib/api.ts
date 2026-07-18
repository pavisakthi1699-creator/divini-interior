// ============================================================
// Divine Interior — PHP/MySQL API Client
// All admin pages use these helpers instead of Supabase.
// ============================================================

// In dev, Vite proxies /api → http://localhost/divine-interior/api
// In production, /api resolves to the same domain's PHP folder.
const API_BASE = '/api';

// ─── Token storage ───────────────────────────────────────────
const TOKEN_KEY = 'di_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Core fetch wrapper ──────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Only send admin token on admin-only endpoints or write operations
  const method      = (options.method ?? 'GET').toUpperCase();
  const isWriteOp   = method !== 'GET';
  const isAdminOnly = [
    'auth.php', 'users.php', 'dashboard.php',
    'orders.php', 'customers.php',
  ].some(p => path.includes(p));
  const isAdminWrite = isWriteOp && [
    'products.php', 'blogs.php',
  ].some(p => path.includes(p));

  if (token && (isAdminOnly || isAdminWrite)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/${path}`, { ...options, headers });
  } catch (networkErr: any) {
    throw new Error('Network error — is XAMPP running?');
  }

  // Try to parse JSON; if it fails (e.g. HTML error page) give a clear message
  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON response (status ${res.status})`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `API error ${res.status}`);
  }

  return json.data as T;
}

// ─── Convenience methods ─────────────────────────────────────
export const api = {
  get:    <T>(path: string)             => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  delete: <T>(path: string)             => request<T>(path, { method: 'DELETE' }),
};

// ─── Auth ─────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  avatar: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export const authApi = {
  login:  (email: string, password: string) =>
    api.post<LoginResponse>('auth.php?action=login', { email, password }),
  logout: () => api.post<{ message: string }>('auth.php?action=logout', {}),
  me:     () => api.get<AdminUser>('auth.php?action=me'),
  changePassword: (current_password: string, new_password: string) =>
    api.post<{ message: string }>('auth.php?action=change-password', { current_password, new_password }),
};

// ─── Paginated list type ──────────────────────────────────────
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Products ─────────────────────────────────────────────────
export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category: string;
  tags: string[];
  images: string[];
  stock: number;
  sku: string | null;
  is_active: boolean | number;
  is_featured: boolean | number;
  options: unknown[];
  variants: unknown[];
  created_at: string;
  updated_at: string;
}

export const productsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Product>>(`products.php${qs}`);
  },
  get:        (id: number)               => api.get<Product>(`products.php?id=${id}`),
  getBySlug:  (slug: string)             => api.get<Product>(`products.php?slug=${encodeURIComponent(slug)}`),
  create:     (data: Partial<Product>)   => api.post<Product>('products.php', data),
  update:     (id: number, data: Partial<Product>) => api.put<Product>(`products.php?id=${id}`, data),
  delete:     (id: number)               => api.delete<{ deleted: boolean }>(`products.php?id=${id}`),
};

// ─── Orders ───────────────────────────────────────────────────
export interface ShippingAddress {
  name: string; line1: string; line2?: string;
  city: string; state: string; postal_code: string; country: string;
}

export interface OrderItem {
  id: string; product_title: string; variant_title: string;
  price: number; quantity: number; total: number; image?: string;
}

export type OrderStatus = 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded';
export type PaymentStatus = 'pending'|'paid'|'failed'|'refunded';

export interface Order {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const ordersApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Order>>(`orders.php${qs}`);
  },
  get:    (id: number)             => api.get<Order>(`orders.php?id=${id}`),
  create: (data: Partial<Order>)   => api.post<Order>('orders.php', data),
  update: (id: number, data: Partial<Order>) => api.put<Order>(`orders.php?id=${id}`, data),
  delete: (id: number)             => api.delete<{ deleted: boolean }>(`orders.php?id=${id}`),
};

// ─── Blogs ─────────────────────────────────────────────────
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author: string;
  tags: string[];
  status: BlogStatus;
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const blogsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Blog>>(`blogs.php${qs}`);
  },
  get:    (id: number)           => api.get<Blog>(`blogs.php?id=${id}`),
  create: (data: Partial<Blog>)  => api.post<Blog>('blogs.php', data),
  update: (id: number, data: Partial<Blog>) => api.put<Blog>(`blogs.php?id=${id}`, data),
  delete: (id: number)           => api.delete<{ deleted: boolean }>(`blogs.php?id=${id}`),
};

// ─── Customers ────────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  addresses: ShippingAddress[];
  total_orders: number;
  total_spent: number;
  notes: string | null;
  tags: string[];
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
}

export const customersApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Customer>>(`customers.php${qs}`);
  },
  get:    (id: number)               => api.get<Customer>(`customers.php?id=${id}`),
  create: (data: Partial<Customer>)  => api.post<Customer>('customers.php', data),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`customers.php?id=${id}`, data),
  delete: (id: number)               => api.delete<{ deleted: boolean }>(`customers.php?id=${id}`),
};

// ─── Admin Users ──────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ items: AdminUser[] }>(`users.php${qs}`);
  },
  get:    (id: number)                  => api.get<AdminUser>(`users.php?id=${id}`),
  create: (data: Partial<AdminUser> & { password: string }) =>
    api.post<AdminUser>('users.php', data),
  update: (id: number, data: Partial<AdminUser> & { password?: string }) =>
    api.put<AdminUser>(`users.php?id=${id}`, data),
  delete: (id: number)                  => api.delete<{ deleted: boolean }>(`users.php?id=${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardData {
  stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
  };
  revenue_chart: { month: string; revenue: number; orders: number }[];
  recent_orders: Partial<Order>[];
}

export const dashboardApi = {
  get: () => api.get<DashboardData>('dashboard.php'),
};

// ─── Customer Auth ────────────────────────────────────────
const CUSTOMER_TOKEN_KEY = 'di_customer_token';

export function getCustomerToken(): string | null {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}
export function setCustomerToken(t: string): void {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, t);
}
export function removeCustomerToken(): void {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

async function customerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCustomerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}/${path}`, { ...options, headers });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error ?? `API error ${res.status}`);
  return json.data as T;
}

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  auth_type: 'email' | 'google' | 'phone';
  is_verified: boolean | number;
  addresses: ShippingAddress[];
  tags: string[];
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface CustomerLoginResponse {
  token: string;
  user: CustomerUser;
}

export const customerAuthApi = {
  register: (name: string, email: string, password: string) =>
    customerRequest<{ message: string; email: string }>('customer_auth.php?action=register', {
      method: 'POST', body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    customerRequest<CustomerLoginResponse>('customer_auth.php?action=login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  sendOtp: (email: string, type: 'verify' | 'login' | 'reset') =>
    customerRequest<{ message: string }>('customer_auth.php?action=send-otp', {
      method: 'POST', body: JSON.stringify({ email, type }),
    }),
  verifyOtp: (email: string, otp: string, type: 'verify' | 'login' | 'reset') =>
    customerRequest<CustomerLoginResponse | { message: string }>('customer_auth.php?action=verify-otp', {
      method: 'POST', body: JSON.stringify({ email, otp, type }),
    }),
  me: () => customerRequest<CustomerUser>('customer_auth.php?action=me'),
  updateProfile: (data: Partial<CustomerUser> & { password?: string }) =>
    customerRequest<CustomerUser>('customer_auth.php?action=profile', {
      method: 'PUT', body: JSON.stringify(data),
    }),
  logout: () => customerRequest<{ message: string }>('customer_auth.php?action=logout', { method: 'POST', body: '{}' }),
};

export const customerOrdersApi = {
  list: (page = 1) =>
    customerRequest<PaginatedList<Order>>(`customer_orders.php?page=${page}`),
  get: (id: number) =>
    customerRequest<Order>(`customer_orders.php?id=${id}`),
};

// ─── Checkout (public — no auth required) ─────────────────
export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: ShippingAddress;
  items: {
    product_id?: string;
    product_title: string;
    variant_title: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  notes?: string;
  discount?: number;
  total: number;
}

export interface CheckoutResponse {
  order_id: number;
  order_number: string;
  total: number;
  message: string;
}

export const checkoutApi = {
  place: (payload: CheckoutPayload) => {
    const token = getCustomerToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE}/checkout.php`, {
      method: 'POST', headers, body: JSON.stringify(payload),
    }).then(async r => {
      const j: ApiResponse<CheckoutResponse> = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error ?? 'Checkout failed');
      return j.data as CheckoutResponse;
    });
  },
};
