import { useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'editing' | 'navigation' | 'general' | 'preview';
}

const shortcuts: ShortcutItem[] = [
  // Editing
  { keys: ['Ctrl', 'Z'], description: 'Undo last change', category: 'editing' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last change', category: 'editing' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)', category: 'editing' },
  { keys: ['Ctrl', 'S'], description: 'Save project', category: 'editing' },
  { keys: ['Ctrl', 'E'], description: 'Toggle Visual Edit mode', category: 'editing' },
  
  // Navigation
  { keys: ['Ctrl', 'P'], description: 'Publish site', category: 'navigation' },
  { keys: ['Ctrl', 'H'], description: 'Show version history', category: 'navigation' },
  
  // Preview
  { keys: ['Ctrl', '1'], description: 'Desktop preview', category: 'preview' },
  { keys: ['Ctrl', '2'], description: 'Tablet preview', category: 'preview' },
  { keys: ['Ctrl', '3'], description: 'Mobile preview', category: 'preview' },
  
  // General
  { keys: ['?'], description: 'Show this shortcuts panel', category: 'general' },
  { keys: ['Esc'], description: 'Close dialogs / Cancel', category: 'general' },
  { keys: ['Enter'], description: 'Send message (in chat)', category: 'general' },
  { keys: ['Shift', 'Enter'], description: 'New line (in chat)', category: 'general' },
];

const categoryLabels: Record<string, string> = {
  editing: 'Editing',
  navigation: 'Navigation',
  preview: 'Preview',
  general: 'General',
};

const categoryOrder = ['editing', 'navigation', 'preview', 'general'];

function KeyBadge({ keyName }: { keyName: string }) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
  const displayKey = isMac && keyName === 'Ctrl' ? '⌘' : keyName;
  
  return (
    <kbd className={cn(
      "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5",
      "bg-muted border border-border rounded text-xs font-mono font-medium",
      "shadow-sm"
    )}>
      {displayKey}
    </kbd>
  );
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutItem }) {
  return (
    <div className="flex items-center justify-between py-2 px-1 hover:bg-muted/30 rounded transition-colors">
      <span className="text-sm text-foreground">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <span key={index} className="flex items-center gap-1">
            <KeyBadge keyName={key} />
            {index < shortcut.keys.length - 1 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShortcutsPanel({ isOpen, onClose }: ShortcutsPanelProps) {
  const groupedShortcuts = categoryOrder.reduce((acc, category) => {
    acc[category] = shortcuts.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
          {categoryOrder.map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-0.5">
                {groupedShortcuts[category].map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex-shrink-0 pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Press <KeyBadge keyName="?" /> anytime to show this panel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onSave,
  onPublish,
  onToggleEditMode,
  onShowShortcuts,
  onShowHistory,
  onSetPreviewMode,
  enabled = true,
}: {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  onToggleEditMode?: () => void;
  onShowShortcuts?: () => void;
  onShowHistory?: () => void;
  onSetPreviewMode?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || 
                             target.tagName === 'TEXTAREA' || 
                             target.isContentEditable;

      // ? key to show shortcuts (but not when typing)
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        onShowShortcuts?.();
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              onRedo?.();
            } else {
              e.preventDefault();
              onUndo?.();
            }
            break;
          case 'y':
            e.preventDefault();
            onRedo?.();
            break;
          case 's':
            e.preventDefault();
            onSave?.();
            break;
          case 'p':
            e.preventDefault();
            onPublish?.();
            break;
          case 'e':
            e.preventDefault();
            onToggleEditMode?.();
            break;
          case 'h':
            e.preventDefault();
            onShowHistory?.();
            break;
          case '1':
            e.preventDefault();
            onSetPreviewMode?.('desktop');
            break;
          case '2':
            e.preventDefault();
            onSetPreviewMode?.('tablet');
            break;
          case '3':
            e.preventDefault();
            onSetPreviewMode?.('mobile');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onUndo, onRedo, onSave, onPublish, onToggleEditMode, onShowShortcuts, onShowHistory, onSetPreviewMode]);
}
