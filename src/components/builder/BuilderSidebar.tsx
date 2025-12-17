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
  ChevronRight,
  Check,
  Circle,
  AlertCircle,
  Loader2,
  Pencil
} from 'lucide-react';
import { BuilderStep } from '@/hooks/useBuilderState';
import { cn } from '@/lib/utils';

interface BuilderSidebarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  steps: BuilderStep[];
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

function StepIcon({ status }: { status: BuilderStep['status'] }) {
  switch (status) {
    case 'complete':
      return <Check className="w-3.5 h-3.5 text-primary" />;
    case 'active':
      return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
    case 'error':
      return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />;
  }
}

export function BuilderSidebar({
  projectName,
  onProjectNameChange,
  steps,
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
    <div className="w-64 border-r border-border/50 bg-card/50 flex flex-col h-full">
      {/* Project Name */}
      <div className="p-4 border-b border-border/50">
        {isEditingName ? (
          <div className="flex gap-2">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              onBlur={handleNameSave}
            />
          </div>
        ) : (
          <button 
            onClick={() => {
              setTempName(projectName);
              setIsEditingName(true);
            }}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors w-full text-left group"
          >
            <span className="truncate flex-1">{projectName}</span>
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Steps */}
      <div className="p-4 border-b border-border/50">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Build Steps</p>
        <div className="space-y-1">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                step.status === 'active' && "bg-primary/10 text-primary",
                step.status === 'complete' && "text-muted-foreground",
                step.status === 'error' && "text-destructive",
                step.status === 'pending' && "text-muted-foreground/60"
              )}
            >
              <StepIcon status={step.status} />
              <span className="flex-1">{step.label}</span>
              {step.status === 'active' && (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 border-b border-border/50">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 h-9"
          onClick={onNewProject}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>

        <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9">
              <Layout className="w-4 h-4" />
              Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 pt-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setTemplatesOpen(false);
                    // Would trigger template selection
                  }}
                  className="p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={brandKitOpen} onOpenChange={setBrandKitOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9">
              <Palette className="w-4 h-4" />
              Brand Kit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Brand Kit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Primary Color</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground/20 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Font Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Modern', 'Classic', 'Playful', 'Minimal'].map((font) => (
                    <button
                      key={font}
                      className="px-3 py-2 rounded-md border border-border hover:border-primary text-sm transition-colors"
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

      {/* History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 pb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="w-3 h-3" />
            Recent Projects
          </p>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-2">No recent projects</p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectHistory(item.id)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
