import { TOKEN_KEYS } from "@/constants";

export const tokenUtils = {
  getAccess: () => localStorage.getItem(TOKEN_KEYS.ACCESS),
  getRefresh: () => localStorage.getItem(TOKEN_KEYS.REFRESH),

  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  },

  isTokenPresent: () => !!localStorage.getItem(TOKEN_KEYS.ACCESS),
};
