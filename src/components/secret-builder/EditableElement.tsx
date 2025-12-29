import { useRef, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useVisualMode, EditableProperty } from './VisualModeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditableElementProps {
  children: ReactNode;
  elementId: string;
  sectionId: string;
  itemIndex?: number;
  label: string;
  properties: EditableProperty[];
  className?: string;
}

export function EditableElement({
  children,
  elementId,
  sectionId,
  itemIndex,
  label,
  properties,
  className,
}: EditableElementProps) {
  const { 
    visualModeActive, 
    selectedElement, 
    setSelectedElement,
    hoveredElementId,
    setHoveredElementId 
  } = useVisualMode();
  const elementRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedElement?.id === elementId;
  const isHovered = hoveredElementId === elementId;

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!visualModeActive) return;
    e.stopPropagation();
    
    const rect = elementRef.current?.getBoundingClientRect();
    setSelectedElement({
      id: elementId,
      sectionId,
      itemIndex,
      label,
      properties,
      rect,
    });
  }, [visualModeActive, elementId, sectionId, itemIndex, label, properties, setSelectedElement]);

  const handleMouseEnter = useCallback(() => {
    if (visualModeActive) {
      setHoveredElementId(elementId);
    }
  }, [visualModeActive, elementId, setHoveredElementId]);

  const handleMouseLeave = useCallback(() => {
    if (visualModeActive) {
      setHoveredElementId(null);
    }
  }, [visualModeActive, setHoveredElementId]);

  if (!visualModeActive) {
    return <>{children}</>;
  }

  const content = (
    <div
      ref={elementRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative transition-all duration-150 cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background rounded',
        isHovered && !isSelected && 'ring-2 ring-blue-400/50 ring-offset-1 ring-offset-background rounded',
        className
      )}
    >
      {children}
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded-t z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );

  if (isHovered && !isSelected) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-blue-500 text-white text-xs border-blue-500"
          >
            Click to edit {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
