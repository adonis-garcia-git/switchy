import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 20;

export interface UndoRedoControls<T> {
  state: T;
  setState: (next: T) => void;
  undo: () => T | undefined;
  redo: () => T | undefined;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initial: T) => void;
}

export function useUndoRedo<T>(initial: T): UndoRedoControls<T> {
  const [state, setStateInternal] = useState<T>(initial);
  const history = useRef<T[]>([initial]);
  const pointer = useRef(0);

  const setState = useCallback((next: T) => {
    const idx = pointer.current;
    // Trim future states
    history.current = history.current.slice(0, idx + 1);
    history.current.push(next);
    // Enforce max history
    if (history.current.length > MAX_HISTORY) {
      history.current = history.current.slice(history.current.length - MAX_HISTORY);
    }
    pointer.current = history.current.length - 1;
    setStateInternal(next);
  }, []);

  const undo = useCallback((): T | undefined => {
    if (pointer.current > 0) {
      pointer.current -= 1;
      const newState = history.current[pointer.current];
      setStateInternal(newState);
      return newState;
    }
    return undefined;
  }, []);

  const redo = useCallback((): T | undefined => {
    if (pointer.current < history.current.length - 1) {
      pointer.current += 1;
      const newState = history.current[pointer.current];
      setStateInternal(newState);
      return newState;
    }
    return undefined;
  }, []);

  const reset = useCallback((initial: T) => {
    history.current = [initial];
    pointer.current = 0;
    setStateInternal(initial);
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: pointer.current > 0,
    canRedo: pointer.current < history.current.length - 1,
    reset,
  };
}
