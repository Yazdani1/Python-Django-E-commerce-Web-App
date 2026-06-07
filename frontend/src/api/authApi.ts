import { apiClient } from "./client";
import type { ApiResult, LoginPayload, RegisterPayload, TokenPair, User } from "@/types";

export const authApi = {
  login: (payload: LoginPayload): Promise<ApiResult<TokenPair>> =>
    apiClient.post<TokenPair>("/auth/login/", payload),

  register: (payload: RegisterPayload): Promise<ApiResult<User>> =>
    apiClient.post<User>("/auth/register/", payload),

  logout: (refresh: string): Promise<ApiResult<null>> =>
    apiClient.post<null>("/auth/logout/", { refresh }),

  refreshToken: (refresh: string): Promise<ApiResult<{ access: string }>> =>
    apiClient.post<{ access: string }>("/auth/refresh/", { refresh }),
};
