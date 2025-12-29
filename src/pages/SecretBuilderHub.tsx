import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  Sparkles, 
  Layout, 
  ShoppingBag, 
  Calendar, 
  Briefcase,
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
  Globe,
  Folder,
  ChevronUp,
  Menu,
  Settings,
  CreditCard,
  Bell,
  Keyboard,
  HelpCircle,
  MessageSquare,
  LogOut,
  User,
  Zap,
  Image,
  Download,
  Link
} from 'lucide-react';
import { AttachmentMenu, AttachmentChips, AttachmentItem } from '@/components/secret-builder/attachments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SearchModal } from '@/components/secret-builder/SearchModal';
import { RenameDialog } from '@/components/secret-builder/RenameDialog';
import { ProjectPreview } from '@/components/secret-builder/ProjectPreview';
import { TEMPLATES } from '@/components/secret-builder/templateSpecs';
import { InterviewStepper } from '@/components/InterviewStepper';
import { useInterviewIntake } from '@/hooks/useInterviewIntake';
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

// Using AttachmentItem from the attachments module instead of local Attachment interface


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

// Templates now imported from templateSpecs.ts

const NAV_ITEMS = [
  { icon: BookOpen, label: 'Resources', action: 'resources' },
] as const;

// localStorage keys
const LS_LAST_PROJECT_ID = 'excellion_last_project_id';
const LS_PENDING_PROMPT = 'excellion_pending_prompt';

export default function SecretBuilderHub() {
  const location = useLocation();
  const locationState = location.state as { 
    initialIdea?: string; 
    autoGenerate?: boolean;
    interviewData?: {
      websiteType: string | null;
      businessName: string;
      serviceMode: string | null;
      serviceArea: string | null;
      primaryGoal: string | null;
      offers: string[];
      colorThemePreset: string | null;
      colorThemeCustom: { primary: string; accent: string; backgroundMode: 'dark' | 'light' } | null;
      colorTheme: { preset: string; primary: string; accent: string; backgroundMode: 'dark' | 'light' } | null;
    };
  } | null;
  
  // Store interviewData from location state (from WebBuilderHome)
  const [interviewDataFromLocation] = useState(locationState?.interviewData || null);
  
  const [idea, setIdea] = useState(locationState?.initialIdea || '');
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<BuilderProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<BuilderProject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectsFolderOpen, setProjectsFolderOpen] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  
  // AI Image Library state
  const [imageLibraryOpen, setImageLibraryOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ name: string; url: string; type: 'image' | 'logo'; createdAt: Date }[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // Interview intake hook
  const interview = useInterviewIntake(idea);
  
  // Theme state for quick toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true;
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const hasAutoGeneratedRef = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

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
    if (pendingPrompt) {
      setIdea(pendingPrompt);
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

  const handleDeleteClick = (project: BuilderProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('builder_projects')
      .delete()
      .eq('id', projectToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      if (localStorage.getItem(LS_LAST_PROJECT_ID) === projectToDelete.id) {
        localStorage.removeItem(LS_LAST_PROJECT_ID);
      }
      toast({ title: 'Project deleted' });
    }
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
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
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to duplicate projects.', variant: 'destructive' });
      return;
    }
    
    const { data, error } = await supabase
      .from('builder_projects')
      .insert({
        user_id: user.id,
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

  // Fetch AI-generated images from storage
  const fetchGeneratedImages = useCallback(async () => {
    setIsLoadingImages(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGeneratedImages([]);
        setIsLoadingImages(false);
        return;
      }

      const allImages: { name: string; url: string; type: 'image' | 'logo'; createdAt: Date }[] = [];

      // Fetch from images folder
      const imagesFolder = `images/${user.id}`;
      const { data: imagesData } = await supabase.storage
        .from('builder-images')
        .list(imagesFolder, { sortBy: { column: 'created_at', order: 'desc' } });

      if (imagesData) {
        for (const file of imagesData) {
          if (file.name && !file.name.startsWith('.')) {
            const { data: urlData } = supabase.storage
              .from('builder-images')
              .getPublicUrl(`${imagesFolder}/${file.name}`);
            
            allImages.push({
              name: file.name,
              url: urlData.publicUrl,
              type: 'image',
              createdAt: new Date(file.created_at || Date.now())
            });
          }
        }
      }

      // Fetch from logos folder
      const logosFolder = `logos/${user.id}`;
      const { data: logosData } = await supabase.storage
        .from('builder-images')
        .list(logosFolder, { sortBy: { column: 'created_at', order: 'desc' } });

      if (logosData) {
        for (const file of logosData) {
          if (file.name && !file.name.startsWith('.')) {
            const { data: urlData } = supabase.storage
              .from('builder-images')
              .getPublicUrl(`${logosFolder}/${file.name}`);
            
            allImages.push({
              name: file.name,
              url: urlData.publicUrl,
              type: 'logo',
              createdAt: new Date(file.created_at || Date.now())
            });
          }
        }
      }

      // Sort by creation date descending
      allImages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setGeneratedImages(allImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  // Fetch images when library opens
  useEffect(() => {
    if (imageLibraryOpen) {
      fetchGeneratedImages();
    }
  }, [imageLibraryOpen, fetchGeneratedImages]);

  const handleCopyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copied to clipboard' });
  };

  const handleDeleteImage = async (imagePath: string, imageType: 'image' | 'logo') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const folder = imageType === 'logo' ? 'logos' : 'images';
      const fullPath = `${folder}/${user.id}/${imagePath}`;
      
      const { error } = await supabase.storage
        .from('builder-images')
        .remove([fullPath]);

      if (error) {
        toast({ title: 'Error', description: 'Failed to delete image', variant: 'destructive' });
      } else {
        setGeneratedImages(prev => prev.filter(img => img.name !== imagePath));
        toast({ title: 'Image deleted' });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleGenerate = useCallback(async (promptOverride?: string) => {
    const ideaToUse = promptOverride || idea;
    if (!ideaToUse.trim() || isGenerating || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setIsGenerating(true);
    
    // Save to localStorage in case of refresh
    localStorage.setItem(LS_PENDING_PROMPT, ideaToUse);

    try {
      // Quick auth check - just verify user exists
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ 
          title: 'Sign in required', 
          description: 'Please sign in to create projects.', 
          variant: 'destructive' 
        });
        navigate('/auth');
        setIsGenerating(false);
        isSubmittingRef.current = false;
        return;
      }
      
      // Interview data can come from location state (from WebBuilderHome) or local interview hook
      const currentInterviewData = interviewDataFromLocation || interview.structuredData;
      
      // Navigate IMMEDIATELY to builder - let builder handle project creation
      // This makes the experience feel instant
      navigate('/secret-builder', { 
        state: { 
          initialIdea: ideaToUse,
          themeId: 'modern',
          interviewData: currentInterviewData,
          attachments: attachments.map(a => a.name),
          createProject: true, // Signal that builder should create the project
        } 
      });
      
      // Clear pending state
      localStorage.removeItem(LS_PENDING_PROMPT);
      
    } catch (error) {
      console.error('Error starting generation:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to start. Please try again.', 
        variant: 'destructive' 
      });
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  }, [idea, isGenerating, attachments, navigate, toast, interviewDataFromLocation, interview.structuredData]);

  // Generate from template with pre-built spec
  const handleGenerateFromTemplate = useCallback(async (template: typeof TEMPLATES[0]) => {
    if (isGenerating || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ 
          title: 'Sign in required', 
          description: 'Please sign in to use templates.', 
          variant: 'destructive' 
        });
        navigate('/auth');
        setIsGenerating(false);
        isSubmittingRef.current = false;
        return;
      }
      
      const { data, error } = await supabase
        .from('builder_projects')
        .insert([{
          user_id: user.id,
          name: template.title,
          idea: template.prompt,
          spec: JSON.parse(JSON.stringify({ 
            siteSpec: template.spec,
            themeId: 'modern', 
          })),
        }])
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem(LS_LAST_PROJECT_ID, data.id);

      toast({ title: 'Template loaded', description: 'Opening builder...' });
      
      navigate('/secret-builder', { 
        state: { 
          projectId: data.id, 
          initialIdea: template.prompt,
          themeId: 'modern',
          templateSpec: template.spec,
        } 
      });
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load template. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  }, [isGenerating, navigate, toast]);

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

  const handleInterviewSubmit = () => {
    setInterviewOpen(false);
    // Use the composed prompt from interview data if main idea is empty
    const promptToUse = idea.trim() || interview.composedPrompt;
    if (promptToUse) {
      setIdea(promptToUse); // Also update the idea state for consistency
      handleGenerate(promptToUse);
    }
  };

  const handleClearPrompt = () => {
    setIdea('');
    setAttachments([]);
    localStorage.removeItem(LS_PENDING_PROMPT);
    textareaRef.current?.focus();
  };

  const handleAddAttachment = (attachment: AttachmentItem) => {
    setAttachments((prev) => [...prev, attachment].slice(0, 10));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
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

  // Settings handlers
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sign out.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

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

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-30 md:hidden bg-card border-b border-border">
        <div className="flex items-center justify-between p-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-card">
              {/* Mobile Sidebar Content */}
              <div className="flex flex-col h-full">
                {/* Workspace Header */}
                <div className="p-4 border-b border-border">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-auto py-2 px-3"
                    onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
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

                {/* Search Button */}
                <div className="px-3 py-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground"
                    onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Search</span>
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Excellion Homepage</span>
                  </Button>
                  
                  {NAV_ITEMS.map((item) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </Button>
                    ))}
                  
                  {/* AI Image Library Button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => { setImageLibraryOpen(true); setMobileMenuOpen(false); }}
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-sm">Image Library</span>
                  </Button>
                  <Collapsible open={projectsFolderOpen} onOpenChange={setProjectsFolderOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        <Folder className="w-4 h-4" />
                        <span className="text-sm flex-1 text-left">Projects</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${projectsFolderOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-2 mt-1">
                      <ScrollArea className="h-48">
                        <div className="space-y-0.5 pl-2">
                          {projects.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2 px-2">No projects yet</p>
                          ) : (
                            projects.slice(0, 5).map((project) => (
                              <Button
                                key={project.id}
                                variant="ghost"
                                className="w-full justify-start gap-2 h-8 text-xs"
                                onClick={() => { handleOpenProject(project.id); setMobileMenuOpen(false); }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                <span className="truncate">{project.name}</span>
                              </Button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
                </nav>

                {/* Bottom CTA */}
                <div className="p-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => { navigate('/pricing#pro'); setMobileMenuOpen(false); }}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <img src={excellionLogo} alt="Excellion" className="h-6 w-6" />
            <span className="text-sm font-medium text-foreground">Excellion</span>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed h-full z-20 border-r border-border bg-card">
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
                <div className="flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  <span className="text-xs">Settings</span>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-popover">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/profile')}>
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/billing')}>
                <CreditCard className="w-4 h-4" />
                <span>Billing & Credits</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/notifications')}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Workspace</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/workspace')}>
                <FolderKanban className="w-4 h-4" />
                <span>Workspace Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/team')}>
                <Users className="w-4 h-4" />
                <span>Team Members</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/domains')}>
                <Globe className="w-4 h-4" />
                <span>Custom Domains</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Preferences</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/appearance')}>
                <Palette className="w-4 h-4" />
                <span>Theme & Appearance</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/shortcuts')}>
                <Keyboard className="w-4 h-4" />
                <span>Keyboard Shortcuts</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Support</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/help')}>
                <HelpCircle className="w-4 h-4" />
                <span>Help & Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/support')}>
                <MessageSquare className="w-4 h-4" />
                <span>Contact Support</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
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

        {/* Navigation - scrollable section */}
        <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
          {/* Back to Landing Page */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => navigate('/')}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Excellion Homepage</span>
          </Button>
          
          {NAV_ITEMS.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                onClick={() => {
                  // Resources action - no external link
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            ))}
          
          {/* AI Image Library Button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => setImageLibraryOpen(true)}
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">Image Library</span>
          </Button>
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
            <CollapsibleContent className="pl-2 mt-1">
              <ScrollArea className="h-64 pr-2">
                <div className="space-y-0.5 pl-2">
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
                              onClick={(e) => handleDeleteClick(project, e as unknown as React.MouseEvent)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
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
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto relative pt-16 md:pt-0">
        {/* Subtle purple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-purple-900/10 pointer-events-none" />
        
        <div className="relative max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-16">
          
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
                <AttachmentChips 
                  attachments={attachments} 
                  onRemove={removeAttachment} 
                />
                
                {/* Input Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <AttachmentMenu
                      onAddAttachment={handleAddAttachment}
                      disabled={isGenerating}
                      attachmentCount={attachments.length}
                    />
                    
                    {/* Build Assist Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setInterviewOpen(true)}
                      disabled={isGenerating}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Build Assist
                    </Button>
                    
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                >
                  {showAllProjects ? 'Show less' : `View all (${projects.length})`}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAllProjects ? 'rotate-180' : ''}`} />
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
                {(showAllProjects ? projects : projects.slice(0, 6)).map((project) => {
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
                                onClick={(e) => handleDeleteClick(project, e as unknown as React.MouseEvent)}
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
            
            {/* View More / Show Less Button */}
            {projects.length > 6 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="gap-2"
                >
                  {showAllProjects ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View {projects.length - 6} more projects
                    </>
                  )}
                </Button>
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
                  onClick={() => handleGenerateFromTemplate(template)}
                  disabled={isGenerating}
                  className="group text-left bg-zinc-900/40 border border-white/10 rounded-xl overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Live Preview using ProjectPreview */}
                  <div className="h-36 bg-gradient-to-br from-muted/50 to-muted/20 p-3 relative overflow-hidden">
                    <ProjectPreview 
                      spec={template.spec} 
                      themeColor={template.spec.theme.primaryColor}
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ArrowRight className="w-4 h-4" />
                        Use Template
                      </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you 100% sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will permanently delete <strong>"{projectToDelete?.name}"</strong> from your projects folder.
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone. All associated data including custom domains, bookmarks, and knowledge base entries will also be deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, delete project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Build Assist Interview Dialog */}
      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Build Assist</DialogTitle>
          </DialogHeader>
          <InterviewStepper
            step={interview.step}
            totalSteps={interview.totalSteps}
            answers={interview.answers}
            canProceed={interview.canProceed}
            canSubmit={interview.canSubmit}
            onUpdateAnswer={interview.updateAnswer}
            onUpdateOffer={interview.updateOffer}
            onNext={interview.nextStep}
            onBack={interview.prevStep}
            onSkip={interview.skipStep}
            onSubmit={handleInterviewSubmit}
            onSwitchToQuickPrompt={() => setInterviewOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* AI Image Library Dialog */}
      <Dialog open={imageLibraryOpen} onOpenChange={setImageLibraryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              AI Image Library
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoadingImages ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : generatedImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No images yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  AI-generated images and logos will appear here. Start creating in the builder!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/50"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Type Badge */}
                    <Badge 
                      className={`absolute top-2 left-2 text-[10px] ${
                        image.type === 'logo' 
                          ? 'bg-violet-500/90 text-white' 
                          : 'bg-blue-500/90 text-white'
                      }`}
                    >
                      {image.type === 'logo' ? 'Logo' : 'Image'}
                    </Badge>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs"
                          onClick={() => handleCopyImageUrl(image.url)}
                        >
                          <Link className="w-3 h-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs"
                          onClick={() => handleDeleteImage(image.name, image.type)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-[10px] text-white/70 mt-1">
                        {image.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
