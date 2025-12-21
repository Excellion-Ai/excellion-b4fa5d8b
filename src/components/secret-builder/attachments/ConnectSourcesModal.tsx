import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Cloud, FolderGit2 } from 'lucide-react';

interface ConnectSourcesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SOURCES = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: Cloud,
    description: 'Import docs, images, and files',
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: Database,
    description: 'Sync pages and databases',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: FolderGit2,
    description: 'Connect repositories',
    connected: false,
  },
];

export function ConnectSourcesModal({ open, onOpenChange }: ConnectSourcesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Database className="w-5 h-5 text-primary" />
            Connect Sources
          </DialogTitle>
          <DialogDescription>
            Connect external data sources for enhanced content generation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          {SOURCES.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <source.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Coming soon
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
