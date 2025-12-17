import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { useBuilderState } from "@/hooks/useBuilderState";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";
import { BuilderChat } from "@/components/builder/BuilderChat";
import { BuilderPreviewPanel } from "@/components/builder/BuilderPreviewPanel";

const HISTORY_KEY = 'excellion-builder-history';

type HistoryItem = {
  id: string;
  name: string;
  date: string;
};

const BotExperiment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = (location.state as { initialPrompt?: string; template?: string })?.initialPrompt || "";
  const template = (location.state as { template?: string })?.template || "";
  
  const {
    state,
    messages,
    inputs,
    spec,
    generatedCode,
    error,
    projectName,
    isLoading,
    canExport,
    setInputs,
    setProjectName,
    generatePlan,
    handleQuickAction,
    startExport,
    reset,
  } = useBuilderState();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const hasAutoSent = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    if (state === 'preview_ready' && projectName !== 'Untitled Project') {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        name: projectName,
        date: new Date().toLocaleDateString(),
      };
      setHistory(prev => {
        const updated = [newItem, ...prev.slice(0, 9)];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [state, projectName]);

  useEffect(() => {
    if (hasAutoSent.current) return;
    
    const promptToSend = initialPrompt || (template ? `Build me a ${template} website` : "");
    
    if (promptToSend) {
      hasAutoSent.current = true;
      setTimeout(() => {
        generatePlan(promptToSend);
      }, 500);
    }
  }, [initialPrompt, template, generatePlan]);

  const handleNewProject = () => {
    reset();
  };

  const handleSelectHistory = (id: string) => {
    console.log('Load project:', id);
  };

  const handleRefresh = () => {
    if (spec) {
      // Re-trigger build with existing spec
    }
  };

  const handleBuildFromBrief = () => {
    const briefMessage = `Build a ${inputs.vibe} ${inputs.businessType || 'business'} website focused on ${inputs.goal}. Primary CTA: "${inputs.ctaText}".`;
    generatePlan(briefMessage);
  };

  const handleInputsChange = (newInputs: Partial<typeof inputs>) => {
    setInputs(prev => ({ ...prev, ...newInputs }));
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Excellion Website Builder</title>
      </Helmet>

      {/* Left Sidebar - Project Management */}
      <BuilderSidebar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        state={state}
        onNewProject={handleNewProject}
        history={history}
        onSelectHistory={handleSelectHistory}
      />

      {/* Center Panel - Chat Builder */}
      <div className="flex-1 min-w-0 border-r border-border/40">
        <BuilderChat
          messages={messages}
          state={state}
          isLoading={isLoading}
          inputs={inputs}
          onInputsChange={handleInputsChange}
          onSendMessage={generatePlan}
          onQuickAction={handleQuickAction}
        />
      </div>

      {/* Right Panel - Preview Workspace */}
      <div className="w-[55%] min-w-[450px]">
        <BuilderPreviewPanel
          generatedCode={generatedCode}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onExport={startExport}
          onBuildFromBrief={handleBuildFromBrief}
        />
      </div>
    </div>
  );
};

export default BotExperiment;
