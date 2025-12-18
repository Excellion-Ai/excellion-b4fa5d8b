import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  Sparkles, 
  Layout, 
  ShoppingBag, 
  Calendar, 
  Briefcase,
  Paperclip,
  Palette,
  Home,
  Search,
  FolderKanban,
  BookOpen,
  ChevronDown,
  Trash2,
  MoreHorizontal,
  Loader2,
  Clock,
  Send,
  Store,
  Users,
  Rocket,
  Command,
  ExternalLink,
  X,
  Copy,
  Pencil,
  Check,
  Globe,
  Folder
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SearchModal } from '@/components/secret-builder/SearchModal';
import { RenameDialog } from '@/components/secret-builder/RenameDialog';
import { ProjectPreview } from '@/components/secret-builder/ProjectPreview';
import excellionLogo from '@/assets/excellion-logo.png';
import studioBackground from '@/assets/studio-background.png';

interface BuilderProject {
  id: string;
  name: string;
  idea: string;
  created_at: string;
  updated_at: string;
  spec?: any;
  published_url?: string | null;
  published_at?: string | null;
}

interface Attachment {
  file: File;
  name: string;
  type: string;
}

const THEME_OPTIONS = [
  { 
    id: 'modern', 
    label: 'Modern', 
    color: 'hsl(220, 70%, 50%)',
    description: 'Clean layouts, balanced spacing, professional'
  },
  { 
    id: 'minimal', 
    label: 'Minimal', 
    color: 'hsl(0, 0%, 40%)',
    description: 'Typography-focused, lots of whitespace'
  },
  { 
    id: 'bold', 
    label: 'Bold', 
    color: 'hsl(350, 80%, 50%)',
    description: 'High contrast, large fonts, attention-grabbing'
  },
  { 
    id: 'luxury', 
    label: 'Luxury', 
    color: 'hsl(38, 45%, 55%)',
    description: 'Elegant, sophisticated, premium feel'
  },
  { 
    id: 'playful', 
    label: 'Playful', 
    color: 'hsl(280, 70%, 60%)',
    description: 'Rounded shapes, bright, fun & energetic'
  },
  { 
    id: 'dark', 
    label: 'Dark', 
    color: 'hsl(0, 0%, 15%)',
    description: 'Dark backgrounds, tech/developer aesthetic'
  },
];

const QUICK_PROMPTS = [
  { 
    label: 'Restaurant with online ordering', 
    icon: Store,
    fullPrompt: 'Build a modern restaurant website with online ordering, menu sections organized by category, hours/location info, and a prominent pickup/delivery CTA. Include a hero with food photography, testimonials, and a newsletter signup.'
  },
  { 
    label: 'Service business lead-gen', 
    icon: Briefcase,
    fullPrompt: 'Build a service business lead-gen site with a compelling hero CTA, services grid with icons, customer reviews/testimonials, FAQ section, and a contact form. Include trust badges and a clear value proposition.'
  },
  { 
    label: 'Booking / appointments', 
    icon: Calendar,
    fullPrompt: 'Build a booking site with a services list, availability CTA button, booking form with date/time selection, confirmation messages, and a pricing section. Include staff profiles and customer reviews.'
  },
  { 
    label: 'Portfolio', 
    icon: Users,
    fullPrompt: 'Build a personal portfolio with a projects grid showing case studies, about section with skills, contact form, and social links. Include a hero with headline and a clean, minimal design.'
  },
  { 
    label: 'Agency site', 
    icon: Rocket,
    fullPrompt: 'Build an agency site with case studies, our process section, team profiles, pricing tiers, and a contact form. Include a compelling hero, client logos, and testimonials.'
  },
];

const TEMPLATES = [
  {
    id: 'saas',
    title: 'SaaS Landing Page',
    tags: ['Marketing', 'Tech'],
    bestFor: 'Software products, apps, digital services',
    icon: Layout,
    prompt: 'A modern SaaS landing page with hero, features grid, pricing tiers, testimonials, and CTA sections',
  },
  {
    id: 'restaurant',
    title: 'Restaurant & Menu',
    tags: ['Food', 'Local'],
    bestFor: 'Restaurants, cafes, food trucks',
    icon: ShoppingBag,
    prompt: 'A modern restaurant website with online ordering, menu display, and reservations',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    tags: ['Creative', 'Personal'],
    bestFor: 'Designers, developers, freelancers',
    icon: Layout,
    prompt: 'A professional portfolio website to showcase my work and attract clients',
  },
  {
    id: 'service',
    title: 'Service Business',
    tags: ['Local', 'Services'],
    bestFor: 'Contractors, consultants, agencies',
    icon: Briefcase,
    prompt: 'A service business website with appointment booking, testimonials, and service listings',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    tags: ['Retail', 'Online'],
    bestFor: 'Online shops, dropshipping, D2C brands',
    icon: ShoppingBag,
    prompt: 'An e-commerce store with product catalog, shopping cart, and checkout flow',
  },
  {
    id: 'blog',
    title: 'Blog / Content',
    tags: ['Content', 'Media'],
    bestFor: 'Writers, publications, thought leaders',
    icon: BookOpen,
    prompt: 'A blog website with articles, categories, and newsletter signup',
  },
];

const NAV_ITEMS = [
  { icon: Home, label: 'Home', action: 'home' },
  { icon: BookOpen, label: 'Resources', action: 'resources' },
] as const;

// localStorage keys
const LS_LAST_PROJECT_ID = 'excellion_last_project_id';
const LS_PENDING_PROMPT = 'excellion_pending_prompt';
const LS_PENDING_THEME = 'excellion_pending_theme';

export default function SecretBuilderHub() {
  const location = useLocation();
  const locationState = location.state as { initialIdea?: string; autoGenerate?: boolean } | null;
  
  const [idea, setIdea] = useState(locationState?.initialIdea || '');
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<BuilderProject | null>(null);
  const [projectsFolderOpen, setProjectsFolderOpen] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const hasAutoGeneratedRef = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Restore pending prompt from localStorage
  useEffect(() => {
    const pendingPrompt = localStorage.getItem(LS_PENDING_PROMPT);
    const pendingTheme = localStorage.getItem(LS_PENDING_THEME);
    if (pendingPrompt) {
      setIdea(pendingPrompt);
    }
    if (pendingTheme) {
      setSelectedTheme(pendingTheme);
    }
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('builder_projects')
        .select('id, name, idea, created_at, updated_at, spec, published_url, published_at')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setProjects(data);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('builder_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      // Clear last project if it was deleted
      if (localStorage.getItem(LS_LAST_PROJECT_ID) === projectId) {
        localStorage.removeItem(LS_LAST_PROJECT_ID);
      }
      toast({ title: 'Project deleted' });
    }
  };

  const handleRenameProject = async (newName: string) => {
    if (!projectToRename) return;

    const { error } = await supabase
      .from('builder_projects')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', projectToRename.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to rename project', variant: 'destructive' });
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectToRename.id ? { ...p, name: newName } : p))
      );
      toast({ title: 'Project renamed' });
    }
    setProjectToRename(null);
  };

  const handleDuplicateProject = async (project: BuilderProject, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data, error } = await supabase
      .from('builder_projects')
      .insert({
        name: `${project.name} (copy)`,
        idea: project.idea,
        spec: project.spec,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to duplicate project', variant: 'destructive' });
    } else if (data) {
      setProjects((prev) => [data, ...prev]);
      toast({ title: 'Project duplicated' });
    }
  };

  const handleGenerate = useCallback(async (promptOverride?: string) => {
    const ideaToUse = promptOverride || idea;
    if (!ideaToUse.trim() || isGenerating || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setIsGenerating(true);
    
    // Save to localStorage in case of refresh
    localStorage.setItem(LS_PENDING_PROMPT, ideaToUse);
    localStorage.setItem(LS_PENDING_THEME, selectedTheme);

    try {
      // Create project in database
      
      // Create project in database
      const projectName = ideaToUse.slice(0, 50) + (ideaToUse.length > 50 ? '...' : '');
      const { data, error } = await supabase
        .from('builder_projects')
        .insert({
          name: projectName,
          idea: ideaToUse,
          spec: { 
            themeId: selectedTheme, 
            attachments: attachments.map(a => a.name) 
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Store as last project
      localStorage.setItem(LS_LAST_PROJECT_ID, data.id);
      
      // Clear pending state
      localStorage.removeItem(LS_PENDING_PROMPT);
      localStorage.removeItem(LS_PENDING_THEME);

      toast({ title: 'Project created', description: 'Opening builder...' });
      
      // Navigate to builder with theme style ID
      navigate('/secret-builder', { 
        state: { 
          projectId: data.id, 
          initialIdea: ideaToUse,
          themeId: selectedTheme
        } 
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to create project. Please try again.', 
        variant: 'destructive' 
      });
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  }, [idea, isGenerating, selectedTheme, attachments, navigate, toast]);

  // Auto-generate when coming from home page with a prompt
  useEffect(() => {
    if (locationState?.autoGenerate && locationState?.initialIdea && !hasAutoGeneratedRef.current && !isGenerating) {
      hasAutoGeneratedRef.current = true;
      // Small delay to ensure component is ready
      setTimeout(() => {
        handleGenerate(locationState.initialIdea);
      }, 300);
    }
  }, [locationState, handleGenerate, isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleOpenProject = (projectId: string) => {
    localStorage.setItem(LS_LAST_PROJECT_ID, projectId);
    navigate('/secret-builder', { state: { projectId } });
  };

  const handleChipClick = (fullPrompt: string) => {
    setIdea(fullPrompt);
    textareaRef.current?.focus();
  };

  const handleClearPrompt = () => {
    setIdea('');
    setAttachments([]);
    localStorage.removeItem(LS_PENDING_PROMPT);
    textareaRef.current?.focus();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        newAttachments.push({
          file,
          name: file.name,
          type: file.type,
        });
      } else {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
      }
    }
    
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const openRenameDialog = (project: BuilderProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToRename(project);
    setRenameDialogOpen(true);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const lastProject = projects[0];
  const selectedThemeOption = THEME_OPTIONS.find((t) => t.id === selectedTheme);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        projects={projects}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        currentName={projectToRename?.name || ''}
        onRename={handleRenameProject}
      />

      {/* Sidebar */}
      <aside className="w-64 flex flex-col fixed h-full z-20 border-r border-border bg-card">
        {/* Workspace Header */}
        <div className="p-4 border-b border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto py-2 px-3"
            onClick={() => navigate('/')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <img src={excellionLogo} alt="Excellion" className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Excellion</p>
                <p className="text-xs text-muted-foreground">Builder</p>
              </div>
            </div>
          </Button>
        </div>

        {/* Settings Dropdown */}
        <div className="px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="text-xs">Settings</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>Workspace Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Button */}
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="w-3 h-3" />K
            </kbd>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2 space-y-1">
          {/* Back to Landing Page */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => navigate('/')}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Landing Page</span>
          </Button>
          
          {NAV_ITEMS.map((item) => {
            const isActive = item.action === 'home';
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full justify-start gap-2 h-9 ${
                  isActive 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                onClick={() => {
                  if (item.action === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (item.action === 'resources') {
                    window.open('https://docs.lovable.dev', '_blank');
                  }
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}

          {/* Projects Folder Collapsible */}
          <Collapsible open={projectsFolderOpen} onOpenChange={setProjectsFolderOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Folder className="w-4 h-4" />
                <span className="text-sm flex-1 text-left">Projects Folder</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${projectsFolderOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-0.5 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 px-2">
                  No projects yet
                </p>
              ) : (
                projects.slice(0, 8).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="group flex items-start gap-2 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2 leading-tight">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {project.published_url ? (
                          <Badge className="text-[10px] px-1 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            Draft
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(project.updated_at)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenProject(project.id)}>
                          <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open
                        </DropdownMenuItem>
                        {project.published_url && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(project.published_url!, '_blank');
                            }}
                          >
                            <Globe className="w-3.5 h-3.5 mr-2" /> View Live Site
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => openRenameDialog(project, e as unknown as React.MouseEvent)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDuplicateProject(project, e as unknown as React.MouseEvent)}>
                          <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => handleDeleteProject(project.id, e as unknown as React.MouseEvent)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* Bottom CTA */}
        <div className="p-3 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/pricing#pro')}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Pro
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto relative">
        {/* Subtle purple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-purple-900/10 pointer-events-none" />
        
        <div className="relative max-w-3xl mx-auto px-6 py-16">
          
          {/* Hero Section */}
          <section className="text-center mb-10">
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-3">
              Let's build your next site
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Describe what you want. Excellion generates a full site you can edit and publish.
            </p>
          </section>

          {/* Input Card */}
          <section className="mb-8">
            <Card className="bg-card border-border shadow-[0_0_30px_rgba(88,28,135,0.15)] hover:shadow-[0_0_40px_rgba(88,28,135,0.2)] transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your website idea..."
                    className="min-h-[100px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0 pr-8 text-base"
                    disabled={isGenerating}
                  />
                  {idea && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={handleClearPrompt}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                    {attachments.map((att, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs max-w-24 truncate">{att.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive/20"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Input Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-muted-foreground hover:text-foreground"
                      onClick={handleAttachClick}
                      disabled={isGenerating}
                    >
                      <Paperclip className="w-4 h-4 mr-1.5" />
                      Attach
                      {attachments.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                          {attachments.length}
                        </Badge>
                      )}
                    </Button>
                    
                    {/* Theme Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-muted-foreground hover:text-foreground"
                          disabled={isGenerating}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-1.5 border border-border"
                            style={{ backgroundColor: selectedThemeOption?.color }}
                          />
                          <Palette className="w-4 h-4 mr-1" />
                          {selectedThemeOption?.label}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {THEME_OPTIONS.map((theme) => (
                          <DropdownMenuItem
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className="flex items-start gap-2 py-2"
                          >
                            <div 
                              className="w-4 h-4 rounded-full border border-border mt-0.5 shrink-0"
                              style={{ backgroundColor: theme.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{theme.label}</span>
                              <p className="text-xs text-muted-foreground">{theme.description}</p>
                            </div>
                            {selectedTheme === theme.id && (
                              <Check className="w-4 h-4 mt-0.5 shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Button 
                    onClick={() => handleGenerate()}
                    disabled={!idea.trim() || isGenerating}
                    className="h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        Generate
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {QUICK_PROMPTS.map((qp) => (
                <Button
                  key={qp.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick(qp.fullPrompt)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  disabled={isGenerating}
                >
                  <qp.icon className="w-3.5 h-3.5 mr-1.5" />
                  {qp.label}
                </Button>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects-section" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Your Projects
              </h2>
              {projects.length > 6 && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all ({projects.length})
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-card/50 border-border animate-pulse">
                    <div className="h-36 bg-muted/30" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted/30 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted/30 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card className="bg-card/30 border-border border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2">No projects yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Describe your website idea above to create your first project.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((project) => {
                  const themeId = project.spec?.themeId || 'modern';
                  const themeOption = THEME_OPTIONS.find(t => t.id === themeId);
                  
                  return (
                    <Card 
                      key={project.id}
                      className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      {/* Preview Thumbnail */}
                      <div className="h-36 bg-gradient-to-br from-muted/50 to-muted/20 p-3 relative overflow-hidden">
                        <ProjectPreview 
                          spec={project.spec?.siteSpec || project.spec} 
                          themeColor={themeOption?.color}
                        />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="secondary" className="gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                          </Button>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {project.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {project.published_url ? (
                                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  <Globe className="w-2.5 h-2.5 mr-0.5" />
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                  Draft
                                </Badge>
                              )}
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(project.updated_at)}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenProject(project.id)}>
                                <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open
                              </DropdownMenuItem>
                              {project.published_url && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(project.published_url!, '_blank');
                                  }}
                                >
                                  <Globe className="w-3.5 h-3.5 mr-2" /> View Live Site
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => openRenameDialog(project, e as unknown as React.MouseEvent)}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDuplicateProject(project, e as unknown as React.MouseEvent)}>
                                <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => handleDeleteProject(project.id, e as unknown as React.MouseEvent)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Templates Section */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Start from a Template
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleGenerate(template.prompt)}
                  className="group text-left bg-zinc-900/40 border border-white/10 rounded-xl overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Skeleton UI Preview */}
                  <div className="h-32 bg-zinc-900 p-3 flex flex-col gap-2">
                    {/* Header bar */}
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-2 bg-zinc-800 rounded" />
                      <div className="flex gap-1.5">
                        <div className="w-8 h-2 bg-zinc-800 rounded" />
                        <div className="w-8 h-2 bg-zinc-800 rounded" />
                      </div>
                    </div>
                    {/* Hero section */}
                    <div className="flex-1 flex gap-3 mt-2">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="w-3/4 h-3 bg-zinc-800 rounded" />
                        <div className="w-1/2 h-2 bg-zinc-800 rounded" />
                        <div className="w-12 h-4 bg-zinc-800 rounded mt-2" />
                      </div>
                      <div className="w-16 h-12 bg-zinc-800 rounded" />
                    </div>
                    {/* Content lines */}
                    <div className="flex gap-2 mt-auto">
                      <div className="flex-1 h-6 bg-zinc-800 rounded" />
                      <div className="flex-1 h-6 bg-zinc-800 rounded" />
                      <div className="flex-1 h-6 bg-zinc-800 rounded" />
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {template.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {template.title}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {template.bestFor}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
