import { useState } from 'react';
import { Palette, Type, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SiteTheme } from '@/types/site-spec';

interface ThemeEditorProps {
  theme: SiteTheme;
  onUpdateTheme: (updates: Partial<SiteTheme>) => void;
}

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'system-ui, sans-serif', label: 'System Default' },
];

const PRESET_COLORS = [
  { name: 'Blue', primary: '#3b82f6', secondary: '#8b5cf6' },
  { name: 'Green', primary: '#10b981', secondary: '#06b6d4' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#ec4899' },
  { name: 'Orange', primary: '#f97316', secondary: '#eab308' },
  { name: 'Red', primary: '#ef4444', secondary: '#f97316' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#3b82f6' },
  { name: 'Pink', primary: '#ec4899', secondary: '#8b5cf6' },
  { name: 'Gold', primary: '#d4af37', secondary: '#92400e' },
];

function ColorPicker({ 
  color, 
  onChange, 
  label 
}: { 
  color: string; 
  onChange: (color: string) => void; 
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-8 h-8 rounded-md border border-border shadow-sm"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#000000', '#374151', '#6b7280', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: c }}
                    onClick={() => onChange(c)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-full p-1 cursor-pointer"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function ThemeEditor({ theme, onUpdateTheme }: ThemeEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Theme & Colors</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Color Presets */}
          <div className="space-y-2">
            <Label className="text-xs">Quick Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onUpdateTheme({ 
                    primaryColor: preset.primary, 
                    secondaryColor: preset.secondary 
                  })}
                  className="flex flex-col items-center gap-1 p-2 rounded-md border border-border hover:border-primary/50 transition-colors"
                  title={preset.name}
                >
                  <div className="flex">
                    <div 
                      className="w-4 h-4 rounded-l"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-r"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Primary Color"
              color={theme.primaryColor}
              onChange={(color) => onUpdateTheme({ primaryColor: color })}
            />
            <ColorPicker
              label="Secondary Color"
              color={theme.secondaryColor}
              onChange={(color) => onUpdateTheme({ secondaryColor: color })}
            />
          </div>

          <ColorPicker
            label="Background Color"
            color={theme.backgroundColor}
            onChange={(color) => onUpdateTheme({ backgroundColor: color })}
          />

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">Dark Mode</Label>
            <Button
              variant={theme.darkMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateTheme({ 
                darkMode: !theme.darkMode,
                backgroundColor: !theme.darkMode ? '#0a0a0a' : '#ffffff',
                textColor: !theme.darkMode ? '#ffffff' : '#1f2937',
              })}
            >
              {theme.darkMode ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Fonts */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Typography</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Heading Font</Label>
              <Select
                value={theme.fontHeading}
                onValueChange={(value) => onUpdateTheme({ fontHeading: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Body Font</Label>
              <Select
                value={theme.fontBody}
                onValueChange={(value) => onUpdateTheme({ fontBody: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
