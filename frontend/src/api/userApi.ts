import { apiClient } from "./client";
import type { ApiResult, UpdateProfilePayload, User } from "@/types";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export const userApi = {
  getMe: (): Promise<ApiResult<User>> => apiClient.get<User>("/users/me/"),

  updateMe: (payload: UpdateProfilePayload): Promise<ApiResult<User>> =>
    apiClient.patch<User>("/users/me/", payload),

  changePassword: (payload: ChangePasswordPayload): Promise<ApiResult<null>> =>
    apiClient.post<null>("/users/change-password/", payload),
};
