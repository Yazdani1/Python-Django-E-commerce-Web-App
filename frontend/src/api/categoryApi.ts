import { apiClient } from "./client";
import type { ApiResult, Category, CategoryPayload, PaginatedResponse } from "@/types";

export const categoryApi = {
  list: (): Promise<ApiResult<PaginatedResponse<Category>>> =>
    apiClient.getPaginated<Category>("/categories/"),

  retrieve: (slug: string): Promise<ApiResult<Category>> =>
    apiClient.get<Category>(`/categories/${slug}/`),

  create: (payload: CategoryPayload): Promise<ApiResult<Category>> =>
    apiClient.post<Category>("/categories/", payload),

  update: (slug: string, payload: CategoryPayload): Promise<ApiResult<Category>> =>
    apiClient.put<Category>(`/categories/${slug}/`, payload),

  patch: (
    slug: string,
    payload: Partial<CategoryPayload>
  ): Promise<ApiResult<Category>> =>
    apiClient.patch<Category>(`/categories/${slug}/`, payload),

  remove: (slug: string): Promise<ApiResult<null>> =>
    apiClient.del<null>(`/categories/${slug}/`),
};
