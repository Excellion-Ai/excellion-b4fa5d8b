import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, Plus, Minus, Edit3 } from 'lucide-react';
import { SiteSpec, SiteSection } from '@/types/site-spec';

interface DiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  previousSpec: SiteSpec | null;
  currentSpec: SiteSpec | null;
  onAccept: () => void;
  onReject: () => void;
}

type DiffChange = {
  type: 'added' | 'removed' | 'modified';
  path: string;
  label: string;
  oldValue?: string;
  newValue?: string;
};

function getSpecChanges(oldSpec: SiteSpec | null, newSpec: SiteSpec | null): DiffChange[] {
  const changes: DiffChange[] = [];
  
  if (!oldSpec && newSpec) {
    changes.push({ type: 'added', path: 'site', label: 'New site created', newValue: newSpec.name });
    return changes;
  }
  
  if (!oldSpec || !newSpec) return changes;
  
  // Check name change
  if (oldSpec.name !== newSpec.name) {
    changes.push({
      type: 'modified',
      path: 'name',
      label: 'Site name',
      oldValue: oldSpec.name,
      newValue: newSpec.name,
    });
  }
  
  // Check theme changes
  const themeKeys = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'fontHeading', 'fontBody'] as const;
  for (const key of themeKeys) {
    if (oldSpec.theme[key] !== newSpec.theme[key]) {
      changes.push({
        type: 'modified',
        path: `theme.${key}`,
        label: `Theme ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        oldValue: String(oldSpec.theme[key]),
        newValue: String(newSpec.theme[key]),
      });
    }
  }
  
  // Check pages
  if (oldSpec.pages.length !== newSpec.pages.length) {
    if (newSpec.pages.length > oldSpec.pages.length) {
      const addedPages = newSpec.pages.slice(oldSpec.pages.length);
      addedPages.forEach(page => {
        changes.push({
          type: 'added',
          path: `pages.${page.path}`,
          label: `Page "${page.title}"`,
          newValue: `${page.sections.length} sections`,
        });
      });
    } else {
      const removedPages = oldSpec.pages.slice(newSpec.pages.length);
      removedPages.forEach(page => {
        changes.push({
          type: 'removed',
          path: `pages.${page.path}`,
          label: `Page "${page.title}"`,
          oldValue: `${page.sections.length} sections`,
        });
      });
    }
  }
  
  // Check sections in matching pages
  const minPages = Math.min(oldSpec.pages.length, newSpec.pages.length);
  for (let pageIdx = 0; pageIdx < minPages; pageIdx++) {
    const oldPage = oldSpec.pages[pageIdx];
    const newPage = newSpec.pages[pageIdx];
    
    // Create maps for section comparison
    const oldSections = new Map(oldPage.sections.map(s => [s.id, s]));
    const newSections = new Map(newPage.sections.map(s => [s.id, s]));
    
    // Find added sections
    for (const [id, section] of newSections) {
      if (!oldSections.has(id)) {
        changes.push({
          type: 'added',
          path: `pages.${pageIdx}.sections.${id}`,
          label: `Section "${section.label}" (${section.type})`,
          newValue: `Added to ${newPage.title}`,
        });
      }
    }
    
    // Find removed sections
    for (const [id, section] of oldSections) {
      if (!newSections.has(id)) {
        changes.push({
          type: 'removed',
          path: `pages.${pageIdx}.sections.${id}`,
          label: `Section "${section.label}" (${section.type})`,
          oldValue: `Removed from ${oldPage.title}`,
        });
      }
    }
    
    // Find modified sections
    for (const [id, newSection] of newSections) {
      const oldSection = oldSections.get(id);
      if (oldSection) {
        const oldContent = JSON.stringify(oldSection.content);
        const newContent = JSON.stringify(newSection.content);
        if (oldContent !== newContent) {
          changes.push({
            type: 'modified',
            path: `pages.${pageIdx}.sections.${id}.content`,
            label: `Section "${newSection.label}" content`,
            oldValue: 'Previous content',
            newValue: 'Updated content',
          });
        }
      }
    }
  }
  
  // Check navigation
  if (JSON.stringify(oldSpec.navigation) !== JSON.stringify(newSpec.navigation)) {
    changes.push({
      type: 'modified',
      path: 'navigation',
      label: 'Navigation menu',
      oldValue: `${oldSpec.navigation.length} items`,
      newValue: `${newSpec.navigation.length} items`,
    });
  }
  
  return changes;
}

export function DiffViewer({ isOpen, onClose, previousSpec, currentSpec, onAccept, onReject }: DiffViewerProps) {
  const changes = getSpecChanges(previousSpec, currentSpec);
  
  const addedCount = changes.filter(c => c.type === 'added').length;
  const removedCount = changes.filter(c => c.type === 'removed').length;
  const modifiedCount = changes.filter(c => c.type === 'modified').length;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Review Changes
          </DialogTitle>
          <DialogDescription className="flex items-center gap-3">
            <span>Review the changes before applying them</span>
            <div className="flex items-center gap-2">
              {addedCount > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Plus className="h-3 w-3 mr-1" />
                  {addedCount} added
                </Badge>
              )}
              {removedCount > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  <Minus className="h-3 w-3 mr-1" />
                  {removedCount} removed
                </Badge>
              )}
              {modifiedCount > 0 && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Edit3 className="h-3 w-3 mr-1" />
                  {modifiedCount} modified
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh]">
          {changes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No changes detected
            </div>
          ) : (
            <div className="space-y-2">
              {changes.map((change, index) => (
                <div
                  key={`${change.path}-${index}`}
                  className={`p-3 rounded-lg border ${
                    change.type === 'added'
                      ? 'bg-green-500/5 border-green-500/20'
                      : change.type === 'removed'
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-yellow-500/5 border-yellow-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      change.type === 'added'
                        ? 'text-green-600'
                        : change.type === 'removed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}>
                      {change.type === 'added' && <Plus className="h-4 w-4" />}
                      {change.type === 'removed' && <Minus className="h-4 w-4" />}
                      {change.type === 'modified' && <Edit3 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{change.label}</p>
                      {change.type === 'modified' && change.oldValue && change.newValue && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="truncate max-w-[150px] bg-muted px-1.5 py-0.5 rounded">{change.oldValue}</span>
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[150px] bg-primary/10 px-1.5 py-0.5 rounded text-primary">{change.newValue}</span>
                        </div>
                      )}
                      {change.type === 'added' && change.newValue && (
                        <p className="text-xs text-muted-foreground mt-1">{change.newValue}</p>
                      )}
                      {change.type === 'removed' && change.oldValue && (
                        <p className="text-xs text-muted-foreground mt-1 line-through">{change.oldValue}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReject} className="gap-2">
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button onClick={onAccept} className="gap-2">
            <Check className="h-4 w-4" />
            Accept Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
