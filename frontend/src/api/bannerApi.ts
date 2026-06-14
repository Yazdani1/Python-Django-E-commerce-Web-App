import { apiClient } from "./client";
import type { ApiResult, Banner, BannerPayload } from "@/types";

function toFormData(payload: BannerPayload): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  if (payload.subtitle !== undefined) fd.append("subtitle", payload.subtitle);
  fd.append("image", payload.image);
  if (payload.link_url !== undefined) fd.append("link_url", payload.link_url);
  if (payload.order !== undefined) fd.append("order", String(payload.order));
  if (payload.is_active !== undefined)
    fd.append("is_active", payload.is_active ? "true" : "false");
  return fd;
}

export const bannerApi = {
  list: (): Promise<ApiResult<Banner[]>> =>
    apiClient.get<Banner[]>("/banners/"),

  create: (payload: BannerPayload): Promise<ApiResult<Banner>> =>
    apiClient.postForm<Banner>("/banners/", toFormData(payload)),

  update: (id: number, payload: Partial<BannerPayload>): Promise<ApiResult<Banner>> => {
    const fd = new FormData();
    if (payload.title !== undefined) fd.append("title", payload.title);
    if (payload.subtitle !== undefined) fd.append("subtitle", payload.subtitle);
    if (payload.image) fd.append("image", payload.image);
    if (payload.link_url !== undefined) fd.append("link_url", payload.link_url);
    if (payload.order !== undefined) fd.append("order", String(payload.order));
    if (payload.is_active !== undefined)
      fd.append("is_active", payload.is_active ? "true" : "false");
    return apiClient.patchForm<Banner>(`/banners/${id}/`, fd);
  },

  remove: (id: number): Promise<ApiResult<null>> =>
    apiClient.del<null>(`/banners/${id}/`),
};
