// src/hooks/useQuery.ts
import { useState, useEffect } from 'react';

interface QueryOptions<T> {
  queryFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
  dependencies?: any[]; // Add dependencies option
}

export const useQuery = <T>({
  queryFn,
  onSuccess,
  onError,
  enabled = true,
  dependencies = [], // Add dependencies parameter with default empty array
}: QueryOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, ...dependencies]); // Add dependencies to useEffect

  return { data, loading, error, refetch: fetchData };
};