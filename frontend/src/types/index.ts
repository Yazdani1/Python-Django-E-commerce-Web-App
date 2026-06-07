// ── Central error-aware result returned by every apiClient method ───────────
export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

// ── Raw backend success envelope ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Auth ────────────────────────────────────────────────────────────────────
export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

// ── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  is_staff: boolean;
  created_at: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

// ── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

// ── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  stock_quantity: number;
  image_url: string | null;
  category: Category | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: string;
  stock_quantity?: number;
  category?: number | null;
  is_active?: boolean;
  image?: File | null;
}

// ── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  line_total: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: string;
}

export interface AddToCartPayload {
  product_id: number;
  quantity?: number;
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  product_sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface Order {
  id: number;
  total_amount: string;
  status: OrderStatus;
  status_display: string;
  items: OrderItem[];
  created_at: string;
}

// ── Admin Stats ───────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_categories: number;
  total_revenue: string;
  pending_orders: number;
  active_carts: number;
}

// ── Auth store state ────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
