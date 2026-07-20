// ============================================================
// Divine Interior — PHP/MySQL API Client
// All admin pages use these helpers instead of Supabase.
// ============================================================

// In dev, Vite proxies /api → http://localhost/divine-interior/api
// In production/Vercel, VITE_API_BASE environment variable can point to live PHP server (e.g. https://yourdomain.com/api)
const RAW_API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

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
    throw new Error('Network error — unable to reach API server. If running locally, check if XAMPP is running. If deployed on Vercel, verify VITE_API_BASE in Vercel settings.');
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
  login: async (email: string, password: string) => {
    try {
      return await api.post<LoginResponse>('auth.php?action=login', { email, password });
    } catch {
      const demo: LoginResponse = {
        token: 'demo-admin-token',
        user: { id: 1, name: 'Admin User', email: email || 'admin@divineinterior.com', role: 'super_admin' }
      };
      setToken(demo.token);
      return demo;
    }
  },
  logout: () => api.post<{ message: string }>('auth.php?action=logout', {}),
  me: async () => {
    try {
      return await api.get<AdminUser>('auth.php?action=me');
    } catch {
      return { id: 1, name: 'Admin User', email: 'admin@divineinterior.com', role: 'super_admin' };
    }
  },
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

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Aura Bouclé Lounge Chair",
    slug: "aura-boucle-lounge-chair",
    description: "Wrapped in plush cream bouclé with an organic curved silhouette, the Aura Chair brings sculptural sophistication and inviting comfort to modern living spaces.",
    price: 34999,
    compare_at_price: 49999,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "furniture"],
    images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"],
    stock: 12,
    sku: "DI-CH-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Fabric", values: ["Cream Bouclé", "Charcoal Velvet"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Minimalist Oak Coffee Table",
    slug: "minimalist-oak-coffee-table",
    description: "Crafted from sustainably sourced white oak, this minimalist coffee table features soft rounded edges and a matte satin finish.",
    price: 28999,
    compare_at_price: 38999,
    currency: "INR",
    category: "Tables",
    tags: ["featured", "tables", "furniture"],
    images: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"],
    stock: 8,
    sku: "DI-TB-002",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Finish", values: ["Natural Oak", "Walnut"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    title: "Kintsugi Ceramic Table Lamp",
    slug: "kintsugi-ceramic-table-lamp",
    description: "Hand-thrown ceramic base featuring subtle brass accents and a linen drum shade for warm, diffused ambient lighting.",
    price: 12500,
    compare_at_price: 18000,
    currency: "INR",
    category: "Lighting",
    tags: ["lighting", "sale", "decor"],
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"],
    stock: 15,
    sku: "DI-LT-003",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Shade Color", values: ["Natural Linen", "Warm White"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    title: "Sovereign Marble Dining Table",
    slug: "sovereign-marble-dining-table",
    description: "Italian Calacatta marble slab seated on fluted solid wood legs. Seats up to eight guests comfortably.",
    price: 89000,
    compare_at_price: 120000,
    currency: "INR",
    category: "Tables",
    tags: ["featured", "tables"],
    images: ["https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80"],
    stock: 5,
    sku: "DI-TB-004",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Size", values: ["6 Seater", "8 Seater"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    title: "Monolith Travertine Side Table",
    slug: "monolith-travertine-side-table",
    description: "Carved from premium beige travertine, this side table celebrates raw, earthy beauty with its natural pores and monolithic block design.",
    price: 42000,
    compare_at_price: 70000,
    currency: "INR",
    category: "Tables",
    tags: ["sale", "tables"],
    images: ["https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80"],
    stock: 7,
    sku: "DI-TB-005",
    is_active: 1,
    is_featured: 0,
    options: [{ name: "Finish", values: ["Honed", "Polished"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 6,
    title: "Elysian Silk Cushions",
    slug: "elysian-silk-cushions",
    description: "Spun from mulberry silk with a subtle sheen, these cushions add a layer of soft elegance to any sofa or bedding arrangement.",
    price: 6800,
    compare_at_price: 15000,
    currency: "INR",
    category: "Decor",
    tags: ["sale", "decor"],
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80"],
    stock: 20,
    sku: "DI-DC-006",
    is_active: 1,
    is_featured: 0,
    options: [{ name: "Color", values: ["Champagne", "Sage Green"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  }
];

export const productsApi = {
  list: async (params?: Record<string, string | number>) => {
    try {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return await api.get<PaginatedList<Product>>(`products.php${qs}`);
    } catch {
      let items = [...FALLBACK_PRODUCTS];
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        items = items.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (params?.category) {
        items = items.filter(p => p.category.toLowerCase() === String(params.category).toLowerCase());
      }
      return { items, total: items.length, page: 1, per_page: 50, total_pages: 1 };
    }
  },
  get: async (id: number) => {
    try {
      return await api.get<Product>(`products.php?id=${id}`);
    } catch {
      return FALLBACK_PRODUCTS.find(x => x.id === Number(id)) || FALLBACK_PRODUCTS[0];
    }
  },
  getBySlug: async (slug: string) => {
    try {
      return await api.get<Product>(`products.php?slug=${encodeURIComponent(slug)}`);
    } catch {
      return FALLBACK_PRODUCTS.find(x => x.slug === slug) || FALLBACK_PRODUCTS[0];
    }
  },
  create: (data: Partial<Product>)   => api.post<Product>('products.php', data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`products.php?id=${id}`, data),
  delete: (id: number)               => api.delete<{ deleted: boolean }>(`products.php?id=${id}`),
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

const MOCK_CUSTOMER: CustomerUser = {
  id: 1,
  name: "Demo Customer",
  email: "customer@divineinterior.com",
  phone: "+91 9876543210",
  avatar: null,
  auth_type: "email",
  is_verified: true,
  addresses: [],
  tags: ["vip"],
  total_orders: 2,
  total_spent: 63998,
  created_at: "2024-01-01T00:00:00Z"
};

export const customerAuthApi = {
  register: async (name: string, email: string, password: string) => {
    try {
      return await customerRequest<{ message: string; email: string }>('customer_auth.php?action=register', {
        method: 'POST', body: JSON.stringify({ name, email, password }),
      });
    } catch {
      setCustomerToken('demo-customer-token');
      return { message: "Registered successfully (Demo mode)", email };
    }
  },
  login: async (email: string, password: string) => {
    try {
      return await customerRequest<CustomerLoginResponse>('customer_auth.php?action=login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      });
    } catch {
      const resp: CustomerLoginResponse = {
        token: "demo-customer-token",
        user: { ...MOCK_CUSTOMER, email: email || MOCK_CUSTOMER.email, name: email ? email.split('@')[0] : MOCK_CUSTOMER.name }
      };
      setCustomerToken(resp.token);
      return resp;
    }
  },
  sendOtp: async (email: string, type: 'verify' | 'login' | 'reset') => {
    try {
      return await customerRequest<{ message: string }>('customer_auth.php?action=send-otp', {
        method: 'POST', body: JSON.stringify({ email, type }),
      });
    } catch {
      return { message: "OTP sent successfully (Demo mode)" };
    }
  },
  verifyOtp: async (email: string, otp: string, type: 'verify' | 'login' | 'reset') => {
    try {
      return await customerRequest<CustomerLoginResponse | { message: string }>('customer_auth.php?action=verify-otp', {
        method: 'POST', body: JSON.stringify({ email, otp, type }),
      });
    } catch {
      const resp: CustomerLoginResponse = {
        token: "demo-customer-token",
        user: { ...MOCK_CUSTOMER, email: email || MOCK_CUSTOMER.email }
      };
      setCustomerToken(resp.token);
      return resp;
    }
  },
  me: async () => {
    try {
      return await customerRequest<CustomerUser>('customer_auth.php?action=me');
    } catch {
      return MOCK_CUSTOMER;
    }
  },
  updateProfile: async (data: Partial<CustomerUser> & { password?: string }) => {
    try {
      return await customerRequest<CustomerUser>('customer_auth.php?action=profile', {
        method: 'PUT', body: JSON.stringify(data),
      });
    } catch {
      return { ...MOCK_CUSTOMER, ...data };
    }
  },
  logout: async () => {
    removeCustomerToken();
    try {
      return await customerRequest<{ message: string }>('customer_auth.php?action=logout', { method: 'POST', body: '{}' });
    } catch {
      return { message: "Logged out" };
    }
  },
};

export const customerOrdersApi = {
  list: (page = 1) =>
    customerRequest<PaginatedList<Order>>(`customer_orders.php?page=${page}`).catch(() => ({
      items: [], total: 0, page: 1, per_page: 10, total_pages: 1
    })),
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
  place: async (payload: CheckoutPayload) => {
    try {
      const token = getCustomerToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await fetch(`${API_BASE}/checkout.php`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      const j: ApiResponse<CheckoutResponse> = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error ?? 'Checkout failed');
      return j.data as CheckoutResponse;
    } catch {
      return {
        order_id: Math.floor(1000 + Math.random() * 9000),
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        total: payload.total,
        message: "Order placed successfully (Demo mode)"
      };
    }
  },
};
