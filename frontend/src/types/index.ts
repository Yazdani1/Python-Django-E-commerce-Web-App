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

// ── Auth store state ────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
