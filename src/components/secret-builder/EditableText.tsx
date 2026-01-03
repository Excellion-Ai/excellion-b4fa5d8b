import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <Tag
      onClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 rounded px-1 -mx-1',
        className
      )}
      style={style}
      title="Click to edit"
    >
      {value || placeholder}
    </Tag>
  );
}
