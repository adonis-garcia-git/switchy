import { useState, useCallback, useEffect } from "react";

export type GridView = "grid-2" | "grid-3" | "grid-4";

const STORAGE_KEY = "switchy-grid-view";

const GRID_CLASSES: Record<GridView, string> = {
  "grid-2": "grid grid-cols-1 sm:grid-cols-2 gap-4",
  "grid-3": "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4",
  "grid-4": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5",
};

const ROWS_PER_PAGE = 5;

const MAX_COLUMNS: Record<GridView, number> = {
  "grid-2": 2,
  "grid-3": 3,
  "grid-4": 4,
};

const ITEMS_PER_PAGE: Record<GridView, number> = {
  "grid-2": MAX_COLUMNS["grid-2"] * ROWS_PER_PAGE, // 10
  "grid-3": MAX_COLUMNS["grid-3"] * ROWS_PER_PAGE, // 15
  "grid-4": MAX_COLUMNS["grid-4"] * ROWS_PER_PAGE, // 20
};

export function useGridView(defaultView: GridView = "grid-4") {
  const [view, setViewState] = useState<GridView>(defaultView);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as GridView | null;
      if (stored && stored in GRID_CLASSES) {
        setViewState(stored);
      }
    } catch {}
  }, []);

  const setView = useCallback((v: GridView) => {
    setViewState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {}
  }, []);

  return {
    view,
    setView,
    gridClassName: GRID_CLASSES[view],
    skeletonCount: ITEMS_PER_PAGE[view],
    itemsPerPage: ITEMS_PER_PAGE[view],
  };
}
