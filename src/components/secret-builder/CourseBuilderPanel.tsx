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
  User,
  GraduationCap,
  Palette,
  LucideIcon,
} from 'lucide-react';
import { AttachmentMenu, AttachmentChips, AttachmentItem } from './attachments';

export type CourseTemplate = 'creator' | 'technical' | 'academic' | 'visual';

interface TemplateOption {
  id: CourseTemplate;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  keywords: string[];
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'creator',
    title: 'Creator',
    subtitle: 'Perfect for coaches & personal brands',
    description: 'Warm, personal, story-driven',
    icon: User,
    accentColor: '#f59e0b',
    keywords: [
      'coach', 'coaching', 'personal brand', 'influencer', 'creator', 'content',
      'social media', 'youtube', 'podcast', 'speaking', 'motivation', 'mindset',
      'life', 'wellness', 'self-help', 'productivity', 'habits', 'leadership',
      'business', 'entrepreneur', 'marketing', 'sales', 'communication',
      'relationship', 'parenting', 'fitness trainer', 'health coach'
    ],
  },
  {
    id: 'technical',
    title: 'Technical',
    subtitle: 'Perfect for developers & technical skills',
    description: 'Structured, precise, code-friendly',
    icon: Code,
    accentColor: '#6366f1',
    keywords: [
      'programming', 'coding', 'developer', 'software', 'web', 'app', 'python',
      'javascript', 'react', 'data', 'machine learning', 'ai', 'artificial intelligence',
      'database', 'cloud', 'devops', 'cybersecurity', 'blockchain', 'crypto',
      'api', 'backend', 'frontend', 'fullstack', 'engineering', 'it', 'tech',
      'automation', 'excel', 'spreadsheet', 'sql', 'analytics'
    ],
  },
  {
    id: 'academic',
    title: 'Academic',
    subtitle: 'Perfect for professional certification',
    description: 'Formal, scholarly, credential-focused',
    icon: GraduationCap,
    accentColor: '#1e40af',
    keywords: [
      'certification', 'certificate', 'degree', 'accredited', 'professional',
      'medical', 'legal', 'law', 'healthcare', 'nursing', 'psychology',
      'research', 'science', 'biology', 'chemistry', 'physics', 'mathematics',
      'economics', 'finance', 'accounting', 'mba', 'management', 'hr',
      'compliance', 'regulatory', 'exam prep', 'cpa', 'pmp', 'six sigma'
    ],
  },
  {
    id: 'visual',
    title: 'Visual',
    subtitle: 'Perfect for creative & design skills',
    description: 'Vibrant, image-rich, portfolio-driven',
    icon: Palette,
    accentColor: '#f43f5e',
    keywords: [
      'design', 'photography', 'video', 'editing', 'photoshop', 'illustrator',
      'figma', 'ui', 'ux', 'graphic', 'art', 'drawing', 'painting', 'illustration',
      'animation', 'motion', '3d', 'cinema', 'film', 'creative', 'portfolio',
      'fashion', 'interior', 'architecture', 'branding', 'logo', 'visual'
    ],
  },
];

// Auto-detect template based on niche keywords in the prompt
function detectTemplate(prompt: string): CourseTemplate {
  const lowerPrompt = prompt.toLowerCase();
  
  const scores: Record<CourseTemplate, number> = {
    creator: 0,
    technical: 0,
    academic: 0,
    visual: 0,
  };
  
  for (const template of TEMPLATE_OPTIONS) {
    for (const keyword of template.keywords) {
      if (lowerPrompt.includes(keyword)) {
        scores[template.id] += keyword.split(' ').length; // Weight multi-word matches higher
      }
    }
  }
  
  // Find highest scoring template
  let maxScore = 0;
  let selectedTemplate: CourseTemplate = 'creator'; // Default
  
  for (const [template, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedTemplate = template as CourseTemplate;
    }
  }
  
  return selectedTemplate;
}

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
  template: CourseTemplate;
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
  // Auto-detect template based on idea
  const detectedTemplate = detectTemplate(idea);
  const [options, setOptions] = useState<CourseOptions>({
    difficulty: 'beginner',
    duration_weeks: 6,
    includeQuizzes: true,
    includeAssignments: false,
    template: 'creator',
  });

  const handleGenerate = () => {
    if (idea.trim()) {
      // Use auto-detected template
      onGenerate({ ...options, template: detectedTemplate });
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
          className="min-h-[100px] resize-none bg-card/50 border-border focus-visible:ring-primary"
          disabled={isGenerating}
        />

        {/* Auto-Detected Template Display */}
        {idea.trim() && !isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>Auto-detected course style:</span>
            </div>
            {(() => {
              const detected = TEMPLATE_OPTIONS.find(t => t.id === detectedTemplate);
              if (!detected) return null;
              const Icon = detected.icon;
              return (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border-2 bg-card/50"
                  style={{ borderColor: detected.accentColor }}
                >
                  <div
                    className="p-2 rounded-md"
                    style={{ backgroundColor: `${detected.accentColor}20` }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: detected.accentColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{detected.title}</span>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: detected.accentColor, color: detected.accentColor }}>
                        Auto-detected
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{detected.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

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

            {/* Multi-page hint */}
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">💡 Tip:</span> Want multiple pages? Just say it in your prompt!
                <br />
                <span className="text-muted-foreground/80 italic">
                  e.g., "Create a photography course with bonuses and testimonials pages"
                </span>
              </p>
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
