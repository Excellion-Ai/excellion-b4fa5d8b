import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SitePreview } from '@/components/secret-builder/SitePreview';
import { BuildPromptPanel } from '@/components/secret-builder/BuildPromptPanel';
import { AppSpec, AgentStep, BuilderConfig } from '@/types/app-spec';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Code, HelpCircle, Bug, Send, Loader2 } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const INITIAL_STEPS: AgentStep[] = [
  { id: 1, label: 'Understand idea', status: 'pending' },
  { id: 2, label: 'Draft spec', status: 'pending' },
  { id: 3, label: 'Optimize prompt', status: 'pending' },
  { id: 4, label: 'Generate questions', status: 'pending' },
];

export default function SecretBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialIdea = (location.state as { initialIdea?: string })?.initialIdea || '';
  
  const [idea, setIdea] = useState(initialIdea);
  const [config] = useState<BuilderConfig>({
    target: 'lovable',
    complexity: 'standard',
  });
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [spec, setSpec] = useState<AppSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate if we have an initial idea from the hub
  useEffect(() => {
    if (initialIdea && !spec && !isGenerating) {
      handleGenerate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStep = (stepId: number, status: AgentStep['status']) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status } : s))
    );
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setIsGenerating(true);
    setSpec(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));

    try {
      // Step 1: Understand idea
      updateStep(1, 'active');
      await new Promise((r) => setTimeout(r, 300));
      updateStep(1, 'complete');

      // Step 2: Draft spec
      updateStep(2, 'active');

      const { data, error } = await supabase.functions.invoke('builder-agent', {
        body: {
          idea,
          target: config.target,
          complexity: config.complexity,
        },
      });

      if (error) throw error;

      updateStep(2, 'complete');

      // Step 3: Optimize prompt
      updateStep(3, 'active');
      await new Promise((r) => setTimeout(r, 200));
      updateStep(3, 'complete');

      // Step 4: Generate questions
      updateStep(4, 'active');
      await new Promise((r) => setTimeout(r, 200));
      updateStep(4, 'complete');

      const generatedSpec = data as AppSpec;
      setSpec(generatedSpec);

      // Save project to database
      const projectName = generatedSpec.summary?.[0]?.split('.')[0] || idea.slice(0, 50);
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
        toast.success('Project saved to your hub!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate blueprint. Please try again.');
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
            {spec?.siteDefinition?.name || 'New Project'}
          </span>
        </div>

        {/* Site Preview */}
        <div className="flex-1 overflow-hidden">
          <SitePreview 
            siteDefinition={spec?.siteDefinition || null} 
            isLoading={isGenerating} 
          />
        </div>

        {/* Chat Input at Bottom */}
        <div className="border-t border-border/50 bg-card/50 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-2">
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
        <Tabs defaultValue="code" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-10 px-2 flex-shrink-0">
            <TabsTrigger value="code" className="text-xs gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Code
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

          {/* Code Tab */}
          <TabsContent value="code" className="flex-1 overflow-hidden m-0">
            <BuildPromptPanel spec={spec} isLoading={isGenerating} />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-medium text-foreground">Critical Questions</h3>
                {spec?.criticalQuestions?.length ? (
                  <ul className="space-y-3">
                    {spec.criticalQuestions.map((q, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-xs text-primary font-medium mt-0.5">{i + 1}.</span>
                        <p className="text-sm text-muted-foreground">{q}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No questions generated yet. Enter an idea to see clarifying questions.
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
                
                {spec && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-foreground mb-2">Raw Spec</h3>
                    <pre className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-auto max-h-[300px]">
                      {JSON.stringify(spec, null, 2)}
                    </pre>
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
