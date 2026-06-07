import api from "./axiosInstance";
import type { ApiResponse, UpdateProfilePayload, User } from "@/types";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<User>>("/users/me/"),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<ApiResponse<User>>("/users/me/", payload),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<ApiResponse<null>>("/users/change-password/", payload),
};
