import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { useBuilderState } from "@/hooks/useBuilderState";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";
import { BuilderChat } from "@/components/builder/BuilderChat";
import { BuilderPreviewPanel } from "@/components/builder/BuilderPreviewPanel";

// Local storage key for history
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
    steps,
    messages,
    spec,
    generatedCode,
    error,
    projectName,
    isLoading,
    canExport,
    setProjectName,
    generatePlan,
    handleQuickAction,
    startExport,
    reset,
  } = useBuilderState();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const hasAutoSent = useRef(false);

  // Load history from localStorage
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

  // Save to history when project completes
  useEffect(() => {
    if (state === 'preview_ready' && projectName !== 'Untitled Project') {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        name: projectName,
        date: new Date().toLocaleDateString(),
      };
      setHistory(prev => {
        const updated = [newItem, ...prev.slice(0, 9)]; // Keep last 10
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [state, projectName]);

  // Auto-send initial prompt if provided
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
    // In a full implementation, this would load the saved project
    console.log('Load project:', id);
  };

  const handleRefresh = () => {
    if (spec) {
      // Re-trigger build with existing spec
      // For now, this is handled by the state hook
    }
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Excellion Website Builder</title>
      </Helmet>

      {/* Left Sidebar */}
      <BuilderSidebar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        steps={steps}
        onNewProject={handleNewProject}
        history={history}
        onSelectHistory={handleSelectHistory}
      />

      {/* Center Chat Panel */}
      <div className="flex-1 min-w-0 border-r border-border/50">
        <BuilderChat
          messages={messages}
          state={state}
          isLoading={isLoading}
          onSendMessage={generatePlan}
          onQuickAction={handleQuickAction}
        />
      </div>

      {/* Right Preview Panel */}
      <div className="w-[55%] min-w-[400px]">
        <BuilderPreviewPanel
          generatedCode={generatedCode}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onExport={startExport}
        />
      </div>
    </div>
  );
};

export default BotExperiment;
