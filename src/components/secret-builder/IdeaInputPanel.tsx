import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles, Building2, GraduationCap, LayoutDashboard, Users, Calendar, ShoppingCart } from 'lucide-react';
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

  const handlePresetClick = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      onIdeaChange(`I want to build a ${preset.label.toLowerCase()}`);
    }
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

        {/* Main Input */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your Idea
          </label>
          <Textarea
            placeholder="I want a site where users can..."
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            className="min-h-[160px] bg-card/50 border-border/50 resize-none text-foreground placeholder:text-muted-foreground/50"
          />
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
