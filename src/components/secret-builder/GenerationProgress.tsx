import { useEffect, useState } from 'react';
import { Loader2, Zap, Clock, Hash } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  tokenCount: number;
  startTime: number | null;
  isGenerating: boolean;
  estimatedTotalTokens?: number;
}

export function GenerationProgress({ 
  tokenCount, 
  startTime, 
  isGenerating,
  estimatedTotalTokens = 2500 
}: GenerationProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  
  useEffect(() => {
    if (!isGenerating || !startTime) {
      setElapsedSeconds(0);
      return;
    }
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(elapsed);
      
      if (elapsed > 0 && tokenCount > 0) {
        setTokensPerSecond(tokenCount / elapsed);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isGenerating, startTime, tokenCount]);
  
  if (!isGenerating) return null;
  
  const progressPercent = Math.min((tokenCount / estimatedTotalTokens) * 100, 95);
  const remainingTokens = Math.max(0, estimatedTotalTokens - tokenCount);
  const etaSeconds = tokensPerSecond > 0 ? remainingTokens / tokensPerSecond : 0;
  
  const formatTime = (seconds: number) => {
    if (seconds < 1) return '<1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-2 border border-border/50">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Generating site...</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1" title="Tokens generated">
            <Hash className="h-3 w-3" />
            <span className="font-mono">{tokenCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1" title="Tokens per second">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="font-mono">{Math.round(tokensPerSecond)}/s</span>
          </div>
          {etaSeconds > 0 && tokenCount > 100 && (
            <div className="flex items-center gap-1" title="Estimated time remaining">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="font-mono">~{formatTime(etaSeconds)}</span>
            </div>
          )}
        </div>
      </div>
      <Progress value={progressPercent} className="h-1.5" />
      <div className="flex justify-between text-[10px] text-muted-foreground/70">
        <span>Elapsed: {formatTime(elapsedSeconds)}</span>
        <span>{Math.round(progressPercent)}% complete</span>
      </div>
    </div>
  );
}
