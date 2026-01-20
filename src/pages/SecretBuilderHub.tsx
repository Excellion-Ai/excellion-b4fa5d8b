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
  Headphones,
  EyeOff,
  BarChart3,
  Check
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
import { VoiceBotPlaceholder } from '@/components/VoiceBotPlaceholder';
import { useInterviewIntake } from '@/hooks/useInterviewIntake';
import excellionLogo from '@/assets/excellion-logo.png';
import studioBackground from '@/assets/studio-background.png';
import { CourseCardPreview } from '@/components/secret-builder/CourseCardPreview';

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

interface CourseItem {
  id: string;
  title: string;
  subdomain: string | null;
  status: string | null;
  thumbnail_url: string | null;
  price_cents: number | null;
  currency: string | null;
  total_students: number | null;
  created_at: string;
  updated_at: string;
  published_url: string | null;
  builder_project_id: string | null;
  modules: any;
  difficulty: string | null;
  duration_weeks: number | null;
  deleted_at: string | null;
}

// Format price helper
const formatPrice = (cents: number | null, currency: string | null) => {
  if (!cents || cents === 0) return 'Free';
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  return `${symbols[currency || 'USD'] || '$'}${(cents / 100).toFixed(0)}`;
};

// Using AttachmentItem from the attachments module instead of local Attachment interface


const QUICK_PROMPTS = [
  { 
    label: 'Beginner coding bootcamp', 
    icon: Briefcase,
    fullPrompt: 'Build a beginner-friendly coding bootcamp course covering HTML, CSS, and JavaScript fundamentals. Include hands-on projects, quizzes, and a final capstone project. Target complete beginners with no prior experience.'
  },
  { 
    label: 'Fitness coaching program', 
    icon: Users,
    fullPrompt: 'Build a comprehensive fitness coaching program covering workout routines, nutrition basics, mindset, and habit building. Include video demonstrations, weekly workout plans, and progress tracking assignments.'
  },
  { 
    label: 'Online cooking class', 
    icon: Store,
    fullPrompt: 'Build an online cooking class covering essential techniques, knife skills, and 20 signature recipes. Include step-by-step video lessons, ingredient lists, and cooking assignments for each module.'
  },
  { 
    label: 'Language learning course', 
    icon: BookOpen,
    fullPrompt: 'Build a language learning course for beginners covering vocabulary, grammar, pronunciation, and conversation skills. Include audio lessons, interactive quizzes, and speaking practice exercises.'
  },
  { 
    label: 'Business coaching program', 
    icon: Rocket,
    fullPrompt: 'Build a business coaching program covering business planning, marketing strategy, sales techniques, and financial management. Include worksheets, case studies, and action-oriented assignments.'
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
  const locationState = location.state as { initialIdea?: string; autoGenerate?: boolean } | null;
  
  const [idea, setIdea] = useState(locationState?.initialIdea || '');
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
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
  const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);
  const [courseDeleteDialogOpen, setCourseDeleteDialogOpen] = useState(false);
  const [isUnpublishingCourse, setIsUnpublishingCourse] = useState<string | null>(null);
  const [courseDeleteConfirmText, setCourseDeleteConfirmText] = useState('');
  const [trashedCourses, setTrashedCourses] = useState<CourseItem[]>([]);
  const [trashFolderOpen, setTrashFolderOpen] = useState(false);
  const [courseToRestore, setCourseToRestore] = useState<CourseItem | null>(null);
  const [courseToPermanentlyDelete, setCourseToPermanentlyDelete] = useState<CourseItem | null>(null);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  
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

  // Fetch projects and courses
  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch builder projects
      const { data: projectData, error: projectError } = await supabase
        .from('builder_projects')
        .select('id, name, idea, created_at, updated_at, spec, published_url, published_at')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (!projectError && projectData) {
        setProjects(projectData);
      }

      // Fetch active courses (not deleted)
      if (user) {
        const { data: activeCourseData, error: activeError } = await supabase
          .from('courses')
          .select('id, title, subdomain, status, thumbnail_url, price_cents, currency, total_students, created_at, updated_at, published_url, builder_project_id, modules, difficulty, duration_weeks, deleted_at')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(50);

        if (!activeError && activeCourseData) {
          setCourses(activeCourseData);
        }

        // Fetch trashed courses (soft-deleted)
        const { data: trashedData, error: trashedError } = await supabase
          .from('courses')
          .select('id, title, subdomain, status, thumbnail_url, price_cents, currency, total_students, created_at, updated_at, published_url, builder_project_id, modules, difficulty, duration_weeks, deleted_at')
          .eq('user_id', user.id)
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false })
          .limit(50);

        if (!trashedError && trashedData) {
          setTrashedCourses(trashedData);
        }
      }

      setIsLoading(false);
    };

    fetchData();
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

  const handleUnpublishCourse = async (course: CourseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUnpublishingCourse(course.id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (course.builder_project_id) {
        const { error: fnError } = await supabase.functions.invoke('unpublish-site', {
          body: { projectId: course.builder_project_id },
        });
        if (fnError) throw fnError;
      }
      
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: 'draft', 
          published_url: null, 
          published_at: null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', course.id);
      
      if (error) throw error;
      
      setCourses((prev) =>
        prev.map((c) => c.id === course.id ? { ...c, status: 'draft', published_url: null } : c)
      );
      toast({ title: 'Course unpublished' });
    } catch (error) {
      console.error('Unpublish error:', error);
      toast({ title: 'Error', description: 'Failed to unpublish course', variant: 'destructive' });
    } finally {
      setIsUnpublishingCourse(null);
    }
  };

  const handleDeleteCourseClick = (course: CourseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setCourseDeleteConfirmText('');
    setCourseDeleteDialogOpen(true);
  };

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Soft-delete: set deleted_at timestamp instead of actually deleting
      const { error } = await supabase
        .from('courses')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'draft', // Also unpublish when moving to trash
          published_url: null,
          published_at: null
        })
        .eq('id', courseToDelete.id);

      if (error) throw error;
      
      // Move from active courses to trash
      const deletedCourse = { ...courseToDelete, deleted_at: new Date().toISOString(), status: 'draft', published_url: null };
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setTrashedCourses((prev) => [deletedCourse, ...prev]);
      toast({ 
        title: 'Course moved to trash', 
        description: 'You can restore it within 30 days.' 
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Error', description: 'Failed to move course to trash', variant: 'destructive' });
    }
    
    setIsDeleting(false);
    setCourseDeleteDialogOpen(false);
    setCourseToDelete(null);
    setCourseDeleteConfirmText('');
  };

  // Restore course from trash
  const handleRestoreCourse = async (course: CourseItem) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ deleted_at: null })
        .eq('id', course.id);

      if (error) throw error;
      
      // Move from trash back to active courses
      const restoredCourse = { ...course, deleted_at: null };
      setTrashedCourses((prev) => prev.filter((c) => c.id !== course.id));
      setCourses((prev) => [restoredCourse, ...prev]);
      toast({ title: 'Course restored!' });
    } catch (error) {
      console.error('Restore error:', error);
      toast({ title: 'Error', description: 'Failed to restore course', variant: 'destructive' });
    }
  };

  // Permanently delete from trash
  const handlePermanentDeleteClick = (course: CourseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourseToPermanentlyDelete(course);
    setPermanentDeleteConfirmText('');
    setPermanentDeleteDialogOpen(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!courseToPermanentlyDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Permanently delete the course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToPermanentlyDelete.id);

      if (error) throw error;
      
      // Also delete associated builder project if exists
      if (courseToPermanentlyDelete.builder_project_id) {
        await supabase
          .from('builder_projects')
          .delete()
          .eq('id', courseToPermanentlyDelete.builder_project_id);
      }
      
      setTrashedCourses((prev) => prev.filter((c) => c.id !== courseToPermanentlyDelete.id));
      toast({ title: 'Course permanently deleted' });
    } catch (error) {
      console.error('Permanent delete error:', error);
      toast({ title: 'Error', description: 'Failed to permanently delete course', variant: 'destructive' });
    }
    
    setIsDeleting(false);
    setPermanentDeleteDialogOpen(false);
    setCourseToPermanentlyDelete(null);
    setPermanentDeleteConfirmText('');
  };

  // Helper to calculate days until permanent deletion
  const getDaysUntilPermanentDelete = (deletedAt: string | null) => {
    if (!deletedAt) return 30;
    const deleted = new Date(deletedAt);
    const now = new Date();
    const diffMs = now.getTime() - deleted.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    return Math.max(0, 30 - diffDays);
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

  // Handle Build Assist interview submission
  const handleInterviewSubmit = useCallback(() => {
    if (interview.canSubmit && interview.composedPrompt) {
      setInterviewOpen(false);
      handleGenerate(interview.composedPrompt);
    }
  }, [interview.canSubmit, interview.composedPrompt]);

  const handleGenerate = useCallback(async (promptOverride?: string) => {
    const ideaToUse = promptOverride || idea;
    if (!ideaToUse.trim() || isGenerating || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setIsGenerating(true);
    
    // Save to localStorage in case of refresh
    localStorage.setItem(LS_PENDING_PROMPT, ideaToUse);

    try {
      // Get current user - require login
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
      
      // Create project in database with unique name (add timestamp + random suffix)
      const baseName = ideaToUse.slice(0, 40) + (ideaToUse.length > 40 ? '...' : '');
      const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const projectName = `${baseName} (${uniqueSuffix})`;
      const { data, error } = await supabase
        .from('builder_projects')
        .insert({
          user_id: user.id,
          name: projectName,
          idea: ideaToUse,
          spec: { 
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

      toast({ title: 'Project created', description: 'Opening builder...' });
      
      // Navigate to builder with persistent URL
      navigate(`/studio/${data.id}`, { 
        state: { 
          projectId: data.id, 
          initialIdea: ideaToUse,
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
  }, [idea, isGenerating, attachments, navigate, toast]);

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
      
      // Add unique suffix to template name to avoid duplicates
      const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const projectName = `${template.title} (${uniqueSuffix})`;
      const { data, error } = await supabase
        .from('builder_projects')
        .insert([{
          user_id: user.id,
          name: projectName,
          idea: template.prompt,
          spec: JSON.parse(JSON.stringify({ 
            siteSpec: template.spec,
          })),
        }])
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem(LS_LAST_PROJECT_ID, data.id);

      toast({ title: 'Template loaded', description: 'Opening builder...' });
      
      navigate(`/studio/${data.id}`, { 
        state: { 
          projectId: data.id, 
          initialIdea: template.prompt,
          templateSpec: template.spec, // Pass spec directly to builder
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
    navigate(`/studio/${projectId}`);
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

                  {/* Expert Support */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}
                  >
                    <Headphones className="w-4 h-4" />
                    <span className="text-sm">Expert Support</span>
                  </Button>

                  {/* Analytics */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => { navigate('/dashboard/analytics'); setMobileMenuOpen(false); }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Analytics</span>
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

                  {/* Projects List */}
                  <Collapsible open={projectsFolderOpen} onOpenChange={setProjectsFolderOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                                        <Folder className="w-4 h-4" />
                                        <span className="text-sm flex-1 text-left">Courses</span>
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
              <DropdownMenuLabel className="text-xs text-muted-foreground">Studio</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings/knowledge')}>
                <BookOpen className="w-4 h-4" />
                <span>Knowledge Base</span>
              </DropdownMenuItem>
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
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/contact')}>
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

          {/* Expert Support */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => navigate('/contact')}
          >
            <Headphones className="w-4 h-4" />
            <span className="text-sm">Expert Support</span>
          </Button>

          {/* Analytics */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Analytics</span>
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

          {/* Projects Folder Collapsible */}
          <Collapsible open={projectsFolderOpen} onOpenChange={setProjectsFolderOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                        <Folder className="w-4 h-4" />
                        <span className="text-sm flex-1 text-left">Courses Folder</span>
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
                  ) : courses.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 px-2">
                      No courses yet
                    </p>
                  ) : (
                    courses.slice(0, 8).map((course) => (
                      <div
                        key={course.id}
                        onClick={() => navigate('/secret-builder', { state: { projectId: course.builder_project_id || course.id, courseId: course.id, courseMode: true } })}
                        className="group flex items-start gap-2 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-clamp-2 leading-tight">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {course.status === 'published' ? (
                              <Badge className="text-[10px] px-1 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                Draft
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimeAgo(course.updated_at)}
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
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/secret-builder', { state: { projectId: course.builder_project_id || course.id, courseId: course.id, courseMode: true } });
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Course
                            </DropdownMenuItem>
                            {course.published_url && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(course.published_url || '');
                                  toast({ title: 'Link copied!' });
                                }}
                              >
                                <Copy className="w-3.5 h-3.5 mr-2" /> Copy Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {course.published_url && (
                              <DropdownMenuItem 
                                onClick={(e) => handleUnpublishCourse(course, e)}
                                disabled={isUnpublishingCourse === course.id}
                              >
                                {isUnpublishingCourse === course.id ? (
                                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 mr-2" />
                                )}
                                Unpublish Course
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteCourseClick(course, e)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Move to Trash
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

          {/* Trash Folder Collapsible */}
          <Collapsible open={trashFolderOpen} onOpenChange={setTrashFolderOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm flex-1 text-left">Trash</span>
                {trashedCourses.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mr-1">
                    {trashedCourses.length}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${trashFolderOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-2 mt-1">
              <ScrollArea className="h-48 pr-2">
                <div className="space-y-0.5 pl-2">
                  {trashedCourses.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 px-2">
                      Trash is empty
                    </p>
                  ) : (
                    trashedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="group flex items-start gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-tight">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-destructive">
                              {getDaysUntilPermanentDelete(course.deleted_at)} days left
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
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreCourse(course);
                              }}
                            >
                              <ArrowRight className="w-3.5 h-3.5 mr-2 rotate-180" /> Restore Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handlePermanentDeleteClick(course, e)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Permanently
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
              Let's build your next course
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Describe what you want. Excellion generates a full course you can edit and publish.
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
                    placeholder="Describe your course idea..."
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

          {/* Courses Section */}
          <section id="projects-section" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Your Courses
              </h2>
              {courses.length > 6 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                >
                  {showAllProjects ? 'Show less' : `View all (${courses.length})`}
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
            ) : courses.length === 0 ? (
              <Card className="bg-card/30 border-border border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2">No courses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Describe your course idea above to create your first course.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllProjects ? courses : courses.slice(0, 6)).map((course) => {
                  return (
                    <Card 
                      key={course.id}
                      className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
                      onClick={() => navigate('/secret-builder', { state: { projectId: course.builder_project_id || course.id, courseId: course.id, courseMode: true } })}
                    >
                      {/* Thumbnail or curriculum preview */}
                      <div className="h-36 relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : Array.isArray(course.modules) && course.modules.length > 0 ? (
                          <CourseCardPreview 
                            title={course.title}
                            modules={course.modules}
                            difficulty={course.difficulty}
                            durationWeeks={course.duration_weeks}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted/30 to-accent/20 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="secondary" className="gap-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Course
                          </Button>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {course.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {course.status === 'published' ? (
                                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  <Globe className="w-2.5 h-2.5 mr-0.5" />
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                  Draft
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-semibold">
                                {formatPrice(course.price_cents, course.currency)}
                              </Badge>
                              {(course.total_students ?? 0) > 0 && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Users className="w-2.5 h-2.5" />
                                  {course.total_students}
                                </span>
                              )}
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
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/secret-builder', { state: { projectId: course.builder_project_id || course.id, courseId: course.id, courseMode: true } });
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Course
                              </DropdownMenuItem>
                              {course.published_url && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(course.published_url || '');
                                    toast({ title: 'Link copied!' });
                                  }}
                                >
                                  <Copy className="w-3.5 h-3.5 mr-2" /> Copy Link
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {course.published_url && (
                                <DropdownMenuItem 
                                  onClick={(e) => handleUnpublishCourse(course, e)}
                                  disabled={isUnpublishingCourse === course.id}
                                >
                                  {isUnpublishingCourse === course.id ? (
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                  ) : (
                                    <EyeOff className="w-3.5 h-3.5 mr-2" />
                                  )}
                                  Unpublish Course
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteCourseClick(course, e)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Move to Trash
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
            {courses.length > 6 && (
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
                      View {courses.length - 6} more courses
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
            
            <div className="flex flex-wrap justify-center gap-4">
              {TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                const IconComponent = template.icon;
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    onDoubleClick={() => handleGenerateFromTemplate(template)}
                    disabled={isGenerating}
                    className={`group text-left relative bg-card border-2 rounded-xl overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] ${
                      isSelected 
                        ? 'border-primary shadow-lg shadow-primary/20' 
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    {/* Selected checkmark badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                    
                    {/* Colored gradient thumbnail with icon */}
                    <div 
                      className="h-28 relative overflow-hidden flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${template.color}40 0%, ${template.color}20 100%)`
                      }}
                    >
                      <IconComponent 
                        className="w-12 h-12 transition-transform group-hover:scale-110"
                        style={{ color: template.color }}
                      />
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <ArrowRight className="w-4 h-4" />
                          {isSelected ? 'Double-click to Start' : 'Select Template'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {template.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {template.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Use Template Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => {
                  const template = TEMPLATES.find(t => t.id === selectedTemplate);
                  if (template) handleGenerateFromTemplate(template);
                }}
                disabled={isGenerating || !selectedTemplate}
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Use {TEMPLATES.find(t => t.id === selectedTemplate)?.title || 'Template'}
                  </>
                )}
              </Button>
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

      {/* Course Delete (Soft-Delete) Confirmation Dialog */}
      <AlertDialog open={courseDeleteDialogOpen} onOpenChange={(open) => {
        setCourseDeleteDialogOpen(open);
        if (!open) setCourseDeleteConfirmText('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move this course to trash?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  <strong>"{courseToDelete?.title}"</strong> will be moved to trash.
                </p>
                <p className="text-muted-foreground">
                  You can restore it within 30 days. After that, it will be permanently deleted along with all enrollments, progress, and certificates.
                </p>
                <div className="pt-2">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Type <strong className="text-foreground">{courseToDelete?.title}</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={courseDeleteConfirmText}
                    onChange={(e) => setCourseDeleteConfirmText(e.target.value)}
                    placeholder="Enter course name to confirm"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
                    disabled={isDeleting}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCourse}
              disabled={isDeleting || courseDeleteConfirmText !== courseToDelete?.title}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                'Move to Trash'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete from Trash Confirmation Dialog */}
      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={(open) => {
        setPermanentDeleteDialogOpen(open);
        if (!open) setPermanentDeleteConfirmText('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this course?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  This will permanently delete <strong>"{courseToPermanentlyDelete?.title}"</strong> and all associated data.
                </p>
                <p className="text-destructive font-medium">
                  This action cannot be undone. All enrollments, student progress, certificates, and reviews will be permanently deleted.
                </p>
                <div className="pt-2">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Type <strong className="text-foreground">{courseToPermanentlyDelete?.title}</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={permanentDeleteConfirmText}
                    onChange={(e) => setPermanentDeleteConfirmText(e.target.value)}
                    placeholder="Enter course name to confirm"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
                    disabled={isDeleting}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPermanentDelete}
              disabled={isDeleting || permanentDeleteConfirmText !== courseToPermanentlyDelete?.title}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Build Assist Dialog */}
      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Build Assist</DialogTitle>
          </DialogHeader>
          <VoiceBotPlaceholder onClose={() => setInterviewOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
