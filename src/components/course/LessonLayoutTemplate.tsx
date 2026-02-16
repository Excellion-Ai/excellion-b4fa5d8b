import { Check, Target, ListOrdered, Package, ChevronDown, AlertTriangle, Lightbulb, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import type { LessonMeta } from './quickstart-lesson-data';

interface LessonLayoutTemplateProps {
  meta: LessonMeta;
  children?: React.ReactNode; // original lesson content slot
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
}

// ── Goal / Do / Output cards ──
function TopCards({ meta }: { meta: LessonMeta }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Goal</span>
          </div>
          <p className="text-sm text-foreground">{meta.goal}</p>
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListOrdered className="h-4 w-4 text-accent-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">Do This Now</span>
          </div>
          <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
            {meta.steps.map((s, i) => (
              <li key={i} className="leading-snug">{s}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Output</span>
          </div>
          <p className="text-sm text-foreground">{meta.output}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Visual Block ──
function VisualBlock({ meta }: { meta: LessonMeta }) {
  if (meta.visualType === 'none') return null;

  if (meta.visualType === 'screenshot') {
    return (
      <div className="mb-6 rounded-xl border border-border bg-muted/20 overflow-hidden">
        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{meta.visualCaption || 'Screenshot preview'}</p>
          </div>
        </div>
        {meta.visualCaption && (
          <div className="px-4 py-2 border-t border-border bg-card">
            <p className="text-xs text-muted-foreground text-center">{meta.visualCaption}</p>
          </div>
        )}
      </div>
    );
  }

  if (meta.visualType === 'checklist') return null; // Handled by StartHereDashboard

  if (meta.visualType === 'before-after' && meta.exampleBlock?.afterContent) {
    const parts = meta.exampleBlock.afterContent.split(/\n\n(?=AFTER:)/);
    const before = parts[0]?.replace(/^BEFORE:\n?/, '').trim();
    const after = parts.length > 1 ? parts[1]?.replace(/^AFTER:\n?/, '').trim() : meta.exampleBlock.afterContent;

    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Before</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{before || meta.exampleBlock.content}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400">After</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{after}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// ── Example Output Block ──
function ExampleBlock({ meta }: { meta: LessonMeta }) {
  if (!meta.exampleBlock) return null;
  // Before/after is rendered in VisualBlock
  if (meta.visualType === 'before-after') return null;

  const { type, title, content } = meta.exampleBlock;
  const isCode = type === 'prompt' || type === 'command';

  return (
    <div className="mb-6">
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{type.replace('-', ' ')}</Badge>
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(content)} className="h-7 gap-1">
            <Copy className="h-3 w-3" />
            <span className="text-xs">Copy</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isCode ? (
            <pre className="text-sm text-foreground/90 whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border border-border font-mono leading-relaxed">
              {content}
            </pre>
          ) : (
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Key Takeaways ──
function KeyTakeaways({ takeaways }: { takeaways: string[] }) {
  if (!takeaways.length) return null;
  return (
    <Card className="bg-primary/5 border-primary/20 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Key Takeaways
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {takeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ── Collapsible Sections ──
function CollapsibleSections({ meta }: { meta: LessonMeta }) {
  if (!meta.whyItMatters && !meta.troubleshooting) return null;
  return (
    <div className="space-y-2 mb-6">
      {meta.whyItMatters && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors text-left">
            <span className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Why this matters
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pt-2 pb-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{meta.whyItMatters}</p>
          </CollapsibleContent>
        </Collapsible>
      )}
      {meta.troubleshooting && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors text-left">
            <span className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Troubleshooting
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pt-2 pb-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{meta.troubleshooting}</p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ── Main Layout ──
export function LessonLayoutTemplate({ meta, children }: LessonLayoutTemplateProps) {
  return (
    <div className="space-y-0">
      <TopCards meta={meta} />
      <VisualBlock meta={meta} />
      <ExampleBlock meta={meta} />
      {children && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors text-left mb-4">
            <span className="text-sm font-medium">Full Lesson Content</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mb-6">
            {children}
          </CollapsibleContent>
        </Collapsible>
      )}
      <CollapsibleSections meta={meta} />
      <KeyTakeaways takeaways={meta.takeaways} />
    </div>
  );
}
