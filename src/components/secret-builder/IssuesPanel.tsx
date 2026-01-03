import { X, AlertTriangle, AlertCircle, Info, Plus, Edit2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { BuilderIssue } from '@/lib/chatResponseFormatter';

type IssuesPanelProps = {
  issues: BuilderIssue[];
  onClose: () => void;
  onFixIssue: (issue: BuilderIssue) => void;
};

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    badge: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    badge: 'secondary' as const,
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    badge: 'outline' as const,
  },
};

const fixActionIcons = {
  add_section: Plus,
  add_page: Plus,
  add_integration: Link2,
  edit_content: Edit2,
  fix_cta: Edit2,
  fix_image: Link2,
  ask_ai: AlertTriangle,
};

export function IssuesPanel({ issues, onClose, onFixIssue }: IssuesPanelProps) {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h2 className="font-semibold">Issues</h2>
          <div className="flex gap-1">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5">
                {errorCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5">
                {warningCount}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No issues detected</p>
            <p className="text-xs mt-1">Your site looks good!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => {
              const config = severityConfig[issue.severity];
              const SeverityIcon = config.icon;
              const FixIcon = issue.fixAction 
                ? fixActionIcons[issue.fixAction.type] 
                : null;

              return (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start gap-2">
                    <SeverityIcon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {issue.description}
                      </p>
                      {issue.fixAction && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-xs"
                          onClick={() => onFixIssue(issue)}
                        >
                          {FixIcon && <FixIcon className="h-3 w-3 mr-1" />}
                          {issue.fixAction.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Fix issues to improve site quality and conversions
        </p>
      </div>
    </div>
  );
}
