import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVisualMode } from './VisualModeContext';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  multiline?: boolean;
  placeholder?: string;
}

export function EditableText({
  value,
  onSave,
  className,
  style,
  as: Tag = 'span',
  multiline = false,
  placeholder = 'Click to edit...',
}: EditableTextProps) {
  const { visualModeActive } = useVisualMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue.trim() !== value) {
      onSave(editValue.trim() || value); // Don't save empty strings
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.metaKey) {
      handleSave();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'bg-transparent border-2 border-primary/50 rounded px-2 py-1 outline-none focus:border-primary w-full',
          multiline && 'min-h-[80px] resize-none',
          className
        )}
        style={{
          ...style,
          boxSizing: 'border-box',
        }}
        placeholder={placeholder}
      />
    );
  }

  const content = (
    <Tag
      onClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer transition-all duration-150 rounded px-1 -mx-1',
        visualModeActive 
          ? 'ring-2 ring-primary/40 ring-offset-2 bg-primary/5 hover:ring-primary/60 hover:bg-primary/10' 
          : 'hover:ring-2 hover:ring-primary/30 hover:ring-offset-2',
        className
      )}
      style={style}
    >
      {value || placeholder}
    </Tag>
  );

  if (visualModeActive) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-primary text-primary-foreground text-xs">
            Click to edit • Free, no credits used
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
