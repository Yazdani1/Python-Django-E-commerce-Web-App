import { create } from "zustand";
import { authApi } from "@/api/authApi";
import { userApi } from "@/api/userApi";
import { tokenUtils } from "@/utils/tokenUtils";
import type { AuthState, LoginPayload, RegisterPayload } from "@/types";

interface AuthActions {
  // Returns error string on failure, null on success
  login: (payload: LoginPayload) => Promise<string | null>;
  register: (payload: RegisterPayload) => Promise<string | null>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setLoading: (value: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: tokenUtils.getAccess(),
  isAuthenticated: tokenUtils.isTokenPresent(),
  isLoading: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  setLoading: (value) => set({ isLoading: value }),

  login: async (payload) => {
    set({ isLoading: true });
    const result = await authApi.login(payload);
    set({ isLoading: false });
    if (result.error || !result.data) return result.error ?? "Login failed.";
    const { access, refresh } = result.data;
    tokenUtils.setTokens(access, refresh);
    set({ accessToken: access, isAuthenticated: true });
    await get().fetchMe();
    return null;
  },

  register: async (payload) => {
    set({ isLoading: true });
    const result = await authApi.register(payload);
    set({ isLoading: false });
    return result.error;
  },

  logout: async () => {
    const refresh = tokenUtils.getRefresh();
    if (refresh) await authApi.logout(refresh);
    tokenUtils.clearTokens();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const result = await userApi.getMe();
    if (result.data) set({ user: result.data });
  },
}));
