import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Sparkles, Building2, GraduationCap, LayoutDashboard, Users, Calendar, ShoppingCart, Paperclip, Camera, FileText, Link2, MoreHorizontal } from 'lucide-react';
import { BuilderConfig, BuilderTarget, Complexity, PRESETS, TARGETS, COMPLEXITIES } from '@/types/app-spec';

const iconMap = {
  Building2,
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingCart,
};

interface IdeaInputPanelProps {
  idea: string;
  onIdeaChange: (idea: string) => void;
  config: BuilderConfig;
  onConfigChange: (config: BuilderConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function IdeaInputPanel({
  idea,
  onIdeaChange,
  config,
  onConfigChange,
  onGenerate,
  isGenerating,
}: IdeaInputPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetClick = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      onIdeaChange(`I want to build a ${preset.label.toLowerCase()}`);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
    setAttachOpen(false);
  };

  const handleScreenshot = () => {
    // Placeholder for screenshot functionality
    setAttachOpen(false);
  };

  const handlePasteUrl = () => {
    // Placeholder for URL paste functionality
    setAttachOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Secret Builder
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Describe the app you want. I'll turn it into a full blueprint and a build prompt.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Presets */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Quick Start
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const Icon = iconMap[preset.icon as keyof typeof iconMap];
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left text-sm"
                >
                  <Icon className="h-4 w-4 text-primary/70" />
                  <span className="text-foreground/90">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Input with Attach Menu */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your Idea
          </label>
          <div className="relative">
            <Textarea
              placeholder="Describe your app idea..."
              value={idea}
              onChange={(e) => onIdeaChange(e.target.value)}
              className="min-h-[160px] bg-card/50 border-border/50 resize-none text-foreground placeholder:text-muted-foreground/50 pl-12"
            />
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              multiple
            />
            
            {/* Attach Button with Popover */}
            <Popover open={attachOpen} onOpenChange={setAttachOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                side="top" 
                align="start" 
                className="w-48 p-2 bg-card border-border/50"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleFileSelect}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                  >
                    <FileText className="h-4 w-4 text-primary/70" />
                    Attach File
                  </button>
                  <button
                    onClick={handleScreenshot}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                  >
                    <Camera className="h-4 w-4 text-primary/70" />
                    Screenshot
                  </button>
                  <button
                    onClick={handlePasteUrl}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                  >
                    <Link2 className="h-4 w-4 text-primary/70" />
                    Paste URL
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Advanced Toggles */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
            <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
            Advanced Options
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Target Builder</label>
                <Select
                  value={config.target}
                  onValueChange={(value: BuilderTarget) => onConfigChange({ ...config, target: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGETS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Complexity</label>
                <Select
                  value={config.complexity}
                  onValueChange={(value: Complexity) => onConfigChange({ ...config, complexity: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLEXITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={!idea.trim() || isGenerating}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Blueprint
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
