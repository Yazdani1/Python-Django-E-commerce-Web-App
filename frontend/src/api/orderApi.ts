import { apiClient } from "./client";
import type { ApiResult, Order, OrderStatus, PaginatedResponse } from "@/types";

export const orderApi = {
  list: (): Promise<ApiResult<PaginatedResponse<Order>>> =>
    apiClient.getPaginated<Order>("/orders/"),

  retrieve: (id: number): Promise<ApiResult<Order>> =>
    apiClient.get<Order>(`/orders/${id}/`),

  checkout: (): Promise<ApiResult<Order>> =>
    apiClient.post<Order>("/orders/checkout/"),

  updateStatus: (id: number, status: OrderStatus): Promise<ApiResult<Order>> =>
    apiClient.patch<Order>(`/orders/${id}/status/`, { status }),
};
