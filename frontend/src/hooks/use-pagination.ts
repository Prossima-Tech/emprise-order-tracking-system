import { useState } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const reset = () => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    reset,
  };
}
