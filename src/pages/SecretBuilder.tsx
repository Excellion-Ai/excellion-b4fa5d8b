import { useState } from 'react';
import { IdeaInputPanel } from '@/components/secret-builder/IdeaInputPanel';
import { StepsTimeline } from '@/components/secret-builder/StepsTimeline';
import { SpecPanel } from '@/components/secret-builder/SpecPanel';
import { BuildPromptPanel } from '@/components/secret-builder/BuildPromptPanel';
import { AppSpec, AgentStep, BuilderConfig } from '@/types/app-spec';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const INITIAL_STEPS: AgentStep[] = [
  { id: 1, label: 'Understand idea', status: 'pending' },
  { id: 2, label: 'Draft spec', status: 'pending' },
  { id: 3, label: 'Optimize prompt', status: 'pending' },
  { id: 4, label: 'Generate questions', status: 'pending' },
];

export default function SecretBuilder() {
  const [idea, setIdea] = useState('');
  const [config, setConfig] = useState<BuilderConfig>({
    target: 'lovable',
    complexity: 'standard',
  });
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [spec, setSpec] = useState<AppSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

      setSpec(data as AppSpec);
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

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Column - Idea Input */}
      <div className="w-[380px] border-r border-border/50 flex flex-col bg-card/30">
        <IdeaInputPanel
          idea={idea}
          onIdeaChange={setIdea}
          config={config}
          onConfigChange={setConfig}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        <StepsTimeline steps={steps} />
      </div>

      {/* Center Column - Structured Spec */}
      <div className="flex-1 border-r border-border/50 bg-background/50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-sm font-medium text-foreground/80">Structured App Spec</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <SpecPanel spec={spec} isLoading={isGenerating} />
          </div>
        </div>
      </div>

      {/* Right Column - Build Prompt */}
      <div className="w-[420px] bg-card/20">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-sm font-medium text-foreground/80">Build Prompt & Plan</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <BuildPromptPanel spec={spec} isLoading={isGenerating} />
          </div>
        </div>
      </div>
    </div>
  );
}
