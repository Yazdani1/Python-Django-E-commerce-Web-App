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
} as const;

export const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;

export const TOKEN_REFRESH_BUFFER_MS = 60_000;
