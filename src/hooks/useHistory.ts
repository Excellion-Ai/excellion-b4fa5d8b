import { useState, useCallback, useRef } from 'react';

interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initialState: T) => void;
}

export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
  const [state, setInternalState] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const indexRef = useRef(0);

  const setState = useCallback((newState: T) => {
    // Remove any future history if we're not at the end
    const history = historyRef.current.slice(0, indexRef.current + 1);
    
    // Add new state
    history.push(newState);
    
    // Limit history size
    if (history.length > maxHistory) {
      history.shift();
    } else {
      indexRef.current++;
    }
    
    historyRef.current = history;
    setInternalState(newState);
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--;
      setInternalState(historyRef.current[indexRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      setInternalState(historyRef.current[indexRef.current]);
    }
  }, []);

  const reset = useCallback((newInitialState: T) => {
    historyRef.current = [newInitialState];
    indexRef.current = 0;
    setInternalState(newInitialState);
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    reset,
  };
}
