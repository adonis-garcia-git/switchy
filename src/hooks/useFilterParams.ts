"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function useFilterParams<T>(
  defaults: T,
  parse: (params: URLSearchParams) => Partial<T>,
  serialize: (filters: T) => URLSearchParams
): [T, (filters: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isInternalUpdate = useRef(false);

  const [filters, setFiltersState] = useState<T>(() => {
    const parsed = parse(searchParams);
    return { ...defaults, ...parsed };
  });

  // Sync state from URL on external changes (browser back/forward)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const parsed = parse(searchParams);
    setFiltersState({ ...defaults, ...parsed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setFilters = useCallback(
    (newFilters: T) => {
      setFiltersState(newFilters);
      isInternalUpdate.current = true;
      const params = serialize(newFilters);
      const qs = params.toString();
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, serialize]
  );

  return [filters, setFilters];
}
