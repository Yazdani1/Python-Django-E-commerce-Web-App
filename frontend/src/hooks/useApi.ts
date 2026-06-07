/**
 * Generic hook that wraps any async API call with loading + error state.
 * Eliminates the try/catch/finally boilerplate from every component.
 *
 * Usage:
 *   const { execute, isLoading, error } = useApi(userApi.updateMe);
 *   await execute({ first_name: "Jane" });
 */
import { useState, useCallback } from "react";
import { AxiosResponse } from "axios";

type ApiFunction<TArgs extends unknown[], TData> = (
  ...args: TArgs
) => Promise<AxiosResponse<TData>>;

interface UseApiReturn<TArgs extends unknown[], TData> {
  execute: (...args: TArgs) => Promise<TData | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useApi<TArgs extends unknown[], TData>(
  apiFn: ApiFunction<TArgs, TData>
): UseApiReturn<TArgs, TData> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFn(...args);
        return response.data;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFn]
  );

  return { execute, isLoading, error, clearError };
}

function extractErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response?.data
      ?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return "An unexpected error occurred.";
}
