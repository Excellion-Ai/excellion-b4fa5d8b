import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, HelpCircle, Bug, Send, Loader2, Monitor } from 'lucide-react';
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
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Left Column - Site Preview + Chat Input */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Site Preview Area */}
        <div 
          className="flex-1 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#f5f0e8' }}
        >
          {siteSpec ? (
            <SiteRenderer siteSpec={siteSpec} isLoading={isGenerating} />
          ) : (
            <div className="text-center p-8">
              <Monitor className="h-12 w-12 mx-auto mb-4" style={{ color: '#888' }} />
              <p style={{ color: '#666' }}>
                No site generated yet. Enter an idea to see a live preview.
              </p>
            </div>
          )}
        </div>

        {/* Chat Input at Bottom */}
        <div 
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ backgroundColor: '#2a2a2a' }}
        >
          <Input
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app idea..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-500"
            disabled={isGenerating}
          />
          <Button
            size="icon"
            onClick={handleGenerate}
            disabled={!idea.trim() || isGenerating}
            className="h-10 w-10 rounded-full"
            style={{ backgroundColor: '#b8964c' }}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Right Column - Tabbed Panels */}
      <div 
        className="w-[380px] flex flex-col m-4 ml-0 rounded-xl overflow-hidden"
        style={{ backgroundColor: '#2a2a2a' }}
      >
        <Tabs defaultValue="code" className="h-full flex flex-col">
          <TabsList 
            className="w-full justify-start rounded-none bg-transparent h-12 px-2 flex-shrink-0 border-b"
            style={{ borderColor: '#444' }}
          >
            <TabsTrigger 
              value="code" 
              className="text-sm gap-2 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400"
            >
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger 
              value="questions" 
              className="text-sm gap-2 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400"
            >
              <HelpCircle className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger 
              value="debug" 
              className="text-sm gap-2 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400"
            >
              <Bug className="h-4 w-4" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Code Tab */}
          <TabsContent value="code" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {siteSpec ? (
                  <pre className="text-xs p-3 rounded-lg overflow-auto" style={{ backgroundColor: '#1a1a1a', color: '#aaa' }}>
                    {JSON.stringify(siteSpec, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm" style={{ color: '#888' }}>
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
                <h3 className="text-sm font-medium text-white">Clarifying Questions</h3>
                {siteSpec ? (
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-xs font-medium mt-0.5" style={{ color: '#b8964c' }}>1.</span>
                      <p className="text-sm" style={{ color: '#aaa' }}>What services do you offer?</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-xs font-medium mt-0.5" style={{ color: '#b8964c' }}>2.</span>
                      <p className="text-sm" style={{ color: '#aaa' }}>What's your primary call-to-action?</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-xs font-medium mt-0.5" style={{ color: '#b8964c' }}>3.</span>
                      <p className="text-sm" style={{ color: '#aaa' }}>Do you have existing branding/colors?</p>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: '#888' }}>
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
                <h3 className="text-sm font-medium text-white">Generation Steps</h3>
                {steps.length > 0 ? (
                  <ul className="space-y-2">
                    {steps.map((step) => (
                      <li key={step.id} className="flex items-center gap-2 text-sm">
                        <span className={`h-2 w-2 rounded-full ${
                          step.status === 'complete' ? 'bg-green-500' :
                          step.status === 'active' ? 'bg-yellow-500 animate-pulse' :
                          step.status === 'error' ? 'bg-red-500' :
                          'bg-gray-600'
                        }`} />
                        <span style={{ color: step.status === 'complete' ? '#fff' : '#888' }}>
                          {step.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: '#888' }}>
                    No generation in progress
                  </p>
                )}

                {siteSpec && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-white mb-2">Detected</h3>
                    <div className="space-y-1 text-xs" style={{ color: '#888' }}>
                      <p>Business Model: <span className="text-white">{siteSpec.businessModel}</span></p>
                      <p>Theme: <span className="text-white">{siteSpec.theme.darkMode ? 'Dark' : 'Light'}</span></p>
                      <p>Sections: <span className="text-white">{siteSpec.pages[0]?.sections?.length || 0}</span></p>
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
