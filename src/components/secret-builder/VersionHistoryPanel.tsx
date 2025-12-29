import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { History, RotateCcw, Clock, Loader2 } from 'lucide-react';
import { SiteSpec } from '@/types/site-spec';
import { formatDistanceToNow } from 'date-fns';

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  spec: SiteSpec;
  name: string;
  thumbnail_url?: string;
}

interface VersionHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: VersionSnapshot[];
  currentSpec: SiteSpec | null;
  onRestore: (version: VersionSnapshot) => Promise<void>;
  isRestoring?: boolean;
}

export function VersionHistoryPanel({
  open,
  onOpenChange,
  versions,
  currentSpec,
  onRestore,
  isRestoring = false,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionSnapshot | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleRestoreClick = (version: VersionSnapshot) => {
    setSelectedVersion(version);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (selectedVersion) {
      await onRestore(selectedVersion);
      setConfirmDialogOpen(false);
      setSelectedVersion(null);
      onOpenChange(false);
    }
  };

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View and restore previous versions of your site. Versions are saved automatically after each AI generation.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)] mt-4 -mx-6 px-6">
            {sortedVersions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <History className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium mb-1">No versions yet</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Versions will appear here after you generate or edit your site with AI.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVersions.map((version, index) => {
                  const isLatest = index === 0;
                  const isCurrent = currentSpec && 
                    JSON.stringify(currentSpec) === JSON.stringify(version.spec);

                  return (
                    <div
                      key={version.id}
                      className={`group relative p-3 rounded-lg border transition-colors ${
                        isCurrent 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      {version.thumbnail_url && (
                        <div className="mb-2 rounded-md overflow-hidden border border-border/50">
                          <img
                            src={version.thumbnail_url}
                            alt={version.name}
                            className="w-full h-24 object-cover object-top"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {version.name || `Version ${sortedVersions.length - index}`}
                            </span>
                            {isLatest && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Latest
                              </Badge>
                            )}
                            {isCurrent && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRestoreClick(version)}
                            disabled={isRestoring}
                          >
                            {isRestoring && selectedVersion?.id === version.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                Restore
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current site with the selected version from{' '}
              {selectedVersion && formatDistanceToNow(new Date(selectedVersion.timestamp), { addSuffix: true })}.
              Your current version will be saved automatically before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                'Restore'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}