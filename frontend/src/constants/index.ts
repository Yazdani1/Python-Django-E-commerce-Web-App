export const APP_NAME = "ShopEase";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
  CATEGORIES: "/categories",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:slug",
  CART: "/cart",
  ORDERS: "/orders",
} as const;

export const productDetailPath = (slug: string) => `/products/${slug}`;

export const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;

export const TOKEN_REFRESH_BUFFER_MS = 60_000;
