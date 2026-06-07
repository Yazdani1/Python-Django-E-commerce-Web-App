export const APP_NAME = "E-Commerce App";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
} as const;

export const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;

// Token lifetime buffer: refresh 60 s before expiry
export const TOKEN_REFRESH_BUFFER_MS = 60_000;
