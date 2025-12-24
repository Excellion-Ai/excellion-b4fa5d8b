import { useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], action: 'Open Search', implemented: true },
  { keys: ['⌘', '/'], action: 'Open Keyboard Shortcuts', implemented: true },
  { keys: ['Escape'], action: 'Close Modal/Dialog', implemented: true },
  { keys: ['⌘', 'N'], action: 'New Project', implemented: false },
  { keys: ['⌘', 'Enter'], action: 'Generate Site', implemented: false },
  { keys: ['⌘', 'S'], action: 'Save Changes', implemented: false },
  { keys: ['⌘', 'E'], action: 'Export Code', implemented: false },
  { keys: ['⌘', 'P'], action: 'Publish Site', implemented: false },
];

export default function ShortcutsSettings() {
  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+/ or Ctrl+/ to toggle shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        // This is already on the shortcuts page, so just show a toast or focus
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Keyboard Shortcuts</h1>
        <p className="text-muted-foreground">Quick actions for faster navigation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Available Shortcuts
          </CardTitle>
          <CardDescription>Use these keyboard shortcuts to work faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SHORTCUTS.map((shortcut, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  shortcut.implemented ? 'border-border' : 'border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                          {key === '⌘' ? (
                            <Command className="w-3 h-3 inline" />
                          ) : (
                            key
                          )}
                        </kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-muted-foreground">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{shortcut.action}</span>
                </div>
                {!shortcut.implemented && (
                  <Badge variant="outline" className="text-xs">
                    Coming soon
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• On Windows/Linux, use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> instead of <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘</kbd></p>
          <p>• Shortcuts work globally unless you're typing in an input field</p>
          <p>• More shortcuts are being added based on user feedback</p>
        </CardContent>
      </Card>
    </div>
  );
}
