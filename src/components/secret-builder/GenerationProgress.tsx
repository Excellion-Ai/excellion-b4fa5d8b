import { useEffect, useState, useMemo } from 'react';
import { Loader2, Zap, Clock, Hash, Layers, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Generation phases with their approximate token weights
const GENERATION_PHASES = [
  { id: 'init', label: 'Initializing', weight: 0.05 },
  { id: 'theme', label: 'Theme & Branding', weight: 0.10 },
  { id: 'structure', label: 'Site Structure', weight: 0.15 },
  { id: 'hero', label: 'Hero Section', weight: 0.20 },
  { id: 'content', label: 'Content Sections', weight: 0.35 },
  { id: 'footer', label: 'Footer & Final', weight: 0.15 },
] as const;

// Estimate total tokens based on complexity
function estimateTokensForComplexity(pageCount: number, sectionTypes: string[]): number {
  const baseTokens = 1500; // Minimum for a simple site
  const tokensPerPage = 600;
  const tokensPerSection = 150;
  
  return Math.min(
    baseTokens + (pageCount * tokensPerPage) + (sectionTypes.length * tokensPerSection),
    5000 // Cap at 5000
  );
}

// Detect current generation phase from token count
function detectPhase(tokenCount: number, estimatedTotal: number): number {
  const progress = tokenCount / estimatedTotal;
  let accumulated = 0;
  
  for (let i = 0; i < GENERATION_PHASES.length; i++) {
    accumulated += GENERATION_PHASES[i].weight;
    if (progress < accumulated) return i;
  }
  return GENERATION_PHASES.length - 1;
}

interface GenerationProgressProps {
  tokenCount: number;
  startTime: number | null;
  isGenerating: boolean;
  estimatedTotalTokens?: number;
  pageCount?: number;
  sectionTypes?: string[];
  speculativeSpec?: any; // Partial spec parsed during stream
}

export function GenerationProgress({ 
  tokenCount, 
  startTime, 
  isGenerating,
  estimatedTotalTokens,
  pageCount = 1,
  sectionTypes = [],
  speculativeSpec,
}: GenerationProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  
  // Calculate dynamic token estimate based on complexity
  const dynamicEstimate = useMemo(() => {
    if (estimatedTotalTokens) return estimatedTotalTokens;
    return estimateTokensForComplexity(pageCount, sectionTypes);
  }, [estimatedTotalTokens, pageCount, sectionTypes]);
  
  // Current phase
  const currentPhaseIndex = useMemo(() => 
    detectPhase(tokenCount, dynamicEstimate), 
    [tokenCount, dynamicEstimate]
  );
  
  useEffect(() => {
    if (!isGenerating || !startTime) {
      setElapsedSeconds(0);
      setSmoothProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(elapsed);
      
      if (elapsed > 0 && tokenCount > 0) {
        setTokensPerSecond(tokenCount / elapsed);
      }
      
      // Smooth progress animation
      const targetProgress = Math.min((tokenCount / dynamicEstimate) * 100, 95);
      setSmoothProgress(prev => prev + (targetProgress - prev) * 0.15);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isGenerating, startTime, tokenCount, dynamicEstimate]);
  
  if (!isGenerating) return null;
  
  const remainingTokens = Math.max(0, dynamicEstimate - tokenCount);
  const etaSeconds = tokensPerSecond > 0 ? remainingTokens / tokensPerSecond : 0;
  
  const formatTime = (seconds: number) => {
    if (seconds < 1) return '<1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  // Extract speculative preview info
  const speculativeInfo = useMemo(() => {
    if (!speculativeSpec) return null;
    return {
      name: speculativeSpec.name,
      pageCount: speculativeSpec.pages?.length || 0,
      sectionCount: speculativeSpec.pages?.reduce((acc: number, p: any) => 
        acc + (p.sections?.length || 0), 0) || 0,
      hasTheme: !!speculativeSpec.theme,
    };
  }, [speculativeSpec]);

  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-3 border border-border/50 min-h-[140px]">
      {/* Header with stats */}
      <div className="flex items-center justify-between text-xs min-h-[20px]">
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-[100px]">
          <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
          <span className="font-medium">{GENERATION_PHASES[currentPhaseIndex].label}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1" title="Tokens generated">
            <Hash className="h-3 w-3" />
            <span className="font-mono text-[11px]">{tokenCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1" title="Speed">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[11px]">{Math.round(tokensPerSecond)}/s</span>
          </div>
          {etaSeconds > 0 && tokenCount > 100 && (
            <div className="flex items-center gap-1" title="ETA">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="font-mono text-[11px]">~{formatTime(etaSeconds)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar with gradient */}
      <div className="relative">
        <Progress value={smoothProgress} className="h-2" />
        <div 
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary/80 to-primary animate-pulse"
          style={{ width: `${Math.min(smoothProgress + 2, 100)}%`, opacity: 0.3 }}
        />
      </div>
      
      {/* Phase indicators */}
      <div className="flex gap-1">
        {GENERATION_PHASES.map((phase, idx) => (
          <div 
            key={phase.id}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors duration-300",
              idx < currentPhaseIndex ? "bg-primary" :
              idx === currentPhaseIndex ? "bg-primary/50 animate-pulse" :
              "bg-muted-foreground/20"
            )}
            title={phase.label}
          />
        ))}
      </div>
      
      {/* Speculative preview info */}
      {speculativeInfo && (
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 pt-1 border-t border-border/30">
          {speculativeInfo.name && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {speculativeInfo.name}
            </span>
          )}
          {speculativeInfo.pageCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {speculativeInfo.pageCount} page{speculativeInfo.pageCount > 1 ? 's' : ''}
            </span>
          )}
          {speculativeInfo.sectionCount > 0 && (
            <span>{speculativeInfo.sectionCount} sections</span>
          )}
        </div>
      )}
      
      {/* Footer stats */}
      <div className="flex justify-between text-[10px] text-muted-foreground/70">
        <span>Elapsed: {formatTime(elapsedSeconds)}</span>
        <span>{Math.round(smoothProgress)}% complete</span>
      </div>
    </div>
  );
}
