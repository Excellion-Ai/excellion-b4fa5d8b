import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnimationType = 
  | 'none'
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'scale-up'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'bounce'
  | 'pulse'
  | 'float'
  | 'blur-in';

export type AnimationConfig = {
  type: AnimationType;
  duration: number; // in ms
  delay: number; // in ms
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  trigger: 'load' | 'scroll' | 'hover';
};

const ANIMATION_PRESETS: { value: AnimationType; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No animation' },
  { value: 'fade-in', label: 'Fade In', description: 'Smooth opacity transition' },
  { value: 'fade-up', label: 'Fade Up', description: 'Fade in while moving up' },
  { value: 'fade-down', label: 'Fade Down', description: 'Fade in while moving down' },
  { value: 'fade-left', label: 'Fade Left', description: 'Fade in from right' },
  { value: 'fade-right', label: 'Fade Right', description: 'Fade in from left' },
  { value: 'scale-in', label: 'Scale In', description: 'Grow from center' },
  { value: 'scale-up', label: 'Scale Up', description: 'Grow while fading in' },
  { value: 'slide-up', label: 'Slide Up', description: 'Slide from bottom' },
  { value: 'slide-down', label: 'Slide Down', description: 'Slide from top' },
  { value: 'slide-left', label: 'Slide Left', description: 'Slide from right' },
  { value: 'slide-right', label: 'Slide Right', description: 'Slide from left' },
  { value: 'bounce', label: 'Bounce', description: 'Playful bounce effect' },
  { value: 'pulse', label: 'Pulse', description: 'Subtle pulsing' },
  { value: 'float', label: 'Float', description: 'Gentle floating motion' },
  { value: 'blur-in', label: 'Blur In', description: 'Blur to sharp transition' },
];

const DEFAULT_CONFIG: AnimationConfig = {
  type: 'none',
  duration: 600,
  delay: 0,
  easing: 'ease-out',
  trigger: 'scroll',
};

interface AnimationPickerProps {
  config: AnimationConfig | undefined;
  onChange: (config: AnimationConfig) => void;
  className?: string;
}

export function AnimationPicker({ config = DEFAULT_CONFIG, onChange, className }: AnimationPickerProps) {
  const [previewKey, setPreviewKey] = useState(0);
  
  const currentConfig = { ...DEFAULT_CONFIG, ...config };

  const handleChange = (key: keyof AnimationConfig, value: AnimationConfig[keyof AnimationConfig]) => {
    onChange({ ...currentConfig, [key]: value });
  };

  const replayAnimation = () => {
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">Animation</span>
      </div>

      {/* Animation Type */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Effect</Label>
        <Select
          value={currentConfig.type}
          onValueChange={(v) => handleChange('type', v as AnimationType)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                <div className="flex flex-col">
                  <span>{preset.label}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentConfig.type !== 'none' && (
        <>
          {/* Trigger */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Trigger</Label>
            <Select
              value={currentConfig.trigger}
              onValueChange={(v) => handleChange('trigger', v as AnimationConfig['trigger'])}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="load">On Page Load</SelectItem>
                <SelectItem value="scroll">On Scroll Into View</SelectItem>
                <SelectItem value="hover">On Hover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <span className="text-xs text-muted-foreground">{currentConfig.duration}ms</span>
            </div>
            <Slider
              value={[currentConfig.duration]}
              onValueChange={([v]) => handleChange('duration', v)}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Delay */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">Delay</Label>
              <span className="text-xs text-muted-foreground">{currentConfig.delay}ms</span>
            </div>
            <Slider
              value={[currentConfig.delay]}
              onValueChange={([v]) => handleChange('delay', v)}
              min={0}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Easing */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Easing</Label>
            <Select
              value={currentConfig.easing}
              onValueChange={(v) => handleChange('easing', v as AnimationConfig['easing'])}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ease">Ease</SelectItem>
                <SelectItem value="ease-in">Ease In</SelectItem>
                <SelectItem value="ease-out">Ease Out</SelectItem>
                <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <Button variant="ghost" size="sm" onClick={replayAnimation} className="h-7 px-2">
                <RotateCcw className="w-3 h-3 mr-1" />
                Replay
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center min-h-[80px]">
              <div
                key={previewKey}
                className={cn(
                  'w-16 h-16 bg-primary rounded-lg',
                  `animate-preview-${currentConfig.type}`
                )}
                style={{
                  animationDuration: `${currentConfig.duration}ms`,
                  animationDelay: `${currentConfig.delay}ms`,
                  animationTimingFunction: currentConfig.easing,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get animation class name
export function getAnimationClass(config: AnimationConfig | undefined): string {
  if (!config || config.type === 'none') return '';
  return `animate-section-${config.type}`;
}

// Helper function to get animation style
export function getAnimationStyle(config: AnimationConfig | undefined): React.CSSProperties {
  if (!config || config.type === 'none') return {};
  return {
    animationDuration: `${config.duration}ms`,
    animationDelay: `${config.delay}ms`,
    animationTimingFunction: config.easing,
    animationFillMode: 'both',
  };
}
