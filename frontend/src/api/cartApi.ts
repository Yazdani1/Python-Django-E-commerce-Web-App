import { apiClient } from "./client";
import type { AddToCartPayload, ApiResult, Cart } from "@/types";

export const cartApi = {
  get: (): Promise<ApiResult<Cart>> => apiClient.get<Cart>("/cart/"),

  add: (payload: AddToCartPayload): Promise<ApiResult<Cart>> =>
    apiClient.post<Cart>("/cart/", payload),

  updateItem: (itemId: number, quantity: number): Promise<ApiResult<Cart>> =>
    apiClient.patch<Cart>(`/cart/items/${itemId}/`, { quantity }),

  removeItem: (itemId: number): Promise<ApiResult<Cart>> =>
    apiClient.del<Cart>(`/cart/items/${itemId}/`),

  clear: (): Promise<ApiResult<null>> => apiClient.del<null>("/cart/"),
};
