import { apiClient } from "./client";
import type { ApiResult, PaginatedResponse, Product, ProductPayload } from "@/types";

export interface ProductListParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  ordering?: "price" | "-price" | "-created_at" | "name";
  page?: number;
  page_size?: number;
}

function toFormData(payload: ProductPayload): FormData {
  const fd = new FormData();
  fd.append("name", payload.name);
  if (payload.description !== undefined) fd.append("description", payload.description);
  fd.append("price", payload.price);
  if (payload.stock_quantity !== undefined)
    fd.append("stock_quantity", String(payload.stock_quantity));
  if (payload.category !== undefined && payload.category !== null)
    fd.append("category", String(payload.category));
  if (payload.is_active !== undefined)
    fd.append("is_active", payload.is_active ? "true" : "false");
  if (payload.image) fd.append("image", payload.image);
  return fd;
}

export const productApi = {
  list: (params?: ProductListParams): Promise<ApiResult<PaginatedResponse<Product>>> =>
    apiClient.getPaginated<Product>("/products/", params as Record<string, unknown>),

  retrieve: (slug: string): Promise<ApiResult<Product>> =>
    apiClient.get<Product>(`/products/${slug}/`),

  related: (slug: string): Promise<ApiResult<Product[]>> =>
    apiClient.get<Product[]>(`/products/${slug}/related/`),

  create: (payload: ProductPayload): Promise<ApiResult<Product>> =>
    apiClient.postForm<Product>("/products/", toFormData(payload)),

  update: (slug: string, payload: Partial<ProductPayload>): Promise<ApiResult<Product>> =>
    apiClient.patchForm<Product>(`/products/${slug}/`, toFormData(payload as ProductPayload)),

  remove: (slug: string): Promise<ApiResult<null>> =>
    apiClient.del<null>(`/products/${slug}/`),
};
