import { useState, useEffect } from 'react';
import { useVisualMode, EditableProperty } from './VisualModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  X, 
  Type, 
  Palette, 
  Move, 
  Image as ImageIcon, 
  Link, 
  Zap,
  ChevronRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Common icon options
const ICON_OPTIONS = [
  'Zap', 'Shield', 'Clock', 'Star', 'Heart', 'Users', 'Award', 'Target',
  'CheckCircle', 'Settings', 'Sparkles', 'Lightbulb', 'Rocket', 'Gift',
  'Home', 'Mail', 'Phone', 'Globe', 'Camera', 'Music', 'Coffee', 'Car'
];

// Common color presets
const COLOR_PRESETS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#6366f1', '#a855f7', '#d946ef',
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff'
];

// Spacing presets
const SPACING_PRESETS = [
  { label: 'None', value: '0' },
  { label: 'XS', value: '0.25rem' },
  { label: 'SM', value: '0.5rem' },
  { label: 'MD', value: '1rem' },
  { label: 'LG', value: '1.5rem' },
  { label: 'XL', value: '2rem' },
  { label: '2XL', value: '3rem' },
];

interface PropertyEditorProps {
  property: EditableProperty;
  onChange: (value: string) => void;
}

function PropertyEditor({ property, onChange }: PropertyEditorProps) {
  const [localValue, setLocalValue] = useState(property.value);

  useEffect(() => {
    setLocalValue(property.value);
  }, [property.value]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    onChange(value);
  };

  const getIcon = () => {
    switch (property.type) {
      case 'text': return <Type className="w-3.5 h-3.5" />;
      case 'color': return <Palette className="w-3.5 h-3.5" />;
      case 'spacing': return <Move className="w-3.5 h-3.5" />;
      case 'icon': return <Zap className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      case 'url': return <Link className="w-3.5 h-3.5" />;
      default: return <Type className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
        {getIcon()}
        {property.label}
      </Label>

      {property.type === 'text' && (
        property.multiline ? (
          <Textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="text-sm min-h-[80px] resize-none"
            placeholder={`Enter ${property.label.toLowerCase()}...`}
          />
        ) : (
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="text-sm h-8"
            placeholder={`Enter ${property.label.toLowerCase()}...`}
          />
        )
      )}

      {property.type === 'color' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border border-border"
              style={{ backgroundColor: localValue }}
            />
            <Input
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="text-sm h-8 font-mono flex-1"
              placeholder="#000000"
            />
          </div>
          <div className="grid grid-cols-6 gap-1">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => handleChange(color)}
                className={cn(
                  'w-6 h-6 rounded border transition-all hover:scale-110',
                  localValue === color ? 'ring-2 ring-primary ring-offset-1' : 'border-border'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {property.type === 'spacing' && (
        <div className="flex flex-wrap gap-1">
          {SPACING_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={localValue === preset.value ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleChange(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      {property.type === 'icon' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between h-8">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {localValue || 'Select icon'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <ScrollArea className="h-48">
              <div className="grid grid-cols-4 gap-1">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => handleChange(icon)}
                    className={cn(
                      'p-2 rounded text-xs hover:bg-muted transition-colors',
                      localValue === icon && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}

      {property.type === 'image' && (
        <div className="space-y-2">
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="text-sm h-8"
            placeholder="Enter image URL..."
          />
          {localValue && (
            <div className="relative w-full h-20 rounded border border-border overflow-hidden bg-muted">
              <img 
                src={localValue} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {property.type === 'url' && (
        <Input
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="text-sm h-8"
          placeholder="https://..."
          type="url"
        />
      )}
    </div>
  );
}

export function VisualEditPanel() {
  const { selectedElement, setSelectedElement, updateProperty, visualModeActive } = useVisualMode();

  if (!visualModeActive || !selectedElement) {
    return null;
  }

  // Group properties by type
  const textProps = selectedElement.properties.filter(p => p.type === 'text');
  const styleProps = selectedElement.properties.filter(p => ['color', 'spacing'].includes(p.type));
  const mediaProps = selectedElement.properties.filter(p => ['icon', 'image'].includes(p.type));
  const linkProps = selectedElement.properties.filter(p => p.type === 'url');

  return (
    <div 
      className="fixed right-4 top-1/2 -translate-y-1/2 w-72 max-h-[70vh] bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <h3 className="font-semibold text-sm">Edit Element</h3>
          <p className="text-xs text-muted-foreground">{selectedElement.label}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={() => setSelectedElement(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1" scrollbarVariant="purple">
        <div className="p-4 space-y-4">
          {textProps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Type className="w-3 h-3" />
                Content
              </h4>
              {textProps.map((prop) => (
                <PropertyEditor
                  key={prop.key}
                  property={prop}
                  onChange={(value) => updateProperty(prop.key, value)}
                />
              ))}
            </div>
          )}

          {styleProps.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                Style
              </h4>
              {styleProps.map((prop) => (
                <PropertyEditor
                  key={prop.key}
                  property={prop}
                  onChange={(value) => updateProperty(prop.key, value)}
                />
              ))}
            </div>
          )}

          {mediaProps.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                Media
              </h4>
              {mediaProps.map((prop) => (
                <PropertyEditor
                  key={prop.key}
                  property={prop}
                  onChange={(value) => updateProperty(prop.key, value)}
                />
              ))}
            </div>
          )}

          {linkProps.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Link className="w-3 h-3" />
                Links
              </h4>
              {linkProps.map((prop) => (
                <PropertyEditor
                  key={prop.key}
                  property={prop}
                  onChange={(value) => updateProperty(prop.key, value)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Free edits • No credits used
        </span>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setSelectedElement(null)}>
          <Check className="w-3 h-3" />
          Done
        </Button>
      </div>
    </div>
  );
}
