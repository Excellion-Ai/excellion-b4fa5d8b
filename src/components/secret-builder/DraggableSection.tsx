import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface DraggableSectionProps {
  id: string;
  children: ReactNode;
  isEditable?: boolean;
}

export function DraggableSection({ id, children, isEditable = false }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isEditable) {
    return <>{children}</>;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle - using z-floating from hierarchy */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Section outline on hover - no CLS */}
      <div className="group-hover:ring-2 group-hover:ring-primary/30 group-hover:ring-offset-2 rounded-lg transition-all duration-200">
        {children}
      </div>
    </div>
  );
}
