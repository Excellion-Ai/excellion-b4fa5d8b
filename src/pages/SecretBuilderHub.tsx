import { useState, useEffect, useRef } from 'react';
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
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import excellionLogo from '@/assets/excellion-logo.png';

interface BuilderProject {
  id: string;
  name: string;
  idea: string;
  created_at: string;
  updated_at: string;
}

const QUICK_PROMPTS = [
  { label: 'Restaurant with online ordering', icon: Store },
  { label: 'Service business lead-gen', icon: Briefcase },
  { label: 'Booking / appointments', icon: Calendar },
  { label: 'Portfolio', icon: Users },
  { label: 'Agency site', icon: Rocket },
];

const TEMPLATES = [
  {
    id: 'saas',
    title: 'SaaS Landing Page',
    description: 'Modern product landing with pricing & features',
    tags: ['Marketing', 'Tech'],
    bestFor: 'Software products, apps, digital services',
    icon: Layout,
    prompt: 'A modern SaaS landing page with hero, features grid, pricing tiers, testimonials, and CTA sections',
  },
  {
    id: 'restaurant',
    title: 'Restaurant & Menu',
    description: 'Online ordering, menu display, reservations',
    tags: ['Food', 'Local'],
    bestFor: 'Restaurants, cafes, food trucks',
    icon: ShoppingBag,
    prompt: 'A modern restaurant website with online ordering, menu display, and reservations',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase work with case studies & contact',
    tags: ['Creative', 'Personal'],
    bestFor: 'Designers, developers, freelancers',
    icon: Layout,
    prompt: 'A professional portfolio website to showcase my work and attract clients',
  },
  {
    id: 'service',
    title: 'Service Business',
    description: 'Lead generation with booking & testimonials',
    tags: ['Local', 'Services'],
    bestFor: 'Contractors, consultants, agencies',
    icon: Briefcase,
    prompt: 'A service business website with appointment booking, testimonials, and service listings',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    description: 'Product catalog, cart, checkout flow',
    tags: ['Retail', 'Online'],
    bestFor: 'Online shops, dropshipping, D2C brands',
    icon: ShoppingBag,
    prompt: 'An e-commerce store with product catalog, shopping cart, and checkout flow',
  },
  {
    id: 'blog',
    title: 'Blog / Content',
    description: 'Articles, categories, newsletter signup',
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

export default function SecretBuilderHub() {
  const [idea, setIdea] = useState('');
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      toast({ title: 'Project deleted' });
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('builder_projects')
        .select('id, name, idea, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setProjects(data);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const handleSubmit = (prompt?: string) => {
    const ideaToUse = prompt || idea;
    if (!ideaToUse.trim() || isGenerating) return;
    
    setIsGenerating(true);
    navigate('/secret-builder', { state: { initialIdea: ideaToUse } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate('/secret-builder', { state: { projectId } });
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

  return (
    <div className="min-h-screen flex bg-background">
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

        {/* Search */}
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground"
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
              projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="group flex items-start gap-2 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate leading-tight">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimeAgo(project.updated_at)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenProject(project.id)}>
                        <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open
                      </DropdownMenuItem>
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
                <Textarea
                  ref={textareaRef}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your website idea..."
                  className="min-h-[100px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0 text-base"
                  disabled={isGenerating}
                />
                
                {/* Input Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                      <Paperclip className="w-4 h-4 mr-1.5" />
                      Attach
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                      <Palette className="w-4 h-4 mr-1.5" />
                      Theme
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => handleSubmit()}
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
                  onClick={() => setIdea(qp.label)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
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
              <Card 
                className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => handleOpenProject(lastProject.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lastProject.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(lastProject.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Open
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
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
                  onClick={() => handleSubmit(template.prompt)}
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
