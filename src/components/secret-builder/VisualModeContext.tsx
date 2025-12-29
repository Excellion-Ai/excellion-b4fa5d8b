import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface EditableProperty {
  type: 'text' | 'color' | 'spacing' | 'icon' | 'image' | 'url';
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
  options?: string[]; // For icon selection
}

export interface SelectedElement {
  id: string;
  sectionId: string;
  itemIndex?: number;
  label: string;
  properties: EditableProperty[];
  rect?: DOMRect;
}

interface VisualModeContextValue {
  visualModeActive: boolean;
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  updateProperty: (key: string, value: string) => void;
  hoveredElementId: string | null;
  setHoveredElementId: (id: string | null) => void;
}

const VisualModeContext = createContext<VisualModeContextValue>({
  visualModeActive: false,
  selectedElement: null,
  setSelectedElement: () => {},
  updateProperty: () => {},
  hoveredElementId: null,
  setHoveredElementId: () => {},
});

export function useVisualMode() {
  return useContext(VisualModeContext);
}

interface VisualModeProviderProps {
  children: ReactNode;
  active: boolean;
  onPropertyChange?: (sectionId: string, itemIndex: number | undefined, key: string, value: string) => void;
}

export function VisualModeProvider({ children, active, onPropertyChange }: VisualModeProviderProps) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const updateProperty = useCallback((key: string, value: string) => {
    if (!selectedElement) return;
    
    // Update local state
    setSelectedElement(prev => {
      if (!prev) return null;
      return {
        ...prev,
        properties: prev.properties.map(p => 
          p.key === key ? { ...p, value } : p
        )
      };
    });

    // Notify parent
    onPropertyChange?.(selectedElement.sectionId, selectedElement.itemIndex, key, value);
  }, [selectedElement, onPropertyChange]);

  // Clear selection when visual mode is deactivated
  const handleSetSelectedElement = useCallback((element: SelectedElement | null) => {
    if (!active) return;
    setSelectedElement(element);
  }, [active]);

  return (
    <VisualModeContext.Provider value={{
      visualModeActive: active,
      selectedElement,
      setSelectedElement: handleSetSelectedElement,
      updateProperty,
      hoveredElementId,
      setHoveredElementId,
    }}>
      {children}
    </VisualModeContext.Provider>
  );
}

export { VisualModeContext };
