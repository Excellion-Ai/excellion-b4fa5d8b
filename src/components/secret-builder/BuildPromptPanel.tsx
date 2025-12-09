import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Check, ChevronDown, Terminal, ListOrdered, HelpCircle, FileCode } from 'lucide-react';
import { AppSpec } from '@/types/app-spec';
import { toast } from 'sonner';

interface BuildPromptPanelProps {
  spec: AppSpec | null;
  isLoading: boolean;
}

export function BuildPromptPanel({ spec, isLoading }: BuildPromptPanelProps) {
  const [copied, setCopied] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const handleCopy = async () => {
    if (!spec?.buildPrompt) return;
    await navigator.clipboard.writeText(spec.buildPrompt);
    setCopied(true);
    toast.success('Build prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Generating prompt...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto">
            <Terminal className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground/80">Build Prompt</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your optimized build prompt will appear here after generation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Optimized Build Prompt */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary/70" />
                Optimized Build Prompt
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-background/50 border border-border/30 text-xs text-foreground/80 whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                {spec.buildPrompt}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Build Plan */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-primary/70" />
              Build Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spec.buildPlan.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">{i + 1}</span>
                </div>
                <span className="text-sm text-foreground/80 pt-0.5">{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Questions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary/70" />
              Critical Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Answer these to tighten the spec further:
            </p>
            <div className="space-y-2">
              {spec.criticalQuestions.map((question, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-primary/70 font-medium">{i + 1}.</span>
                  <span>{question}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Notes (Collapsible) */}
        <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors w-full">
            <ChevronDown className={`h-3 w-3 transition-transform ${notesOpen ? 'rotate-180' : ''}`} />
            <FileCode className="h-3 w-3" />
            Architecture Notes
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <Card className="bg-muted/20 border-border/30">
              <CardContent className="p-4 text-xs text-muted-foreground space-y-3">
                <div>
                  <span className="font-medium text-foreground/70">Future Direction:</span>
                  <ul className="mt-1 space-y-1 ml-4 list-disc">
                    <li>Agentic self-healing: auto-detect build errors, re-prompt with fixes</li>
                    <li>AST-based context management for smarter code understanding</li>
                    <li>Sandboxed execution via WebContainers or Beam Cloud</li>
                    <li>MCP integration for external tool orchestration</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-foreground/70">Integration Points:</span>
                  <ul className="mt-1 space-y-1 ml-4 list-disc">
                    <li>Swap AI provider in builder-agent edge function</li>
                    <li>Add real-time preview with iframe sandbox</li>
                    <li>Connect to GitHub for repo scaffolding</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ScrollArea>
  );
}
