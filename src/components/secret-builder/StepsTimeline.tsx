import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import { AgentStep } from '@/types/app-spec';

interface StepsTimelineProps {
  steps: AgentStep[];
}

export function StepsTimeline({ steps }: StepsTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className="border-t border-border/50 p-6">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
        Agent Steps
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {step.status === 'complete' && (
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-500" />
                </div>
              )}
              {step.status === 'active' && (
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="h-3 w-3 text-primary animate-spin" />
                </div>
              )}
              {step.status === 'pending' && (
                <div className="h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center">
                  <Circle className="h-3 w-3 text-muted-foreground/50" />
                </div>
              )}
              {step.status === 'error' && (
                <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                </div>
              )}
            </div>
            <span className={`text-sm ${
              step.status === 'complete' ? 'text-foreground' :
              step.status === 'active' ? 'text-foreground' :
              step.status === 'error' ? 'text-destructive' :
              'text-muted-foreground/50'
            }`}>
              Step {step.id} — {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
