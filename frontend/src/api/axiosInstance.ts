/**
 * Configured Axios instance.
 * - Attaches Bearer token automatically via request interceptor.
 * - Handles 401 → token refresh → retry once via response interceptor.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenUtils } from "@/utils/tokenUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: inject access token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenUtils.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: refresh on 401 ────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refresh = tokenUtils.getRefresh();
      if (!refresh) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
      const newAccess: string = data.data.access;

      tokenUtils.setTokens(newAccess, refresh);
      processQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenUtils.clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
