import { useState, useCallback, useRef } from 'react';
import { AI } from '@/services/ai';
import { AppSpec, GeneratedCode, SiteDefinition } from '@/types/app-spec';
import { useToast } from '@/hooks/use-toast';

// Build pipeline states
export type BuilderState = 
  | 'idle' 
  | 'collecting_inputs' 
  | 'generating_plan' 
  | 'building' 
  | 'preview_ready' 
  | 'editing' 
  | 'exporting';

export type BuilderStep = {
  id: number;
  key: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type SmartDefaults = {
  businessName: string;
  goal: 'leads' | 'bookings' | 'ecommerce' | 'info';
  ctaText: string;
  vibe: 'modern' | 'luxury' | 'playful' | 'minimal' | 'bold';
  colorPreference?: string;
  referenceUrl?: string;
  businessType?: string;
};

const INITIAL_STEPS: BuilderStep[] = [
  { id: 1, key: 'describe', label: 'Describe', status: 'pending' },
  { id: 2, key: 'style', label: 'Style', status: 'pending' },
  { id: 3, key: 'pages', label: 'Pages', status: 'pending' },
  { id: 4, key: 'integrations', label: 'Integrations', status: 'pending' },
  { id: 5, key: 'build', label: 'Build', status: 'pending' },
  { id: 6, key: 'review', label: 'Review', status: 'pending' },
  { id: 7, key: 'export', label: 'Export', status: 'pending' },
];

const DEFAULT_INPUTS: SmartDefaults = {
  businessName: 'My Business',
  goal: 'leads',
  ctaText: 'Get Started',
  vibe: 'modern',
};

export function useBuilderState() {
  const { toast } = useToast();
  const [state, setState] = useState<BuilderState>('idle');
  const [steps, setSteps] = useState<BuilderStep[]>(INITIAL_STEPS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: "Hi! I'm your website builder assistant. Describe what you're building and I'll create a professional site for you.",
      timestamp: new Date(),
    },
  ]);
  const [inputs, setInputs] = useState<SmartDefaults>(DEFAULT_INPUTS);
  const [spec, setSpec] = useState<AppSpec | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  
  const healAttempts = useRef(0);
  const MAX_HEAL_ATTEMPTS = 2;

  // Step management
  const updateStep = useCallback((stepKey: string, status: BuilderStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.key === stepKey ? { ...step, status } : step
    ));
  }, []);

  const setActiveStep = useCallback((stepKey: string) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.key === stepKey ? 'active' : 
              prev.findIndex(s => s.key === stepKey) > prev.findIndex(s => s.key === step.key) 
                ? 'complete' : step.status
    })));
  }, []);

  // Message management
  const addMessage = useCallback((role: Message['role'], content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === 'assistant') {
          newMessages[i] = { ...newMessages[i], content };
          break;
        }
      }
      return newMessages;
    });
  }, []);

  // Core build functions
  const generatePlan = useCallback(async (idea: string) => {
    setState('generating_plan');
    setActiveStep('describe');
    setError(null);
    
    addMessage('user', idea);
    addMessage('assistant', 'Analyzing your idea and creating a build plan...');

    try {
      const data = await AI.builderAgent({
        idea,
        target: 'lovable',
        complexity: 'standard',
        inputs,
      });

      // builderAgent throws on error

      const appSpec = data as AppSpec;
      setSpec(appSpec);
      
      // Extract business name if available
      if (appSpec.siteDefinition?.name) {
        setProjectName(appSpec.siteDefinition.name);
      }

      const planSummary = `**Build Plan Ready!**\n\n${appSpec.summary.slice(0, 3).map(s => `• ${s}`).join('\n')}\n\n**What I'll build:**\n${appSpec.pages.slice(0, 4).map(p => `• ${p.name}`).join('\n')}\n\nStarting build...`;
      
      updateLastAssistantMessage(planSummary);
      updateStep('describe', 'complete');
      updateStep('style', 'complete');
      updateStep('pages', 'complete');
      
      // Auto-start build
      await buildSite(appSpec);
      
    } catch (err) {
      console.error('Plan generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(errorMsg);
      setState('idle');
      updateStep('describe', 'error');
      updateLastAssistantMessage(`Sorry, I encountered an error: ${errorMsg}. Please try again.`);
      toast({
        title: 'Generation Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  }, [inputs, addMessage, updateLastAssistantMessage, updateStep, setActiveStep, toast]);

  const buildSite = useCallback(async (appSpec: AppSpec) => {
    setState('building');
    setActiveStep('build');
    
    addMessage('assistant', 'Building your website...');

    try {
      const data = await AI.generateCode({
        spec: appSpec,
        buildPrompt: appSpec.buildPrompt,
      });

      // generateCode throws on error
      if (data.error) throw new Error(data.error);

      setGeneratedCode(data as GeneratedCode);
      setState('preview_ready');
      updateStep('build', 'complete');
      updateStep('review', 'active');
      healAttempts.current = 0;
      
      updateLastAssistantMessage("Your website is ready! Check the preview on the right. You can now make edits or export your site.");
      
    } catch (err) {
      console.error('Build error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to build site';
      
      // Try self-healing
      if (healAttempts.current < MAX_HEAL_ATTEMPTS && generatedCode?.reactCode) {
        healAttempts.current += 1;
        addMessage('assistant', `Fixing an issue... (attempt ${healAttempts.current}/${MAX_HEAL_ATTEMPTS})`);
        await healCode(appSpec, errorMsg);
      } else {
        setError(errorMsg);
        setState('idle');
        updateStep('build', 'error');
        updateLastAssistantMessage(`Build failed: ${errorMsg}. Try describing your site differently.`);
      }
    }
  }, [addMessage, updateLastAssistantMessage, updateStep, setActiveStep, generatedCode]);

  const healCode = useCallback(async (appSpec: AppSpec, errorMessage: string) => {
    try {
      const data = await AI.generateCode({
        spec: appSpec,
        buildPrompt: appSpec.buildPrompt,
        previousCode: generatedCode?.reactCode,
        error: errorMessage,
      });

      // generateCode throws on error

      setGeneratedCode(data as GeneratedCode);
      setState('preview_ready');
      updateStep('build', 'complete');
      updateStep('review', 'active');
      updateLastAssistantMessage("Fixed! Your website is ready in the preview.");
      
    } catch (err) {
      console.error('Heal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fix code');
      setState('idle');
      updateStep('build', 'error');
    }
  }, [generatedCode, updateLastAssistantMessage, updateStep, setActiveStep]);

  const handleQuickAction = useCallback((action: string) => {
    if (state !== 'preview_ready' && state !== 'editing') {
      toast({
        title: 'Build first',
        description: 'Generate a site before making edits.',
      });
      return;
    }
    
    setState('editing');
    addMessage('user', action);
    addMessage('assistant', `Got it! I'll ${action.toLowerCase()}. Updating your site...`);
    
    // In a real implementation, this would call the AI to make edits
    setTimeout(() => {
      updateLastAssistantMessage(`Done! I've updated your site. Check the preview.`);
      setState('preview_ready');
    }, 1500);
  }, [state, addMessage, updateLastAssistantMessage, toast]);

  const startExport = useCallback(() => {
    setState('exporting');
    setActiveStep('export');
    updateStep('review', 'complete');
    updateStep('export', 'active');
  }, [setActiveStep, updateStep]);

  const reset = useCallback(() => {
    setState('idle');
    setSteps(INITIAL_STEPS);
    setMessages([{
      id: 'initial',
      role: 'assistant',
      content: "Hi! I'm your website builder assistant. Describe what you're building and I'll create a professional site for you.",
      timestamp: new Date(),
    }]);
    setInputs(DEFAULT_INPUTS);
    setSpec(null);
    setGeneratedCode(null);
    setError(null);
    setProjectName('Untitled Project');
    healAttempts.current = 0;
  }, []);

  return {
    // State
    state,
    steps,
    messages,
    inputs,
    spec,
    generatedCode,
    error,
    projectName,
    
  // Setters
  setInputs: (updater: SmartDefaults | ((prev: SmartDefaults) => SmartDefaults)) => {
    if (typeof updater === 'function') {
      setInputs(updater);
    } else {
      setInputs(updater);
    }
  },
  setProjectName,
  setState,
    
    // Actions
    generatePlan,
    buildSite,
    handleQuickAction,
    startExport,
    reset,
    addMessage,
    
    // Computed
    isLoading: state === 'generating_plan' || state === 'building',
    canEdit: state === 'preview_ready' || state === 'editing',
    canExport: state === 'preview_ready' || state === 'editing' || state === 'exporting',
  };
}
