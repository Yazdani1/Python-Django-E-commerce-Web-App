import { useState, useCallback } from "react";
import type { ApiResult } from "@/types";

type ApiFunction<TArgs extends unknown[], T> = (
  ...args: TArgs
) => Promise<ApiResult<T>>;

interface UseApiReturn<TArgs extends unknown[], T> {
  execute: (...args: TArgs) => Promise<ApiResult<T>>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useApi<TArgs extends unknown[], T>(
  apiFn: ApiFunction<TArgs, T>
): UseApiReturn<TArgs, T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const execute = useCallback(
    async (...args: TArgs): Promise<ApiResult<T>> => {
      setIsLoading(true);
      setError(null);
      const result = await apiFn(...args);
      setIsLoading(false);
      if (result.error) setError(result.error);
      return result;
    },
    [apiFn]
  );

  return { execute, isLoading, error, clearError };
}
