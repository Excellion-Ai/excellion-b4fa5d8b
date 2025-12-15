import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SearchModal } from '@/components/secret-builder/SearchModal';
import { RenameDialog } from '@/components/secret-builder/RenameDialog';
import excellionLogo from '@/assets/excellion-logo.png';

interface BuilderProject {
  id: string;
  name: string;
  idea: string;
  created_at: string;
  updated_at: string;
  spec?: any;
}

interface Attachment {
  file: File;
  name: string;
  type: string;
}

const THEME_OPTIONS = [
  { id: 'modern', label: 'Modern', color: 'hsl(220, 70%, 50%)' },
  { id: 'minimal', label: 'Minimal', color: 'hsl(0, 0%, 60%)' },
  { id: 'bold', label: 'Bold', color: 'hsl(350, 80%, 50%)' },
  { id: 'luxury', label: 'Luxury', color: 'hsl(38, 45%, 55%)' },
  { id: 'playful', label: 'Playful', color: 'hsl(280, 70%, 60%)' },
  { id: 'dark', label: 'Dark', color: 'hsl(0, 0%, 15%)' },
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
  { icon: Home, label: 'Home', active: true },
  { icon: FolderKanban, label: 'Projects', active: false },
  { icon: BookOpen, label: 'Resources', active: false },
];

// localStorage keys
const LS_LAST_PROJECT_ID = 'excellion_last_project_id';
const LS_PENDING_PROMPT = 'excellion_pending_prompt';
const LS_PENDING_THEME = 'excellion_pending_theme';

export default function SecretBuilderHub() {
  const [idea, setIdea] = useState('');
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<BuilderProject | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
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
        .select('id, name, idea, created_at, updated_at, spec')
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
      const projectName = ideaToUse.slice(0, 50) + (ideaToUse.length > 50 ? '...' : '');
      const { data, error } = await supabase
        .from('builder_projects')
        .insert({
          name: projectName,
          idea: ideaToUse,
          spec: { theme: selectedTheme, attachments: attachments.map(a => a.name) },
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
      
      // Navigate to builder
      navigate('/secret-builder', { 
        state: { 
          projectId: data.id, 
          initialIdea: ideaToUse,
          theme: selectedTheme 
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <img src={excellionLogo} alt="Excellion" className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Excellion</p>
                    <p className="text-xs text-muted-foreground">Builder</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full justify-start gap-2 h-9 ${
                item.active 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Projects Section */}
        <div className="flex-1 overflow-hidden flex flex-col px-3 py-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
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
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                        Draft
                      </Badge>
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
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-3 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Pro
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-16">
          
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
            <Card className="bg-card border-border">
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
                      <DropdownMenuContent align="start">
                        {THEME_OPTIONS.map((theme) => (
                          <DropdownMenuItem
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className="flex items-center gap-2"
                          >
                            <div 
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: theme.color }}
                            />
                            <span>{theme.label}</span>
                            {selectedTheme === theme.id && (
                              <Check className="w-4 h-4 ml-auto" />
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

          {/* Continue Section */}
          <section className="mb-10">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Continue
            </h2>
            
            {isLoading ? (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : lastProject ? (
              <Card className="bg-card border-border hover:border-primary/30 transition-colors group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => handleOpenProject(lastProject.id)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <FolderKanban className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{lastProject.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">Draft</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(lastProject.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenProject(lastProject.id)}
                      >
                        Open
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => openRenameDialog(lastProject, e as unknown as React.MouseEvent)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDuplicateProject(lastProject, e as unknown as React.MouseEvent)}>
                            <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 border-border border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No projects yet — generate your first build above.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Templates Section */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Start from a Template
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className="bg-card border-border hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleGenerate(template.prompt)}
                >
                  <CardContent className="p-0">
                    {/* Preview Placeholder */}
                    <div className="h-28 bg-gradient-to-br from-secondary to-muted rounded-t-lg relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-3 left-3 right-3 h-2 bg-foreground/10 rounded" />
                        <div className="absolute top-7 left-3 w-16 h-8 bg-foreground/10 rounded" />
                        <div className="absolute top-7 right-3 w-12 h-4 bg-foreground/10 rounded" />
                        <div className="absolute bottom-3 left-3 right-3 h-6 bg-foreground/10 rounded" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {template.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-medium text-foreground mb-1">
                        {template.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {template.bestFor}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
