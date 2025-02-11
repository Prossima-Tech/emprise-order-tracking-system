import { useState } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseSortProps<T> {
  initialSortBy?: keyof T;
  initialDirection?: SortDirection;
}

export function useSort<T>({
  initialSortBy,
  initialDirection = 'asc',
}: UseSortProps<T> = {}) {
  const [sortBy, setSortBy] = useState<keyof T | undefined>(initialSortBy);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const setSorting = (field: keyof T) => {
    if (sortBy === field) {
      toggleDirection();
    } else {
      setSortBy(field);
      setDirection('asc');
    }
  };

  return {
    sortBy,
    direction,
    setSorting,
  };
}
