import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Layout, 
  Palette, 
  History, 
  Pencil,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { BuilderState } from '@/hooks/useBuilderState';
import { cn } from '@/lib/utils';

interface BuilderSidebarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  state: BuilderState;
  onNewProject: () => void;
  history: { id: string; name: string; date: string }[];
  onSelectHistory: (id: string) => void;
}

const TEMPLATES = [
  { id: 'restaurant', name: 'Restaurant', description: 'Menu, reservations, location' },
  { id: 'portfolio', name: 'Portfolio', description: 'Projects, about, contact' },
  { id: 'agency', name: 'Agency', description: 'Services, team, case studies' },
  { id: 'saas', name: 'SaaS Landing', description: 'Features, pricing, CTA' },
  { id: 'ecommerce', name: 'E-commerce', description: 'Products, cart, checkout' },
  { id: 'coach', name: 'Coach/Consultant', description: 'Services, testimonials, booking' },
];

function StatusPill({ state }: { state: BuilderState }) {
  const config = {
    idle: { label: 'Ready', color: 'bg-muted text-muted-foreground' },
    collecting_inputs: { label: 'Setting up', color: 'bg-amber-500/20 text-amber-400' },
    generating_plan: { label: 'Planning', color: 'bg-primary/20 text-primary' },
    building: { label: 'Building', color: 'bg-primary/20 text-primary' },
    preview_ready: { label: 'Ready', color: 'bg-green-500/20 text-green-400' },
    editing: { label: 'Editing', color: 'bg-amber-500/20 text-amber-400' },
    exporting: { label: 'Exporting', color: 'bg-blue-500/20 text-blue-400' },
  };

  const { label, color } = config[state];
  const isLoading = state === 'generating_plan' || state === 'building';

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
      color
    )}>
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : state === 'preview_ready' ? (
        <Check className="w-3 h-3" />
      ) : state === 'idle' ? null : (
        <AlertCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

export function BuilderSidebar({
  projectName,
  onProjectNameChange,
  state,
  onNewProject,
  history,
  onSelectHistory,
}: BuilderSidebarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [brandKitOpen, setBrandKitOpen] = useState(false);

  const handleNameSave = () => {
    onProjectNameChange(tempName);
    setIsEditingName(false);
  };

  return (
    <div className="w-[270px] border-r border-border/40 bg-card/30 flex flex-col h-full">
      {/* Project Section */}
      <div className="p-5 border-b border-border/40">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Project</p>
        
        {/* Project Name */}
        <div className="mb-3">
          {isEditingName ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="h-9 text-sm font-medium"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              onBlur={handleNameSave}
            />
          ) : (
            <button 
              onClick={() => {
                setTempName(projectName);
                setIsEditingName(true);
              }}
              className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors w-full text-left group"
            >
              <span className="truncate flex-1">{projectName}</span>
              <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Status */}
        <StatusPill state={state} />
      </div>

      {/* Actions Section */}
      <div className="p-5 border-b border-border/40">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Actions</p>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2.5 h-10 text-sm font-medium"
            onClick={onNewProject}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>

          <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 h-10 text-sm font-medium">
                <Layout className="w-4 h-4" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg">Choose a Template</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 pt-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setTemplatesOpen(false);
                    }}
                    className="p-4 rounded-lg border border-border/60 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={brandKitOpen} onOpenChange={setBrandKitOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2.5 h-10 text-sm font-medium">
                <Palette className="w-4 h-4" />
                Brand Kit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Brand Kit</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">Primary Color</label>
                  <div className="flex gap-2.5">
                    {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                      <button
                        key={color}
                        className="w-9 h-9 rounded-lg border-2 border-transparent hover:border-foreground/30 transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Modern', 'Classic', 'Playful', 'Minimal'].map((font) => (
                      <button
                        key={font}
                        className="px-4 py-2.5 rounded-lg border border-border/60 hover:border-primary hover:bg-primary/5 text-sm font-medium transition-all"
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-5 pb-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Recent Projects
          </p>
        </div>
        <ScrollArea className="flex-1 px-5">
          <div className="space-y-1 pb-5">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-3">No recent projects</p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectHistory(item.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
