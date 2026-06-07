import { apiClient } from "./client";
import type { AdminStats, ApiResult } from "@/types";

export const dashboardApi = {
  getStats: (): Promise<ApiResult<AdminStats>> =>
    apiClient.get<AdminStats>("/admin/stats/"),
};
