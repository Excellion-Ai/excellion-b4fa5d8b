import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FolderKanban, ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  updated_at: string;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}

export function SearchModal({ open, onOpenChange, projects }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredProjects.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredProjects[selectedIndex]) {
        e.preventDefault();
        navigate('/secret-builder', { state: { projectId: filteredProjects[selectedIndex].id } });
        onOpenChange(false);
      }
    },
    [filteredProjects, selectedIndex, navigate, onOpenChange]
  );

  const handleSelect = (projectId: string) => {
    navigate('/secret-builder', { state: { projectId } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects..."
            className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
            autoFocus
          />
        </div>
        
        <div className="max-h-72 overflow-y-auto py-2">
          {filteredProjects.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {query ? 'No projects found' : 'No projects yet'}
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate text-sm">{project.name}</span>
                {index === selectedIndex && (
                  <ArrowRight className="w-4 h-4 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
        
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↵</kbd>
              to open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
