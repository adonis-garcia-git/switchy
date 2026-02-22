import { useState, useCallback, useEffect } from "react";

export type GridView = "grid-2" | "grid-3" | "grid-4";

const STORAGE_KEY = "switchy-grid-view";

const GRID_CLASSES: Record<GridView, string> = {
  "grid-2": "grid grid-cols-1 sm:grid-cols-2 gap-5",
  "grid-3": "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4",
  "grid-4": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5",
};

const SKELETON_COUNTS: Record<GridView, number> = {
  "grid-2": 4,
  "grid-3": 9,
  "grid-4": 12,
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
    skeletonCount: SKELETON_COUNTS[view],
    isList: false,
  };
}
