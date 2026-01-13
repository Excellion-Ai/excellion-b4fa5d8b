import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SortableSectionProps {
  id: string;
  label: string;
  isRequired: boolean;
  onRemove: () => void;
}

export function SortableSection({
  id,
  label,
  isRequired,
  onRemove,
}: SortableSectionProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card/50',
        isDragging
          ? 'border-amber-500 shadow-lg shadow-amber-500/20 z-50'
          : 'border-border hover:border-amber-500/30',
        'transition-colors'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="flex-1 text-sm font-medium">{label}</span>

      {isRequired ? (
        <Lock className="w-4 h-4 text-muted-foreground" />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          onClick={onRemove}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
