import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, HelpCircle, Settings, Send, Loader2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { SiteSpec } from '@/types/site-spec';
import { specFromChat } from '@/lib/specFromChat';
import { SiteRenderer } from './SiteRenderer';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type GenerationStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const INITIAL_STEPS: GenerationStep[] = [
  { id: 1, label: 'Analyzing idea', status: 'pending' },
  { id: 2, label: 'Detecting business type', status: 'pending' },
  { id: 3, label: 'Generating structure', status: 'pending' },
  { id: 4, label: 'Building preview', status: 'pending' },
];

export function BuilderShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialIdea = (location.state as { initialIdea?: string })?.initialIdea || '';

  const [idea, setIdea] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [siteSpec, setSiteSpec] = useState<SiteSpec | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  // Auto-generate if we have an initial idea from the hub
  useEffect(() => {
    if (initialIdea && !siteSpec && !isGenerating && messages.length === 0) {
      setIdea(initialIdea);
      handleGenerate(initialIdea);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStep = (stepId: number, status: GenerationStep['status']) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s))
    );
  };

  const handleGenerate = async (inputIdea?: string) => {
    const ideaToUse = inputIdea || idea;
    if (!ideaToUse.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: ideaToUse,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIdea('');

    setIsGenerating(true);
    setSiteSpec(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));

    try {
      // Step 1: Analyzing
      updateStep(1, 'active');
      await new Promise((r) => setTimeout(r, 300));
      updateStep(1, 'complete');

      // Step 2: Detecting business type
      updateStep(2, 'active');
      await new Promise((r) => setTimeout(r, 200));
      updateStep(2, 'complete');

      // Step 3: Generating structure
      updateStep(3, 'active');
      const generatedSpec = specFromChat(ideaToUse);
      await new Promise((r) => setTimeout(r, 300));
      updateStep(3, 'complete');

      // Step 4: Building preview
      updateStep(4, 'active');
      await new Promise((r) => setTimeout(r, 200));
      setSiteSpec(generatedSpec);
      updateStep(4, 'complete');

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've created a ${generatedSpec.businessModel.replace('_', ' ')} website for "${generatedSpec.name}". Check the preview on the right!`,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save project to database
      const projectName = generatedSpec.name || ideaToUse.slice(0, 50);
      const { error: saveError } = await supabase
        .from('builder_projects')
        .insert({
          name: projectName,
          idea: ideaToUse,
          spec: generatedSpec as unknown as Json,
        });

      if (saveError) {
        console.error('Failed to save project:', saveError);
      } else {
        toast.success('Project saved!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate. Please try again.');
      setSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'tablet': return 'max-w-[768px]';
      case 'mobile': return 'max-w-[375px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left Column - Chat */}
      <div className="w-[400px] border-r border-border flex flex-col bg-card/30">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">
                  Describe your business idea to get started
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
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2">
            <Input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your app idea..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              disabled={isGenerating}
            />
            <Button
              size="icon"
              onClick={() => handleGenerate()}
              disabled={!idea.trim() || isGenerating}
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Preview + Tabs */}
      <div className="flex-1 flex flex-col">
        {/* Header with project name, device toggles, and tabs */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/30">
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {siteSpec?.name || 'New Project'}
          </span>

          {/* Device Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${previewMode === 'desktop' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${previewMode === 'tablet' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${previewMode === 'mobile' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Tabs */}
          <div className="flex items-center gap-4">
            <Tabs defaultValue="code" className="h-full">
              <TabsList className="bg-transparent h-full gap-2">
                <TabsTrigger value="code" className="text-xs gap-1.5 data-[state=active]:bg-muted">
                  <Code className="h-3.5 w-3.5" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="questions" className="text-xs gap-1.5 data-[state=active]:bg-muted">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Questions
                </TabsTrigger>
                <TabsTrigger value="debug" className="text-xs gap-1.5 data-[state=active]:bg-muted">
                  <Settings className="h-3.5 w-3.5" />
                  Debug
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-muted/30 p-4 overflow-hidden">
          <div className={`h-full mx-auto ${getPreviewWidth()} transition-all duration-300`}>
            <div className="h-full bg-background rounded-xl shadow-lg overflow-hidden border border-border">
              {siteSpec ? (
                <SiteRenderer siteSpec={siteSpec} isLoading={isGenerating} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No site generated yet. Enter an idea to see a live preview.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
