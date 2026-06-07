import api from "./axiosInstance";
import type { ApiResponse, LoginPayload, RegisterPayload, TokenPair, User } from "@/types";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<TokenPair>>("/auth/login/", payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<User>>("/users/register/", payload),

  logout: (refresh: string) =>
    api.post<ApiResponse<null>>("/auth/logout/", { refresh }),

  refreshToken: (refresh: string) =>
    api.post<ApiResponse<{ access: string }>>("/auth/refresh/", { refresh }),
};
