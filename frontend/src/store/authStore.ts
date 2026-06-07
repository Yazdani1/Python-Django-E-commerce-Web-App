/**
 * Global authentication state via Zustand.
 * All auth mutations go through this store — never manipulate tokens directly in components.
 */
import { create } from "zustand";
import { authApi } from "@/api/authApi";
import { userApi } from "@/api/userApi";
import { tokenUtils } from "@/utils/tokenUtils";
import type { AuthState, LoginPayload, RegisterPayload, User } from "@/types";

interface AuthActions {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
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
    try {
      const { data } = await authApi.login(payload);
      const { access, refresh } = data.data;
      tokenUtils.setTokens(access, refresh);
      set({ accessToken: access, isAuthenticated: true });
      await get().fetchMe();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register(payload);
      return data.data;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refresh = tokenUtils.getRefresh();
    if (refresh) {
      await authApi.logout(refresh).catch(() => null); // best-effort
    }
    tokenUtils.clearTokens();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const { data } = await userApi.getMe();
    set({ user: data.data });
  },
}));
