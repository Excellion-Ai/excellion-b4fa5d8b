import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { RefinerMeta } from '@/lib/promptRefiner';

interface ImprovedPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPrompt: string;
  refinedPrompt: string;
  meta?: RefinerMeta;
}

export function ImprovedPromptModal({
  open,
  onOpenChange,
  originalPrompt,
  refinedPrompt,
  meta,
}: ImprovedPromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(refinedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasImprovement = refinedPrompt !== originalPrompt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Improved Prompt
          </DialogTitle>
          <DialogDescription>
            Compare your original prompt with the AI-enhanced version used for generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Original Prompt */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Your prompt</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              {originalPrompt || <span className="text-muted-foreground italic">No prompt</span>}
            </div>
          </div>

          {/* Arrow */}
          {hasImprovement && (
            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
            </div>
          )}

          {/* Refined Prompt */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-primary">Enhanced prompt</span>
              {meta?.confidence && (
                <Badge variant="outline" className="text-xs">
                  {meta.confidence} confidence
                </Badge>
              )}
            </div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
              {hasImprovement ? (
                refinedPrompt
              ) : (
                <span className="text-muted-foreground italic">
                  No enhancement needed - your prompt was already great!
                </span>
              )}
            </div>
          </div>

          {/* Meta info */}
          {meta && (meta.detectedIndustry || meta.inferredTone || meta.assumptions?.length) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {meta.detectedIndustry && (
                <Badge variant="secondary" className="text-xs">
                  {meta.detectedIndustry}
                </Badge>
              )}
              {meta.inferredTone && (
                <Badge variant="secondary" className="text-xs">
                  {meta.inferredTone} tone
                </Badge>
              )}
              {meta.inferredGoals?.slice(0, 2).map((goal, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {goal}
                </Badge>
              ))}
            </div>
          )}

          {/* Assumptions */}
          {meta?.assumptions && meta.assumptions.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Assumptions made: </span>
              {meta.assumptions.join(', ')}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {hasImprovement && (
              <Button onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy improved prompt
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
