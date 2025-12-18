import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Layers, Layout, Zap, Database, Plug } from 'lucide-react';
import { AppSpec } from '@/types/app-spec';

interface SpecPanelProps {
  spec: AppSpec | null;
  isLoading: boolean;
}

export function SpecPanel({ spec, isLoading }: SpecPanelProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Building your spec...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground/80">No Spec Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Describe your app idea on the left and hit Generate to see the structured spec here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Summary */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary/70" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {spec.summary.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="text-primary/70 mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* App Type & Stack */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary/70" />
              App Type & Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Type</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                {spec.appType}
              </Badge>
            </div>
            <Separator className="bg-border/30" />
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Stack</span>
              <p className="text-sm text-foreground/80 mt-1">{spec.targetStack}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pages */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary/70" />
              Pages / Screens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {spec.pages.map((page, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="font-medium text-foreground/90 min-w-[100px]">{page.name}</span>
                <span className="text-muted-foreground">— {page.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Core Features */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary/70" />
              Core Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {spec.coreFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="text-primary/70 mt-1">•</span>
                <span>{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Model */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-primary/70" />
              Data Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spec.dataModel.map((entity, i) => (
              <div key={i}>
                <span className="text-sm font-medium text-foreground/90">{entity.entity}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entity.fields.map((field, j) => (
                    <Badge key={j} variant="outline" className="text-xs bg-muted/30 border-border/50">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary/70" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {spec.integrations.map((integration, i) => (
                <Badge key={i} variant="secondary" className="bg-muted/50">
                  {integration}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
