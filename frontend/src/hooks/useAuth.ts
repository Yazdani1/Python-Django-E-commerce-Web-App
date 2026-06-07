/**
 * Convenience hook — exposes the auth store slice components care about.
 * Keeps component imports clean: one import instead of reaching into store directly.
 */
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, register, fetchMe } =
    useAuthStore();

  // Rehydrate user on mount if a token already exists in localStorage
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe().catch(() => null);
    }
  }, [isAuthenticated, user, fetchMe]);

  return { user, isAuthenticated, isLoading, login, logout, register };
}
