import { createContext, useContext } from 'react';

interface VisualModeContextValue {
  visualModeActive: boolean;
}

export const VisualModeContext = createContext<VisualModeContextValue>({
  visualModeActive: false,
});

export function useVisualMode() {
  return useContext(VisualModeContext);
}
