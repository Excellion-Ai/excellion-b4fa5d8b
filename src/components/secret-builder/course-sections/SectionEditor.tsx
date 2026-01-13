import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, X, Plus, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableSection } from './SortableSection';
import { toast } from 'sonner';

export interface SectionConfig {
  id: string;
  label: string;
  required?: boolean;
}

interface SectionEditorProps {
  sections: string[];
  availableSections: SectionConfig[];
  onSectionsChange: (sections: string[]) => void;
  onSave: () => Promise<void>;
  pageType: 'landing' | 'curriculum' | 'lesson' | 'dashboard';
}

export function SectionEditor({
  sections,
  availableSections,
  onSectionsChange,
  onSave,
  pageType,
}: SectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.indexOf(active.id as string);
      const newIndex = sections.indexOf(over.id as string);
      onSectionsChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleRemove = (sectionId: string) => {
    const config = availableSections.find((s) => s.id === sectionId);
    if (config?.required) return;
    onSectionsChange(sections.filter((id) => id !== sectionId));
  };

  const handleAdd = (sectionId: string) => {
    if (!sections.includes(sectionId)) {
      onSectionsChange([...sections, sectionId]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      toast.success('Layout saved successfully');
    } catch (error) {
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  const unusedSections = availableSections.filter(
    (s) => !sections.includes(s.id)
  );

  const getSectionLabel = (id: string) => {
    return availableSections.find((s) => s.id === id)?.label || id;
  };

  const isRequired = (id: string) => {
    return availableSections.find((s) => s.id === id)?.required || false;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {pageType} Sections
        </h3>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          <Check className="w-4 h-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save Layout'}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((sectionId) => (
              <SortableSection
                key={sectionId}
                id={sectionId}
                label={getSectionLabel(sectionId)}
                isRequired={isRequired(sectionId)}
                onRemove={() => handleRemove(sectionId)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {unusedSections.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border">
            {unusedSections.map((section) => (
              <DropdownMenuItem
                key={section.id}
                onClick={() => handleAdd(section.id)}
                className="cursor-pointer"
              >
                {section.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
