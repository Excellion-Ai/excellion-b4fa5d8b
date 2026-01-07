import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Send,
  Loader2,
  ChevronDown,
  Sparkles,
  Camera,
  Dumbbell,
  Code,
  DollarSign,
  Check,
  Settings2,
} from 'lucide-react';
import { AttachmentMenu, AttachmentChips, AttachmentItem } from './attachments';

interface GenerationStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface CourseOptions {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  includeQuizzes: boolean;
  includeAssignments: boolean;
}

interface CourseBuilderPanelProps {
  idea: string;
  onIdeaChange: (idea: string) => void;
  onGenerate: (options: CourseOptions) => void;
  isGenerating: boolean;
  steps: GenerationStep[];
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
  attachments: AttachmentItem[];
  onAddAttachment: (item: AttachmentItem) => void;
  onRemoveAttachment: (id: string) => void;
  previewRef?: React.RefObject<HTMLElement>;
}

const EXAMPLE_PROMPTS = [
  { label: 'Photography basics for beginners', icon: Camera },
  { label: 'Python programming bootcamp', icon: Code },
  { label: 'Personal finance mastery', icon: DollarSign },
  { label: 'Fitness coaching certification', icon: Dumbbell },
];

const GENERATION_STEPS = [
  'Understanding your idea...',
  'Creating curriculum structure...',
  'Writing lesson content...',
  'Finalizing course...',
];

export function CourseBuilderPanel({
  idea,
  onIdeaChange,
  onGenerate,
  isGenerating,
  steps,
  messages,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  previewRef,
}: CourseBuilderPanelProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [options, setOptions] = useState<CourseOptions>({
    difficulty: 'beginner',
    duration_weeks: 6,
    includeQuizzes: true,
    includeAssignments: false,
  });

  const handleGenerate = () => {
    if (idea.trim()) {
      onGenerate(options);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handlePromptClick = (prompt: string) => {
    onIdeaChange(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !isGenerating && (
            <div className="text-center py-8">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary/50" />
              <p className="text-muted-foreground text-sm">
                Describe your course idea to get started
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Generation Progress */}
          {isGenerating && steps.length > 0 && (
            <div className="bg-card/50 border border-border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generating your course...
              </p>
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 text-sm transition-opacity ${
                      step.status === 'pending' ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    {step.status === 'complete' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : step.status === 'error' ? (
                      <span className="h-4 w-4 text-red-500">✗</span>
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                    )}
                    <span className={step.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}>
                      {GENERATION_STEPS[idx] || step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 space-y-4">
        {/* Example Prompts */}
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_PROMPTS.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={prompt.label}
                  onClick={() => handlePromptClick(prompt.label)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border hover:border-primary/50 hover:bg-muted transition-all text-xs text-muted-foreground hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {prompt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Attachments */}
        <AttachmentChips attachments={attachments} onRemove={onRemoveAttachment} />

        {/* Main Input */}
        <Textarea
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your course idea in detail...

Example: Create a comprehensive photography course for beginners that covers camera basics, composition, lighting, and post-processing techniques."
          className="min-h-[120px] resize-none bg-card/50 border-border focus-visible:ring-primary"
          disabled={isGenerating}
        />

        {/* Course Options */}
        <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Course Options
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${optionsOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Difficulty</Label>
                <Select
                  value={options.difficulty}
                  onValueChange={(value: CourseOptions['difficulty']) =>
                    setOptions((prev) => ({ ...prev, difficulty: value }))
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Select
                  value={options.duration_weeks.toString()}
                  onValueChange={(value) =>
                    setOptions((prev) => ({ ...prev, duration_weeks: parseInt(value) }))
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 weeks</SelectItem>
                    <SelectItem value="4">4 weeks</SelectItem>
                    <SelectItem value="6">6 weeks</SelectItem>
                    <SelectItem value="8">8 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="quizzes"
                  checked={options.includeQuizzes}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeQuizzes: checked }))
                  }
                  disabled={isGenerating}
                />
                <Label htmlFor="quizzes" className="text-sm cursor-pointer">
                  Include quizzes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="assignments"
                  checked={options.includeAssignments}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeAssignments: checked }))
                  }
                  disabled={isGenerating}
                />
                <Label htmlFor="assignments" className="text-sm cursor-pointer">
                  Include assignments
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <div className="flex items-center gap-2">
          <AttachmentMenu
            onAddAttachment={onAddAttachment}
            disabled={isGenerating}
            attachmentCount={attachments.length}
            previewRef={previewRef}
          />
          <Button
            onClick={handleGenerate}
            disabled={!idea.trim() || isGenerating}
            className="flex-1 bg-primary hover:bg-primary/90 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Course
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
