import { useState, useCallback } from 'react';

interface UseFilterProps<T> {
  initialFilters?: Partial<T>;
}

export function useFilter<T>({ initialFilters = {} }: UseFilterProps<T> = {}) {
  const [filters, setFilters] = useState<Partial<T>>(initialFilters);

  const setFilter = useCallback(<K extends keyof T>(
    key: K,
    value: T[K] | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    setFilter,
    clearFilters,
    updateFilters,
  };
}