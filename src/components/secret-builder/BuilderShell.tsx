import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Code, HelpCircle, Bug, Send, Loader2 } from 'lucide-react';
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

  const [idea, setIdea] = useState(initialIdea);
  const [siteSpec, setSiteSpec] = useState<SiteSpec | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate if we have an initial idea from the hub
  useEffect(() => {
    if (initialIdea && !siteSpec && !isGenerating) {
      handleGenerate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStep = (stepId: number, status: GenerationStep['status']) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s))
    );
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;

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
      const generatedSpec = specFromChat(idea);
      await new Promise((r) => setTimeout(r, 300));
      updateStep(3, 'complete');

      // Step 4: Building preview
      updateStep(4, 'active');
      await new Promise((r) => setTimeout(r, 200));
      setSiteSpec(generatedSpec);
      updateStep(4, 'complete');

      // Save project to database
      const projectName = generatedSpec.name || idea.slice(0, 50);
      const { error: saveError } = await supabase
        .from('builder_projects')
        .insert({
          name: projectName,
          idea: idea,
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

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Column - Site Preview + Chat Input */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-border/50 px-4 flex items-center justify-between bg-card/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/secret-builder-hub')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            Hub
          </Button>
          <span className="text-sm text-muted-foreground">
            {siteSpec?.name || 'New Project'}
          </span>
        </div>

        {/* Site Preview */}
        <div className="flex-1 overflow-hidden">
          <SiteRenderer siteSpec={siteSpec} isLoading={isGenerating} />
        </div>

        {/* Chat Input at Bottom */}
        <div className="border-t border-border/50 bg-card/50 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-2">
              <Input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your business (e.g., 'Pizza restaurant in Chicago')..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                disabled={isGenerating}
              />
              <Button
                size="icon"
                onClick={handleGenerate}
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
      </div>

      {/* Right Column - Tabbed Panels */}
      <div className="w-[400px] border-l border-border/50 bg-card/20 flex flex-col">
        <Tabs defaultValue="spec" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-10 px-2 flex-shrink-0">
            <TabsTrigger value="spec" className="text-xs gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Spec
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="debug" className="text-xs gap-1.5">
              <Bug className="h-3.5 w-3.5" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Spec Tab */}
          <TabsContent value="spec" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {siteSpec ? (
                  <pre className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(siteSpec, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No site generated yet. Enter an idea to see the SiteSpec.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-medium text-foreground">Clarifying Questions</h3>
                {siteSpec ? (
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-xs text-primary font-medium mt-0.5">1.</span>
                      <p className="text-sm text-muted-foreground">What services do you offer?</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-xs text-primary font-medium mt-0.5">2.</span>
                      <p className="text-sm text-muted-foreground">What's your primary call-to-action?</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-xs text-primary font-medium mt-0.5">3.</span>
                      <p className="text-sm text-muted-foreground">Do you have existing branding/colors?</p>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter an idea to see clarifying questions.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-medium text-foreground">Generation Steps</h3>
                {steps.length > 0 ? (
                  <ul className="space-y-2">
                    {steps.map((step) => (
                      <li key={step.id} className="flex items-center gap-2 text-sm">
                        <span className={`h-2 w-2 rounded-full ${
                          step.status === 'complete' ? 'bg-green-500' :
                          step.status === 'active' ? 'bg-yellow-500 animate-pulse' :
                          step.status === 'error' ? 'bg-red-500' :
                          'bg-muted'
                        }`} />
                        <span className={step.status === 'complete' ? 'text-foreground' : 'text-muted-foreground'}>
                          {step.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No generation in progress
                  </p>
                )}

                {siteSpec && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-foreground mb-2">Detected</h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Business Model: <span className="text-foreground">{siteSpec.businessModel}</span></p>
                      <p>Theme: <span className="text-foreground">{siteSpec.theme.darkMode ? 'Dark' : 'Light'}</span></p>
                      <p>Sections: <span className="text-foreground">{siteSpec.pages[0]?.sections?.length || 0}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
