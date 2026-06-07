import type { AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";
import type { ApiResult, PaginatedResponse } from "@/types";

function extractError(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
    };
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}

async function request<T>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await axiosInstance(config);
    const envelope = response.data as { data: T };
    return { data: envelope.data, error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
}

async function requestPaginated<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResult<PaginatedResponse<T>>> {
  try {
    const response = await axiosInstance({ method: "GET", url, params });
    return { data: response.data as PaginatedResponse<T>, error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    request<T>({ method: "GET", url, params }),

  getPaginated: <T>(url: string, params?: Record<string, unknown>) =>
    requestPaginated<T>(url, params),

  post: <T>(url: string, body?: unknown) =>
    request<T>({ method: "POST", url, data: body }),

  put: <T>(url: string, body?: unknown) =>
    request<T>({ method: "PUT", url, data: body }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>({ method: "PATCH", url, data: body }),

  del: <T>(url: string) => request<T>({ method: "DELETE", url }),
};
