import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Mail,
  Phone,
  List,
  CheckSquare,
  Calendar,
  Hash,
  FileText,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FieldType = 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'number' | 'date';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}

interface FormsBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  className?: string;
}

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string; icon: React.ElementType }[] = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'textarea', label: 'Long Text', icon: FileText },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
];

const DEFAULT_FIELDS: FormField[] = [
  { id: 'name', name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
  { id: 'email', name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
  { id: 'message', name: 'message', label: 'Message', type: 'textarea', placeholder: 'How can we help?', required: true },
];

// Sortable field item component
function SortableFieldItem({ 
  field, 
  onUpdate, 
  onRemove 
}: { 
  field: FormField; 
  onUpdate: (field: FormField) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showOptions, setShowOptions] = useState(false);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim()) {
      onUpdate({
        ...field,
        options: [...(field.options || []), newOption.trim()],
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    onUpdate({
      ...field,
      options: (field.options || []).filter((_, i) => i !== index),
    });
  };

  const FieldIcon = FIELD_TYPE_OPTIONS.find(t => t.value === field.type)?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-lg p-4 space-y-3",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Header with drag handle and delete */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1 flex items-center gap-2">
          <FieldIcon className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{field.label || 'Untitled Field'}</span>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Field configuration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            placeholder="Field label"
            className="h-9"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select
            value={field.type}
            onValueChange={(value: FieldType) => onUpdate({ ...field, type: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-3.5 h-3.5" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Placeholder</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            placeholder="Placeholder text"
            className="h-9"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Field Name</Label>
          <Input
            value={field.name}
            onChange={(e) => onUpdate({ ...field, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            placeholder="field_name"
            className="h-9 font-mono text-xs"
          />
        </div>
      </div>

      {/* Required toggle */}
      <div className="flex items-center justify-between pt-1">
        <Label className="text-sm">Required field</Label>
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
        />
      </div>

      {/* Options for select type */}
      {field.type === 'select' && (
        <div className="space-y-2 pt-2 border-t border-border">
          <Label className="text-xs text-muted-foreground">Dropdown Options</Label>
          
          {/* Existing options */}
          <div className="space-y-1">
            {(field.options || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded px-2 py-1 text-sm">
                  {option}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveOption(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Add new option */}
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add option..."
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddOption}
              className="h-8"
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FormsBuilder({ fields, onChange, className }: FormsBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false,
    };
    onChange([...fields, newField]);
  };

  const handleUpdateField = (updatedField: FormField) => {
    onChange(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
  };

  const handleRemoveField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId));
  };

  const handleResetToDefault = () => {
    onChange(DEFAULT_FIELDS);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Form Fields</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset to default
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="max-h-[400px] pr-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {fields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onUpdate={handleUpdateField}
                    onRemove={() => handleRemoveField(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No fields yet. Add your first field below.</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleAddField}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </CardContent>
    </Card>
  );
}

export { DEFAULT_FIELDS };
