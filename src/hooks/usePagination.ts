import { useState, useMemo, useCallback, useEffect } from "react";

export function usePagination<T>(items: T[] | null | undefined, perPage = 20) {
  const [page, setPage] = useState(1);

  const totalItems = items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Clamp page when items change (e.g., filter narrows results)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedItems = useMemo(() => {
    if (!items) return null;
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
    perPage,
    rangeStart: totalItems === 0 ? 0 : (page - 1) * perPage + 1,
    rangeEnd: Math.min(page * perPage, totalItems),
  };
}
