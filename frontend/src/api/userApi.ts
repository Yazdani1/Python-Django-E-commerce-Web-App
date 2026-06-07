import api from "./axiosInstance";
import type { ApiResponse, UpdateProfilePayload, User } from "@/types";

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<User>>("/users/me/"),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<ApiResponse<User>>("/users/me/", payload),
};
