import { useState, useCallback, useMemo, useRef } from 'react';
import { EditableOverlay } from './visual-editing/EditableOverlay';
import { PricingTab } from './PricingTab';
import { InlineEditModal, type EditTarget } from './visual-editing/InlineEditModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  BookOpen,
  Play,
  LayoutDashboard,
  Check,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  DollarSign,
  GraduationCap,
  Users,
  Target,
  HelpCircle,
  Award,
  Video,
  ClipboardCheck,
  Circle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Gift,
  Download,
  MessageCircle,
  Star,
  Code,
  Palette,
  Pencil,
  Save,
  X,
  Plus,
  Settings,
  Globe,
  Upload,
  EyeOff,
  Film,
  PlayCircle,
  Paperclip,
  ImageIcon,
  LogIn,
  User,
} from 'lucide-react';
import { 
  ExtendedCourse, 
  ModuleWithContent, 
  LessonContent, 
  DesignConfig,
  getLayoutStyleConfig,
  formatSectionNumber,
  CourseLayoutStyle,
} from '@/types/course-pages';
import { EditableText } from './EditableText';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VideoPlayer } from '@/components/video';
import { QuizBuilder, type QuizQuestion } from '@/components/quiz';
import {
  InstructorSection,
  TestimonialsSection,
  GuaranteeSection,
  BonusSection,
  FeaturesSection,
  DEFAULT_PAGE_SECTIONS,
} from './course-sections';
import { ResourceManager } from '@/components/resources';

type TabType = 'landing' | 'curriculum' | 'lesson' | 'dashboard' | 'pricing' | 'bonuses' | 'resources' | 'community' | 'testimonials';

interface CoursePreviewTabsProps {
  course: ExtendedCourse;
  onUpdate?: (course: ExtendedCourse) => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onRefine?: () => void;
  onOpenSettings?: () => void;
  onOpenPublishSettings?: () => void;
  onPreviewAsStudent?: () => void;
  onDuplicate?: () => void;
  onUploadThumbnail?: () => void;
  isPublishing?: boolean;
  isPublished?: boolean;
  isVisualEditMode?: boolean;
  logoUrl?: string;
  onUpdateLogo?: (url: string | undefined) => void;
  isCreatorView?: boolean;
  onSignIn?: () => void;
}

const BASE_TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'landing', label: 'Landing Page', icon: FileText },
  { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { id: 'lesson', label: 'Lesson Preview', icon: Play },
  { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
];

const PAGE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  bonuses: { label: 'Bonuses', icon: Gift },
  resources: { label: 'Resources', icon: Download },
  community: { label: 'Community', icon: MessageCircle },
  testimonials: { label: 'Testimonials', icon: Star },
};

// Accent color classes for each template style
const ACCENT_CLASSES = {
  amber: { 
    bg: 'bg-amber-500', 
    text: 'text-amber-500', 
    border: 'border-amber-500',
    bgLight: 'bg-amber-500/20',
    borderLight: 'border-amber-500/30',
  },
  emerald: { 
    bg: 'bg-emerald-500', 
    text: 'text-emerald-500', 
    border: 'border-emerald-500',
    bgLight: 'bg-emerald-500/20',
    borderLight: 'border-emerald-500/30',
  },
  blue: { 
    bg: 'bg-blue-500', 
    text: 'text-blue-500', 
    border: 'border-blue-500',
    bgLight: 'bg-blue-500/20',
    borderLight: 'border-blue-500/30',
  },
  violet: { 
    bg: 'bg-violet-500', 
    text: 'text-violet-500', 
    border: 'border-violet-500',
    bgLight: 'bg-violet-500/20',
    borderLight: 'border-violet-500/30',
  },
} as const;

const LessonTypeIcon = ({ type, size = 'sm', accentClass }: { type: string; size?: 'sm' | 'lg'; accentClass?: string }) => {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const colorClass = type === 'video' || type === 'text_video' ? accentClass || 'text-primary' : '';
  const icons: Record<string, React.ReactNode> = {
    video: <PlayCircle className={`${sizeClass} ${colorClass}`} />,
    text: <FileText className={sizeClass} />,
    text_video: <Film className={`${sizeClass} ${colorClass}`} />,
    quiz: <HelpCircle className={sizeClass} />,
    assignment: <ClipboardCheck className={sizeClass} />,
  };
  return icons[type] || <FileText className={sizeClass} />;
};

export function CoursePreviewTabs({
  course,
  onUpdate,
  onPublish,
  onUnpublish,
  onRefine,
  onOpenSettings,
  onOpenPublishSettings,
  onPreviewAsStudent,
  onDuplicate,
  onUploadThumbnail,
  isPublishing = false,
  isPublished = false,
  isVisualEditMode = false,
  logoUrl,
  onUpdateLogo,
  isCreatorView = true,
  onSignIn,
}: CoursePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedVideoUrl, setEditedVideoUrl] = useState('');
  const [editedLessonType, setEditedLessonType] = useState<'text' | 'video' | 'text_video' | 'quiz'>('text');
  const [editedQuizQuestions, setEditedQuizQuestions] = useState<Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'true_false';
    options: string[];
    correct_index: number;
    explanation: string;
  }>>([]);
  const [editedPassingScore, setEditedPassingScore] = useState(70);
  const [lessonResourceCounts, setLessonResourceCounts] = useState<Record<string, number>>({});
  const isMobile = useIsMobile();
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Visual inline edit state
  const [inlineEditTarget, setInlineEditTarget] = useState<EditTarget | null>(null);

  // Edit mode state for landing page sections
  const [isEditMode, setIsEditMode] = useState(false);
  const [landingSections, setLandingSections] = useState<string[]>(
    (course as { page_sections?: { landing?: string[] } }).page_sections?.landing || 
    DEFAULT_PAGE_SECTIONS.landing
  );
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  // Helper to create inline edit target
  const openInlineEdit = useCallback((label: string, type: 'text' | 'textarea', value: string, saveFn: (v: string) => void) => {
    setInlineEditTarget({ label, type, value, onSave: saveFn });
  }, []);

  // Lesson content editing handlers
  const handleStartEditLesson = useCallback(() => {
    const module = course.modules[selectedModuleIdx];
    const lesson = module?.lessons[selectedLessonIdx];
    setEditedContent(lesson?.content_markdown || '');
    setEditedVideoUrl(lesson?.video_url || '');
    setEditedLessonType((lesson?.type as 'text' | 'video' | 'text_video' | 'quiz') || 'text');
    setEditedQuizQuestions(lesson?.quiz_questions || []);
    setEditedPassingScore(lesson?.passing_score || 70);
    setIsEditingLesson(true);
  }, [course.modules, selectedModuleIdx, selectedLessonIdx]);

  const handleSaveLessonContent = useCallback(() => {
    if (!onUpdate) return;
    
    const updatedModules = course.modules.map((module, mIdx) => {
      if (mIdx !== selectedModuleIdx) return module;
      return {
        ...module,
        lessons: module.lessons.map((lesson, lIdx) => {
          if (lIdx !== selectedLessonIdx) return lesson;
          
          if (editedLessonType === 'quiz') {
            return {
              ...lesson,
              type: editedLessonType,
              quiz_questions: editedQuizQuestions,
              passing_score: editedPassingScore,
            };
          }
          
          return {
            ...lesson,
            type: editedLessonType,
            content_markdown: editedContent,
            video_url: editedVideoUrl || undefined,
          };
        }),
      };
    });

    onUpdate({
      ...course,
      modules: updatedModules,
    });
    setIsEditingLesson(false);
    toast.success('Lesson saved');
  }, [course, selectedModuleIdx, selectedLessonIdx, editedContent, editedVideoUrl, editedLessonType, editedQuizQuestions, editedPassingScore, onUpdate]);

  const handleCancelEditLesson = useCallback(() => {
    setIsEditingLesson(false);
    setEditedContent('');
    setEditedVideoUrl('');
    setEditedQuizQuestions([]);
    setEditedPassingScore(70);
  }, []);

  // Inline lesson title editing handler
  const handleSaveLessonTitle = useCallback((moduleIdx: number, lessonIdx: number, newTitle: string) => {
    if (!onUpdate) return;
    
    const updatedModules = course.modules.map((module, mIdx) => {
      if (mIdx !== moduleIdx) return module;
      return {
        ...module,
        lessons: module.lessons.map((lesson, lIdx) => {
          if (lIdx !== lessonIdx) return lesson;
          return {
            ...lesson,
            title: newTitle,
          };
        }),
      };
    });

    onUpdate({
      ...course,
      modules: updatedModules,
    });
  }, [course, onUpdate]);

  // Get template-specific layout configuration
  const layoutStyle = (course.layout_style || 'creator') as CourseLayoutStyle;
  const config = getLayoutStyleConfig(layoutStyle);
  const accent = ACCENT_CLASSES[config.accentColor as keyof typeof ACCENT_CLASSES] || ACCENT_CLASSES.amber;

  // Design config from design editor - CSS custom properties for live preview
  const designConfig: DesignConfig = (course as any).design_config || {};
   const designColors = designConfig.colors || {};
  const designFonts = designConfig.fonts || {};
  const designBackgrounds = (designConfig as any).backgrounds || {};

  const designCssVars: React.CSSProperties = useMemo(() => {
    const vars: Record<string, string> = {};
    if (designColors.primary) vars['--design-primary'] = designColors.primary;
    if (designColors.secondary) vars['--design-secondary'] = designColors.secondary;
    if (designColors.accent) vars['--design-accent'] = designColors.accent;
    if (designColors.background) vars['--design-background'] = designColors.background;
    if (designColors.cardBackground) vars['--design-card'] = designColors.cardBackground;
    if (designColors.text) vars['--design-text'] = designColors.text;
    if (designColors.textMuted) vars['--design-muted'] = designColors.textMuted;
    if (designFonts.heading) vars['--design-font-heading'] = designFonts.heading;
    if (designFonts.body) vars['--design-font-body'] = designFonts.body;
    return vars as React.CSSProperties;
  }, [designColors, designFonts]);

  const hasDesignConfig = Object.keys(designColors).length > 0;

  // Build dynamic tabs based on course configuration
  const TABS = [...BASE_TABS];
  if (course.separatePages && course.isMultiPage) {
    for (const page of course.separatePages) {
      if (page.isEnabled && PAGE_TYPE_CONFIG[page.type]) {
        const pageConfig = PAGE_TYPE_CONFIG[page.type];
        TABS.push({
          id: page.type as TabType,
          label: page.title || pageConfig.label,
          icon: pageConfig.icon,
        });
      }
    }
  }

  // Lesson progress tracking with persistence
  const {
    isLoading: isProgressLoading,
    completedLessons: completedLessonCount,
    totalLessons,
    progressPercent,
    moduleProgress,
    markLessonComplete,
    markLessonIncomplete,
    isLessonComplete,
    getNextIncompleteLesson,
  } = useLessonProgress({
    courseId: course.id || 'preview',
    modules: course.modules,
  });

  const totalMinutes = course.modules?.reduce((acc, m) => {
    return acc + (m.lessons?.reduce((a, l) => {
      const duration = l.duration || '0';
      const match = duration.match(/(\d+)/);
      return a + (match ? parseInt(match[1]) : 0);
    }, 0) || 0);
  }, 0) || 0;
  const totalHours = Math.round(totalMinutes / 60);

  const currentModule = course.modules[selectedModuleIdx];
  const currentLesson = currentModule?.lessons[selectedLessonIdx];

  const handleLessonClick = (moduleIdx: number, lessonIdx: number) => {
    setSelectedModuleIdx(moduleIdx);
    setSelectedLessonIdx(lessonIdx);
    setActiveTab('lesson');
  };

  const handleNextLesson = () => {
    if (!currentModule) return;
    if (selectedLessonIdx < currentModule.lessons.length - 1) {
      setSelectedLessonIdx(selectedLessonIdx + 1);
    } else if (selectedModuleIdx < course.modules.length - 1) {
      setSelectedModuleIdx(selectedModuleIdx + 1);
      setSelectedLessonIdx(0);
    }
  };

  const handlePrevLesson = () => {
    if (selectedLessonIdx > 0) {
      setSelectedLessonIdx(selectedLessonIdx - 1);
    } else if (selectedModuleIdx > 0) {
      const prevModule = course.modules[selectedModuleIdx - 1];
      setSelectedModuleIdx(selectedModuleIdx - 1);
      setSelectedLessonIdx(prevModule.lessons.length - 1);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || !currentModule) return;
    setIsMarkingComplete(true);
    const success = await markLessonComplete(currentLesson.id, currentModule.id);
    setIsMarkingComplete(false);
    if (success && !isLastLesson) {
      handleNextLesson();
    }
  };

  const handleToggleComplete = async (lessonId: string, moduleId: string) => {
    if (isLessonComplete(lessonId)) {
      await markLessonIncomplete(lessonId);
    } else {
      await markLessonComplete(lessonId, moduleId);
    }
  };

  const handleContinueLearning = () => {
    const next = getNextIncompleteLesson();
    if (next) {
      const moduleIdx = course.modules.findIndex(m => m.id === next.moduleId);
      const lessonIdx = moduleIdx >= 0 
        ? course.modules[moduleIdx].lessons.findIndex(l => l.id === next.lessonId)
        : 0;
      if (moduleIdx >= 0 && lessonIdx >= 0) {
        handleLessonClick(moduleIdx, lessonIdx);
      }
    } else {
      handleLessonClick(0, 0);
    }
  };

  const isFirstLesson = selectedModuleIdx === 0 && selectedLessonIdx === 0;
  const isLastLesson = selectedModuleIdx === course.modules.length - 1 && 
    selectedLessonIdx === (currentModule?.lessons.length || 1) - 1;
  const currentLessonComplete = currentLesson ? isLessonComplete(currentLesson.id) : false;

  // Section editing helpers
  const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero Section',
    outcomes: "What You'll Learn",
    curriculum: 'Curriculum Overview',
    instructor: 'Meet Your Instructor',
    testimonials: 'Student Testimonials',
    features: 'Course Features',
    faq: 'Frequently Asked Questions',
    guarantee: 'Money-Back Guarantee',
    bonus: 'Bonus Materials',
    cta: 'Enroll CTA',
  };

  const ALL_SECTIONS = ['hero', 'outcomes', 'curriculum', 'instructor', 'testimonials', 'features', 'faq', 'guarantee', 'bonus', 'cta'];
  const REQUIRED_SECTIONS = ['hero', 'cta'];

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newSections = [...landingSections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setLandingSections(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (index >= landingSections.length - 1) return;
    const newSections = [...landingSections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setLandingSections(newSections);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (REQUIRED_SECTIONS.includes(sectionId)) return;
    setLandingSections(landingSections.filter(s => s !== sectionId));
  };

  const handleAddSection = (sectionId: string) => {
    if (!landingSections.includes(sectionId)) {
      setLandingSections([...landingSections, sectionId]);
    }
  };

  const handleSaveLayout = async () => {
    if (!course.id) {
      toast.success('Layout saved locally');
      setIsEditMode(false);
      return;
    }

    setIsSavingLayout(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          page_sections: {
            landing: landingSections,
          },
        })
        .eq('id', course.id);

      if (error) throw error;
      toast.success('Layout saved successfully');
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save layout:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSavingLayout(false);
    }
  };

  const availableSections = ALL_SECTIONS.filter(s => !landingSections.includes(s));

  // ===================
  // MODULE RENDERERS - Template-specific layouts
  // ===================

  // Timeline Layout (Creator Template) - Vertical line with dots
  const renderTimelineModules = () => (
    <div className="relative space-y-0">
      {/* Timeline vertical line */}
      <div className={`absolute left-4 top-6 bottom-6 w-0.5 ${accent.bgLight}`} />
      
      {course.modules.map((module, moduleIdx) => {
        const modProgress = moduleProgress.find(p => p.moduleId === module.id);
        return (
          <div key={module.id} className="relative pl-10 pb-6 last:pb-0">
            {/* Timeline dot */}
            <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full ${
              modProgress?.isComplete ? 'bg-green-500' : accent.bg
            }`} />
            
            <Card className={`${config.cardClass} border-border`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className={`text-base ${config.headingClass}`}>{module.title}</CardTitle>
                  {modProgress && modProgress.completedLessons > 0 && (
                    <Badge className={`${accent.bgLight} ${accent.text} text-xs`}>
                      {modProgress.completedLessons}/{modProgress.totalLessons}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {module.lessons.map((lesson, lessonIdx) => {
                    const isComplete = isLessonComplete(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors text-left ${
                          isComplete
                            ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                            : `bg-muted/30 border-border/50 hover:${accent.borderLight} hover:bg-muted/50`
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                            className="shrink-0 touch-manipulation"
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <LessonTypeIcon type={lesson.type} />
                            )}
                          </button>
                          <EditableText
                            value={lesson.title}
                            onSave={(newTitle) => handleSaveLessonTitle(moduleIdx, lessonIdx, newTitle)}
                            className={`text-sm font-medium ${isComplete ? 'text-green-400' : 'text-foreground'}`}
                            as="span"
                          />
                          {lesson.is_preview && (
                            <Badge className={`${accent.bgLight} ${accent.text} border-${accent.border}/30 text-xs shrink-0`}>
                              Free Preview
                            </Badge>
                          )}
                        </div>
                        <button
                          onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                          className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 ml-2 touch-manipulation hover:text-foreground transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );

  // Accordion Layout (Technical Template) - Collapsible sections
  const renderAccordionModules = () => (
    <Accordion type="multiple" className="space-y-3">
      {course.modules.map((module, moduleIdx) => {
        const modProgress = moduleProgress.find(p => p.moduleId === module.id);
        return (
          <AccordionItem 
            key={module.id} 
            value={module.id}
            className={`${config.cardClass} border rounded-lg px-4`}
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3 text-left">
                <span className={`flex items-center justify-center w-8 h-8 rounded font-mono text-sm shrink-0 ${
                  modProgress?.isComplete 
                    ? 'bg-green-500/20 text-green-400' 
                    : `${accent.bgLight} ${accent.text}`
                }`}>
                  {modProgress?.isComplete ? <Check className="w-4 h-4" /> : `0${moduleIdx + 1}`}
                </span>
                <div>
                  <p className={`font-medium ${config.headingClass}`}>{module.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {module.lessons.length} lessons • {modProgress?.completedLessons || 0} completed
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-1 ml-11">
                {module.lessons.map((lesson, lessonIdx) => {
                  const isComplete = isLessonComplete(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between w-full p-2 rounded text-left text-sm font-mono transition-colors ${
                        isComplete
                          ? 'text-green-400 hover:bg-green-500/10'
                          : `text-foreground/80 hover:${accent.bgLight}`
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                          className="touch-manipulation shrink-0"
                        >
                          <Code className="w-3 h-3 opacity-50" />
                        </button>
                        <EditableText
                          value={lesson.title}
                          onSave={(newTitle) => handleSaveLessonTitle(moduleIdx, lessonIdx, newTitle)}
                          className="text-sm font-mono"
                          as="span"
                        />
                      </div>
                      <button
                        onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                        className="text-xs opacity-60 hover:opacity-100 transition-opacity touch-manipulation shrink-0 ml-2"
                      >
                        {lesson.duration}
                      </button>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  // Numbered Layout (Academic Template) - Formal section numbers
  const renderNumberedModules = () => (
    <div className="space-y-6">
      {course.modules.map((module, moduleIdx) => {
        const modProgress = moduleProgress.find(p => p.moduleId === module.id);
        return (
          <Card key={module.id} className={`${config.cardClass} border-border`}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <span className={`text-2xl font-serif font-bold ${accent.text}`}>
                  {formatSectionNumber(moduleIdx)}
                </span>
                <div className="flex-1">
                  <CardTitle className={`text-lg ${config.headingClass}`}>{module.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                  {modProgress && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Progress value={(modProgress.completedLessons / modProgress.totalLessons) * 100} className="w-24 h-1" />
                      <span>{modProgress.completedLessons}/{modProgress.totalLessons} complete</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border-l-2 border-border ml-4 pl-6 space-y-3">
                {module.lessons.map((lesson, lessonIdx) => {
                  const isComplete = isLessonComplete(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-start gap-3 w-full text-left transition-colors group ${
                        isComplete ? 'opacity-70' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                        className={`text-sm font-serif ${accent.text} touch-manipulation shrink-0`}
                      >
                        {formatSectionNumber(moduleIdx, lessonIdx)}
                      </button>
                      <div className="flex-1">
                        <EditableText
                          value={lesson.title}
                          onSave={(newTitle) => handleSaveLessonTitle(moduleIdx, lessonIdx, newTitle)}
                          className={`text-sm font-medium transition-colors ${
                            isComplete ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                          as="p"
                        />
                        <button
                          onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                          className="text-xs text-muted-foreground mt-0.5 hover:text-foreground transition-colors touch-manipulation"
                        >
                          {lesson.duration}
                        </button>
                      </div>
                      {isComplete && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Certificate badge for academic style */}
      {config.showCertificate && (
        <Card className={`${config.cardClass} border-${accent.border}/30`}>
          <CardContent className="py-6 text-center">
            <Award className={`w-12 h-12 mx-auto mb-3 ${accent.text}`} />
            <h3 className={`text-lg font-serif font-semibold ${config.headingClass}`}>Certificate of Completion</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete all modules to earn your certificate
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Grid Layout (Visual Template) - Card-based grid
  const renderGridModules = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {course.modules.map((module, moduleIdx) => {
        const modProgress = moduleProgress.find(p => p.moduleId === module.id);
        return (
          <Card 
            key={module.id} 
            className={`${config.cardClass} border-border overflow-hidden group hover:border-${accent.border}/50 transition-all cursor-pointer`}
            onClick={() => handleLessonClick(moduleIdx, 0)}
          >
            {/* Visual gradient header */}
            <div className={`h-24 bg-gradient-to-br from-${config.accentColor}-500/30 to-${config.accentColor}-600/10 flex items-center justify-center`}>
              <div className={`w-16 h-16 rounded-full ${accent.bgLight} flex items-center justify-center`}>
                <Palette className={`w-8 h-8 ${accent.text}`} />
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-bold ${config.headingClass}`}>{module.title}</h3>
                {modProgress?.isComplete && (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{module.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {module.lessons.length} lessons
                </span>
                {modProgress && modProgress.completedLessons > 0 && (
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(modProgress.completedLessons / modProgress.totalLessons) * 100} 
                      className="w-16 h-1.5"
                    />
                    <span className={`text-xs ${accent.text}`}>
                      {Math.round((modProgress.completedLessons / modProgress.totalLessons) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // ===================
  // TAB CONTENT RENDERERS
  // ===================

  // Landing Page Content - Template-aware with Edit Mode
  const renderLandingPage = () => {
    // Edit Mode UI - Section Cards
    if (isEditMode) {
      return (
        <div className={`space-y-6 ${config.containerClass}`}>
          <div className="text-center mb-4">
            <h2 className={`text-xl font-bold ${config.headingClass}`}>Edit Landing Page Layout</h2>
            <p className="text-sm text-muted-foreground">Drag sections to reorder, add or remove sections</p>
          </div>

          <div className="space-y-2">
            {landingSections.map((sectionId, index) => {
              const isRequired = REQUIRED_SECTIONS.includes(sectionId);
              return (
                <div
                  key={sectionId}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-amber-500/30"
                >
                  <span className="text-sm font-medium text-foreground">
                    {SECTION_LABELS[sectionId] || sectionId}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === landingSections.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    {!isRequired && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveSection(sectionId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {availableSections.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full border-amber-500/30 text-amber-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {availableSections.map((sectionId) => (
                  <DropdownMenuItem
                    key={sectionId}
                    onClick={() => handleAddSection(sectionId)}
                  >
                    {SECTION_LABELS[sectionId] || sectionId}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={handleSaveLayout}
            disabled={isSavingLayout}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isSavingLayout ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Layout
          </Button>
        </div>
      );
    }

    // Dynamic Section Renderer
    const renderSection = (sectionId: string) => {
      switch (sectionId) {
        case 'hero': {
          const heroBg = hasDesignConfig
            ? `linear-gradient(135deg, ${designColors.secondary || '#1a1a1a'}, ${designColors.background || '#0a0a0a'})`
            : course.brand_color 
              ? `linear-gradient(135deg, ${course.brand_color}30 0%, hsl(var(--background)) 100%)`
              : undefined;
          const heroPrimary = hasDesignConfig ? (designColors.primary || '#d4a853') : undefined;
          const heroText = hasDesignConfig ? (designColors.text || '#ffffff') : undefined;
          const heroMuted = hasDesignConfig ? (designColors.textMuted || '#9ca3af') : undefined;
          const heroCardBg = hasDesignConfig ? (designColors.cardBackground || '#111111') : undefined;
          const heroRadius = hasDesignConfig ? 'var(--course-radius)' : undefined;

          return (
            <div 
              key="hero"
              className={`relative overflow-hidden ${hasDesignConfig ? '' : `rounded-xl p-6 sm:p-8 md:p-12 ${config.cardClass}`}`}
              style={hasDesignConfig ? { 
                background: designBackgrounds.hero ? undefined : heroBg,
                padding: 'var(--course-spacing)',
              } : { 
                background: heroBg || `linear-gradient(135deg, hsl(var(--${config.accentColor === 'amber' ? 'primary' : config.accentColor}-500) / 0.2) 0%, hsl(var(--background)) 100%)`,
              }}
            >
              {/* Background image from design config or thumbnail */}
              {designBackgrounds.hero ? (
                <div className="absolute inset-0">
                  <img src={designBackgrounds.hero} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
              ) : course.thumbnail ? (
                <div className="absolute inset-0 opacity-20">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div 
                className="relative z-10"
                style={hasDesignConfig ? {
                  backgroundColor: heroCardBg,
                  borderRadius: heroRadius,
                  border: `1px solid ${heroPrimary}33`,
                  padding: '48px',
                  maxWidth: '800px',
                  margin: '0 auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                } : { maxWidth: '42rem' }}
              >
                <span 
                  className={hasDesignConfig ? '' : `${accent.bgLight} ${accent.text} ${accent.borderLight} inline-block mb-4 px-3 py-1 rounded text-xs font-medium`}
                  style={hasDesignConfig ? {
                    backgroundColor: heroPrimary,
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginBottom: '16px',
                  } : undefined}
                >
                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)} Level
                </span>
                <EditableOverlay isEditMode={isVisualEditMode} label="Title" onEdit={() => openInlineEdit('Course Title', 'text', course.title, (v) => onUpdate?.({ ...course, title: v }))}>
                  <h1 
                    className={hasDesignConfig ? '' : `text-2xl sm:text-3xl md:text-4xl font-bold mb-3 ${config.headingClass}`}
                    style={hasDesignConfig ? {
                      color: heroText,
                      fontSize: '2.5rem',
                      marginTop: '16px',
                      marginBottom: '16px',
                      lineHeight: 1.2,
                      fontFamily: designFonts.heading || 'Inter',
                    } : undefined}
                  >
                    {course.title}
                  </h1>
                </EditableOverlay>
                {course.tagline && (
                  <EditableOverlay isEditMode={isVisualEditMode} label="Tagline" onEdit={() => openInlineEdit('Tagline', 'text', course.tagline || '', (v) => onUpdate?.({ ...course, tagline: v }))}>
                    <p 
                      className={hasDesignConfig ? '' : `text-lg sm:text-xl font-medium ${accent.text} mb-4`}
                      style={hasDesignConfig ? { color: heroPrimary, fontSize: '1.1rem', marginBottom: '12px' } : undefined}
                    >
                      {course.tagline}
                    </p>
                  </EditableOverlay>
                )}
                <EditableOverlay isEditMode={isVisualEditMode} label="Description" onEdit={() => openInlineEdit('Description', 'textarea', course.description, (v) => onUpdate?.({ ...course, description: v }))}>
                  <p 
                    className={hasDesignConfig ? '' : 'text-muted-foreground mb-6'}
                    style={hasDesignConfig ? {
                      color: heroMuted,
                      marginBottom: '24px',
                      fontSize: '1.1rem',
                      fontFamily: designFonts.body || 'Inter',
                    } : undefined}
                  >
                    {course.description}
                  </p>
                </EditableOverlay>
                <div 
                  className={hasDesignConfig ? '' : 'flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground'}
                  style={hasDesignConfig ? {
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: '16px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: heroMuted,
                  } : undefined}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {course.modules.length} modules
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {totalLessons} lessons
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {totalHours}+ hours
                  </div>
                </div>
                <button
                  className={hasDesignConfig ? '' : `${accent.bg} hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold`}
                  style={hasDesignConfig ? {
                    backgroundColor: heroPrimary,
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: heroRadius || '8px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                  } : undefined}
                  onClick={() => {
                    if (isVisualEditMode) return;
                    if (!isCreatorView) { onSignIn?.(); return; }
                    setActiveTab('curriculum');
                  }}
                >
                  {isCreatorView ? 'Enroll Now' : 'Sign In to Enroll'}
                </button>
              </div>
            </div>
          );
        }

        case 'outcomes': {
          if (!course.learningOutcomes || course.learningOutcomes.length === 0) return null;
          const outcPrimary = hasDesignConfig ? (designColors.primary || '#d4a853') : undefined;
          const outcText = hasDesignConfig ? (designColors.text || '#ffffff') : undefined;
          const outcBg = hasDesignConfig ? (designColors.background || '#0a0a0a') : undefined;
          const outcCardBg = hasDesignConfig ? (designColors.cardBackground || '#111111') : undefined;

          if (hasDesignConfig) {
            return (
              <div key="outcomes" style={{ backgroundColor: outcCardBg, padding: 'var(--course-spacing)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <h2 style={{ color: outcText, marginBottom: '24px', textAlign: 'center', fontSize: '1.8rem', fontFamily: designFonts.heading || 'Inter' }}>
                    What You'll Learn
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {course.learningOutcomes.map((outcome, idx) => (
                      <EditableOverlay key={idx} isEditMode={isVisualEditMode} label={`Outcome ${idx + 1}`} onEdit={() => openInlineEdit(`Learning Outcome ${idx + 1}`, 'text', outcome, (v) => {
                        const updated = [...(course.learningOutcomes || [])];
                        updated[idx] = v;
                        onUpdate?.({ ...course, learningOutcomes: updated });
                      })}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: outcBg, borderRadius: 'var(--course-radius)' }}>
                          <span style={{ color: outcPrimary, fontSize: '18px' }}>✓</span>
                          <span style={{ color: outcText, fontSize: '14px' }}>{outcome}</span>
                        </div>
                      </EditableOverlay>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Card key="outcomes" className={`${config.cardClass} border-border`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${config.headingClass}`}>
                  <Target className={`w-5 h-5 ${accent.text}`} />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 ${accent.text} mt-0.5 shrink-0`} />
                      <EditableOverlay isEditMode={isVisualEditMode} label={`Outcome ${idx + 1}`} onEdit={() => openInlineEdit(`Learning Outcome ${idx + 1}`, 'text', outcome, (v) => {
                        const updated = [...(course.learningOutcomes || [])];
                        updated[idx] = v;
                        onUpdate?.({ ...course, learningOutcomes: updated });
                      })}>
                        <span className="text-foreground/90 text-sm">{outcome}</span>
                      </EditableOverlay>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        }

        case 'curriculum':
          return (
            <Card key="curriculum" className={`${config.cardClass} border-border relative overflow-hidden`}>
              {designBackgrounds.curriculum && (
                <div className="absolute inset-0">
                  <img src={designBackgrounds.curriculum} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/80" />
                </div>
              )}
              <div className="relative z-10">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${config.headingClass}`}>
                  <BookOpen className={`w-5 h-5 ${accent.text}`} />
                  Course Curriculum
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {course.modules.length} modules • {totalLessons} lessons
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.modules.map((module, idx) => (
                    <div 
                      key={module.id}
                      className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:${accent.borderLight} transition-colors cursor-pointer`}
                      onClick={() => {
                        setSelectedModuleIdx(idx);
                        setActiveTab('curriculum');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-7 h-7 rounded-full ${accent.bgLight} ${accent.text} text-sm font-medium ${
                          layoutStyle === 'technical' ? 'font-mono' : ''
                        }`}>
                          {layoutStyle === 'academic' ? formatSectionNumber(idx).replace('.0', '') : idx + 1}
                        </span>
                        <div>
                          <EditableOverlay isEditMode={isVisualEditMode} label="Module" onEdit={() => openInlineEdit(`Module ${idx + 1} Title`, 'text', module.title, (v) => {
                            const updatedModules = course.modules.map((m, i) => i === idx ? { ...m, title: v } : m);
                            onUpdate?.({ ...course, modules: updatedModules });
                          })}>
                            <p className={`font-medium text-foreground text-sm ${
                              layoutStyle === 'technical' ? 'font-mono' : ''
                            }`}>{module.title}</p>
                          </EditableOverlay>
                          <p className="text-xs text-muted-foreground">{module.lessons.length} lessons</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
              </div>
            </Card>
          );

        case 'instructor':
          return (
            <InstructorSection 
              key="instructor"
              name={(course as { instructor_name?: string }).instructor_name}
              bio={(course as { instructor_bio?: string }).instructor_bio}
            />
          );

        case 'testimonials':
          return <TestimonialsSection key="testimonials" />;

        case 'features':
          return (
            <FeaturesSection 
              key="features"
              durationWeeks={course.duration_weeks}
              lessonCount={totalLessons}
              difficulty={course.difficulty}
            />
          );

        case 'faq': {
          if (!course.pages?.faq || course.pages.faq.length === 0) return null;
          const faqText = hasDesignConfig ? (designColors.text || '#ffffff') : undefined;
          const faqMuted = hasDesignConfig ? (designColors.textMuted || '#9ca3af') : undefined;
          const faqCardBg = hasDesignConfig ? (designColors.cardBackground || '#111111') : undefined;
          const faqBg = hasDesignConfig ? (designColors.background || '#0a0a0a') : undefined;

          if (hasDesignConfig) {
            return (
              <div key="faq" style={{ backgroundColor: faqCardBg, padding: 'var(--course-spacing)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <h2 style={{ color: faqText, marginBottom: '24px', textAlign: 'center', fontSize: '1.8rem', fontFamily: designFonts.heading || 'Inter' }}>
                    Frequently Asked Questions
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                    {course.pages.faq.map((faq, idx) => (
                      <div key={idx} style={{ backgroundColor: faqBg, padding: '20px', borderRadius: 'var(--course-radius)' }}>
                        <EditableOverlay isEditMode={isVisualEditMode} label={`Question ${idx + 1}`} onEdit={() => openInlineEdit(`FAQ ${idx + 1} Question`, 'text', faq.question, (v) => {
                          const updatedFaqs = course.pages!.faq!.map((f, i) => i === idx ? { ...f, question: v } : f);
                          onUpdate?.({ ...course, pages: { ...course.pages!, faq: updatedFaqs } });
                        })}>
                          <div style={{ fontWeight: 600, color: faqText, marginBottom: '8px', fontSize: '15px' }}>{faq.question}</div>
                        </EditableOverlay>
                        <EditableOverlay isEditMode={isVisualEditMode} label={`Answer ${idx + 1}`} onEdit={() => openInlineEdit(`FAQ ${idx + 1} Answer`, 'textarea', faq.answer, (v) => {
                          const updatedFaqs = course.pages!.faq!.map((f, i) => i === idx ? { ...f, answer: v } : f);
                          onUpdate?.({ ...course, pages: { ...course.pages!, faq: updatedFaqs } });
                        })}>
                          <div style={{ color: faqMuted, fontSize: '14px' }}>{faq.answer}</div>
                        </EditableOverlay>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Card key="faq" className={`${config.cardClass} border-border`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${config.headingClass}`}>
                  <HelpCircle className={`w-5 h-5 ${accent.text}`} />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {course.pages.faq.map((faq, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`faq-${idx}`}
                      className={`bg-muted/20 border ${accent.borderLight} rounded-lg px-4`}
                    >
                      <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                        <EditableOverlay isEditMode={isVisualEditMode} label="Question" onEdit={() => openInlineEdit(`FAQ ${idx + 1} Question`, 'text', faq.question, (v) => {
                          const updatedFaqs = course.pages!.faq!.map((f, i) => i === idx ? { ...f, question: v } : f);
                          onUpdate?.({ ...course, pages: { ...course.pages!, faq: updatedFaqs } });
                        })}>
                          <span>{faq.question}</span>
                        </EditableOverlay>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-3">
                        <EditableOverlay isEditMode={isVisualEditMode} label="Answer" onEdit={() => openInlineEdit(`FAQ ${idx + 1} Answer`, 'textarea', faq.answer, (v) => {
                          const updatedFaqs = course.pages!.faq!.map((f, i) => i === idx ? { ...f, answer: v } : f);
                          onUpdate?.({ ...course, pages: { ...course.pages!, faq: updatedFaqs } });
                        })}>
                          <span>{faq.answer}</span>
                        </EditableOverlay>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        }

        case 'guarantee':
          return <GuaranteeSection key="guarantee" />;

        case 'bonus':
          return <BonusSection key="bonus" />;

        case 'cta': {
          const ctaPrimary = hasDesignConfig ? (designColors.primary || '#d4a853') : undefined;
          const ctaText = hasDesignConfig ? (designColors.text || '#ffffff') : undefined;
          const ctaMuted = hasDesignConfig ? (designColors.textMuted || '#9ca3af') : undefined;
          const ctaSecondary = hasDesignConfig ? (designColors.secondary || '#1a1a1a') : undefined;
          const ctaBg = hasDesignConfig ? (designColors.background || '#0a0a0a') : undefined;

          if (hasDesignConfig) {
            return (
              <div key="cta" className="relative overflow-hidden" style={{
                background: designBackgrounds.cta ? undefined : `linear-gradient(135deg, ${ctaSecondary}, ${ctaBg})`,
                padding: 'var(--course-spacing)',
                textAlign: 'center' as const,
              }}>
                {designBackgrounds.cta && (
                  <div className="absolute inset-0">
                    <img src={designBackgrounds.cta} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60" />
                  </div>
                )}
                <div className="relative z-10">
                <EditableOverlay isEditMode={isVisualEditMode} label="CTA Headline" onEdit={() => openInlineEdit('CTA Headline', 'text', 'Ready to Get Started?', () => {})}>
                  <h2 style={{ color: ctaText, marginBottom: '16px', fontSize: '2rem', fontFamily: designFonts.heading || 'Inter' }}>
                    Ready to Get Started?
                  </h2>
                </EditableOverlay>
                <EditableOverlay isEditMode={isVisualEditMode} label="Tagline" onEdit={() => openInlineEdit('Tagline', 'text', course.tagline || 'Begin your learning journey today', (v) => onUpdate?.({ ...course, tagline: v }))}>
                  <p style={{ color: ctaMuted, marginBottom: '24px' }}>
                    {course.tagline || 'Begin your learning journey today'}
                  </p>
                </EditableOverlay>
                <button
                  style={{
                    backgroundColor: ctaPrimary,
                    color: '#000',
                    padding: '16px 32px',
                    borderRadius: 'var(--course-radius)',
                    fontWeight: 600,
                    fontSize: '18px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => isCreatorView ? setActiveTab('curriculum') : onSignIn?.()}
                >
                  {isCreatorView ? 'Enroll Now' : 'Sign In to Enroll'}
                </button>
                </div>
              </div>
            );
          }

          return (
            <Card 
              key="cta" 
              className={`bg-gradient-to-r from-${config.accentColor}-500/10 to-${config.accentColor}-600/5 ${accent.borderLight}`}
            >
              <CardContent className="py-8 text-center">
                <EditableOverlay isEditMode={isVisualEditMode} label="CTA Title" onEdit={() => openInlineEdit('CTA Title', 'text', 'Ready to Start?', () => {})}>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${config.headingClass}`}>
                    Ready to Start?
                  </h3>
                </EditableOverlay>
                <EditableOverlay isEditMode={isVisualEditMode} label="CTA Subtitle" onEdit={() => openInlineEdit('CTA Subtitle', 'text', 'Join thousands of students already learning', () => {})}>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of students already learning
                  </p>
                </EditableOverlay>
                <Button 
                  size="lg" 
                  className={`${accent.bg} hover:opacity-90 text-white w-full sm:w-auto`}
                  onClick={() => isCreatorView ? setActiveTab('curriculum') : onSignIn?.()}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isCreatorView ? 'Enroll Now' : 'Sign In to Enroll'}
                </Button>
              </CardContent>
            </Card>
          );
        }

        default:
          return null;
      }
    };

    return (
      <div className={hasDesignConfig ? 'space-y-0' : `space-y-6 p-4 sm:p-6 ${config.containerClass}`}>
        {landingSections.map(renderSection)}
      </div>
    );
  };

  // Curriculum Content - Uses template-specific module renderer
  const renderCurriculum = () => (
    <div className={`space-y-6 p-4 sm:p-6 ${config.containerClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${config.headingClass}`}>{course.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration_weeks} weeks
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              {totalLessons} lessons
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              {completedLessonCount} completed
            </span>
          </div>
        </div>
        {progressPercent > 0 && (
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="w-32 h-2" />
            <span className={`text-sm font-medium ${accent.text}`}>{progressPercent}%</span>
          </div>
        )}
      </div>

      {/* Template-specific module layout */}
      {config.moduleLayout === 'timeline' && renderTimelineModules()}
      {config.moduleLayout === 'accordion' && renderAccordionModules()}
      {config.moduleLayout === 'numbered' && renderNumberedModules()}
      {config.moduleLayout === 'grid' && renderGridModules()}
    </div>
  );

  // Lesson Preview Content
  const renderLessonPreview = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-[438px_1fr] gap-4 p-4 sm:p-6 ${config.containerClass}`} style={{ minHeight: 0 }}>
      {/* Sidebar - fixed width, fully contained */}
      <div className="hidden lg:flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Card className={`${config.cardClass} border-border flex flex-col overflow-hidden h-full`}>
          <div className="h-12 min-h-[48px] max-h-[48px] flex items-center justify-between px-4 border-b border-border shrink-0">
            <span className={`text-sm font-semibold ${config.headingClass}`}>Course Content</span>
            {progressPercent > 0 && (
              <span className={`text-xs font-medium ${accent.text}`}>{progressPercent}%</span>
            )}
          </div>
          <ScrollArea className="flex-1 min-h-0" scrollbarVariant="grey">
            <div className="p-2 space-y-2">
              {course.modules.map((module, moduleIdx) => {
                const modProgress = moduleProgress.find(p => p.moduleId === module.id);
                return (
                  <div key={module.id} className="space-y-1">
                    <div className="flex items-center gap-2 p-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        modProgress?.isComplete 
                          ? 'bg-green-500/20 text-green-400' 
                          : `${accent.bgLight} ${accent.text}`
                      }`}>
                        {modProgress?.isComplete ? <Check className="w-3 h-3" /> : moduleIdx + 1}
                      </span>
                      <span className={`text-xs font-medium truncate ${config.headingClass}`}>{module.title}</span>
                    </div>
                    <div className="ml-5 space-y-0.5">
                      {module.lessons.map((lesson, lessonIdx) => {
                        const isActive = selectedModuleIdx === moduleIdx && selectedLessonIdx === lessonIdx;
                        const isComplete = isLessonComplete(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedModuleIdx(moduleIdx);
                              setSelectedLessonIdx(lessonIdx);
                            }}
                            className={`flex items-center gap-2 w-full p-2 rounded text-left text-xs transition-colors touch-manipulation ${
                              isActive
                                ? `${accent.bgLight} ${accent.text} border ${accent.borderLight}`
                                : isComplete
                                  ? 'text-green-400 hover:bg-green-500/10'
                                  : 'hover:bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-3 h-3 shrink-0 text-green-400" />
                            ) : isActive ? (
                              <Play className="w-3 h-3 shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Content */}
      <div className="min-w-0 overflow-hidden space-y-4">
        {currentLesson ? (
          <>
            {/* Lesson Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Module {selectedModuleIdx + 1} • Lesson {selectedLessonIdx + 1}
                </p>
                <EditableText
                  value={currentLesson.title}
                  onSave={(newTitle) => handleSaveLessonTitle(selectedModuleIdx, selectedLessonIdx, newTitle)}
                  className={`text-xl font-bold ${config.headingClass}`}
                  as="h2"
                />
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <LessonTypeIcon type={currentLesson.type} />
                  <span className="capitalize">{currentLesson.type}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>{currentLesson.duration}</span>
                </div>
              </div>
              {currentLessonComplete && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            {/* Content Area */}
            <Card className={`${config.cardClass} border-border`}>
              <CardContent className="py-6">
                {/* Edit button for all editable lessons */}
                {!isEditingLesson && ['text', 'video', 'text_video', 'quiz'].includes(currentLesson.type) && (
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEditLesson}
                      className="gap-2"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Lesson
                    </Button>
                  </div>
                )}
                
                {/* Editing mode */}
                {isEditingLesson ? (
                  <div className="space-y-6">
                    {/* Lesson Type Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Lesson Type</Label>
                      <Select
                        value={editedLessonType}
                        onValueChange={(value: 'text' | 'video' | 'text_video' | 'quiz') => setEditedLessonType(value)}
                      >
                        <SelectTrigger className="w-full bg-muted/50">
                          <SelectValue placeholder="Select lesson type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>Text</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-4 h-4" />
                              <span>Video</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="text_video">
                            <div className="flex items-center gap-2">
                              <Film className="w-4 h-4" />
                              <span>Text + Video</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="quiz">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              <span>Quiz</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quiz Builder */}
                    {editedLessonType === 'quiz' && (
                      <div className="space-y-2">
                        <QuizBuilder
                          questions={editedQuizQuestions}
                          passingScore={editedPassingScore}
                          onQuestionsChange={setEditedQuizQuestions}
                          onPassingScoreChange={setEditedPassingScore}
                        />
                      </div>
                    )}

                    {/* Video URL Field */}
                    {(editedLessonType === 'video' || editedLessonType === 'text_video') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Video URL</Label>
                        <Input
                          value={editedVideoUrl}
                          onChange={(e) => setEditedVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                          className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">
                          Paste YouTube, Vimeo, or direct .mp4 video URL
                        </p>
                        
                        {/* Video Preview */}
                        {editedVideoUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Preview:</p>
                            <VideoPlayer url={editedVideoUrl} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text Content Field */}
                    {(editedLessonType === 'text' || editedLessonType === 'text_video') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {editedLessonType === 'text_video' ? 'Text Content (shown below video)' : 'Lesson Content'}
                        </Label>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          placeholder="Enter lesson content here... (Markdown supported)&#10;&#10;## Heading&#10;**Bold text**, *italic text*&#10;&#10;- Bullet points&#10;- More points"
                          className="min-h-[200px] font-mono text-sm bg-muted/50 border-border resize-y"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tip: Use Markdown for formatting
                        </p>
                      </div>
                    )}

                    {/* Resources Section - available for ALL lesson types */}
                    {course.id && currentLesson && (
                      <ResourceManager
                        courseId={course.id}
                        lessonId={currentLesson.id}
                        isEditing={true}
                        onResourcesChange={(count) => {
                          setLessonResourceCounts(prev => ({
                            ...prev,
                            [currentLesson.id]: count,
                          }));
                        }}
                      />
                    )}

                    {/* Save/Cancel buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEditLesson}
                        className="gap-2"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveLessonContent}
                        className={`gap-2 ${accent.bg} hover:opacity-90`}
                      >
                        <Save className="w-3 h-3" />
                        Save Lesson
                      </Button>
                    </div>
                  </div>
                ) : currentLesson.type === 'video' ? (
                  // Video only lesson
                  <div className="space-y-4">
                    {currentLesson.video_url ? (
                      <VideoPlayer url={currentLesson.video_url} className="mb-6" />
                    ) : (
                      <div 
                        className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={handleStartEditLesson}
                      >
                        <div className="text-center">
                          <Play className={`w-12 h-12 ${accent.text} mx-auto mb-2`} />
                          <p className="text-muted-foreground text-sm">Click to add video URL</p>
                        </div>
                      </div>
                    )}
                    {currentLesson.description && (
                      <p className="text-muted-foreground">{currentLesson.description}</p>
                    )}
                  </div>
                ) : currentLesson.type === 'text_video' ? (
                  // Text + Video lesson
                  <div className="space-y-6">
                    {currentLesson.video_url ? (
                      <VideoPlayer url={currentLesson.video_url} className="mb-4" />
                    ) : (
                      <div 
                        className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={handleStartEditLesson}
                      >
                        <div className="text-center">
                          <Film className={`w-12 h-12 ${accent.text} mx-auto mb-2`} />
                          <p className="text-muted-foreground text-sm">Click to add video URL</p>
                        </div>
                      </div>
                    )}
                    <div className={`prose prose-invert prose-sm max-w-none ${
                      layoutStyle === 'technical' ? 'font-mono' : ''
                    }`}>
                      {currentLesson.content_markdown ? (
                        <div 
                          className="whitespace-pre-wrap text-foreground/90 cursor-pointer hover:bg-muted/20 rounded-lg p-4 -m-4 transition-colors"
                          onClick={handleStartEditLesson}
                          title="Click to edit content"
                        >
                          {currentLesson.content_markdown}
                        </div>
                      ) : (
                        <div 
                          className="text-center py-4 text-muted-foreground cursor-pointer hover:bg-muted/20 rounded-lg transition-colors"
                          onClick={handleStartEditLesson}
                          title="Click to add content"
                        >
                          <p>Click to add text content...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : currentLesson.type === 'quiz' ? (
                  <div className="text-center py-8">
                    <HelpCircle className={`w-12 h-12 ${accent.text} mx-auto mb-4`} />
                    <h3 className={`text-lg font-semibold mb-2 ${config.headingClass}`}>Quiz: {currentLesson.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {currentLesson.quiz_questions?.length || 0} questions • Pass score: {currentLesson.passing_score || 70}%
                    </p>
                    <Button onClick={handleStartEditLesson} className={`${accent.bg} hover:opacity-90`}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Quiz
                    </Button>
                  </div>
                ) : currentLesson.type === 'assignment' ? (
                  <div className="text-center py-8">
                    <ClipboardCheck className={`w-12 h-12 ${accent.text} mx-auto mb-4`} />
                    <h3 className={`text-lg font-semibold mb-2 ${config.headingClass}`}>Assignment: {currentLesson.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">Complete this hands-on exercise</p>
                    <Button className={`${accent.bg} hover:opacity-90`}>View Assignment</Button>
                  </div>
                ) : (
                  // Default text lesson view
                  <div className={`prose prose-invert prose-sm max-w-none ${
                    layoutStyle === 'technical' ? 'font-mono' : ''
                  }`}>
                    {currentLesson.content_markdown ? (
                      <div 
                        className="whitespace-pre-wrap text-foreground/90 cursor-pointer hover:bg-muted/20 rounded-lg p-4 -m-4 transition-colors"
                        onClick={handleStartEditLesson}
                        title="Click to edit content"
                      >
                        {currentLesson.content_markdown}
                      </div>
                    ) : (
                      <div 
                        className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/20 rounded-lg transition-colors"
                        onClick={handleStartEditLesson}
                        title="Click to add content"
                      >
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click to add lesson content...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevLesson}
                disabled={isFirstLesson}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || currentLessonComplete}
                className={currentLessonComplete 
                  ? 'bg-green-600/50 text-white cursor-default'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              >
                {isMarkingComplete ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {currentLessonComplete ? 'Completed' : 'Mark Complete'}
              </Button>
              <Button
                variant="outline"
                onClick={handleNextLesson}
                disabled={isLastLesson}
                className="flex-1 sm:flex-none"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a lesson to preview</p>
          </div>
        )}
      </div>
    </div>
  );

  // Student Dashboard Content
  const renderDashboard = () => {
    const nextLesson = getNextIncompleteLesson();
    const nextModuleIdx = nextLesson 
      ? course.modules.findIndex(m => m.id === nextLesson.moduleId)
      : 0;
    const nextModule = nextModuleIdx >= 0 ? course.modules[nextModuleIdx] : course.modules[0];
    const nextLessonIdx = nextLesson && nextModule
      ? nextModule.lessons.findIndex(l => l.id === nextLesson.lessonId)
      : 0;
    const lessonToShow = nextModule?.lessons[nextLessonIdx >= 0 ? nextLessonIdx : 0];
    
    const isComplete = progressPercent === 100;
    
    return (
      <div className={`space-y-6 p-4 sm:p-6 ${config.containerClass}`}>
        {/* Welcome Message */}
        <div className={`rounded-xl p-6 border ${
          isComplete 
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20'
            : `bg-gradient-to-r from-${config.accentColor}-500/10 to-${config.accentColor}-600/5 ${accent.borderLight}`
        }`}>
          <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${config.headingClass}`}>
            {isComplete ? '🎉 Congratulations!' : `Welcome to ${course.title}!`}
          </h2>
          <p className="text-muted-foreground">
            {isComplete 
              ? `You've completed all ${totalLessons} lessons in this course!`
              : 'Track your progress and continue learning from where you left off.'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <Card className={`${config.cardClass} border-border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${config.headingClass}`}>
              <Award className={`w-5 h-5 ${isComplete ? 'text-green-400' : accent.text}`} />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Course completion</span>
                <span className={`font-medium ${isComplete ? 'text-green-400' : accent.text}`}>
                  {progressPercent}%
                </span>
              </div>
              <Progress 
                value={progressPercent} 
                className={`h-3 ${isComplete ? '[&>div]:bg-green-500' : ''}`} 
              />
              <p className="text-xs text-muted-foreground">
                {isComplete 
                  ? 'All lessons completed! 🎉'
                  : `${totalLessons - completedLessonCount} lessons remaining`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Continue Learning Card */}
        {lessonToShow && !isComplete && (
          <Card className={`${config.cardClass} border-border`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-base ${config.headingClass}`}>
                {completedLessonCount > 0 ? 'Continue Learning' : 'Start Learning'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={handleContinueLearning}
                className={`w-full flex items-center gap-4 p-4 rounded-lg ${accent.bgLight} border ${accent.borderLight} hover:opacity-80 transition-colors text-left touch-manipulation`}
              >
                <div className={`w-16 h-12 rounded ${accent.bgLight} flex items-center justify-center shrink-0`}>
                  <Play className={`w-6 h-6 ${accent.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Module {nextModuleIdx + 1}: {nextModule?.title}
                  </p>
                  <p className="font-medium text-foreground truncate">{lessonToShow.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <LessonTypeIcon type={lessonToShow.type} />
                    <span>{lessonToShow.duration}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* Course Complete Card */}
        {isComplete && (
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="py-6 text-center">
              <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className={`text-lg font-bold mb-2 ${config.headingClass}`}>Course Complete!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                You've mastered all the content in this course
              </p>
              <Button 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={() => handleLessonClick(0, 0)}
              >
                Review Course
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className={`${config.cardClass} border-border`}>
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold ${completedLessonCount > 0 ? 'text-green-400' : 'text-foreground'}`}>
                {completedLessonCount}
              </p>
              <p className="text-xs text-muted-foreground">Lessons Complete</p>
            </CardContent>
          </Card>
          <Card className={`${config.cardClass} border-border`}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Total Lessons</p>
            </CardContent>
          </Card>
          <Card className={`${config.cardClass} border-border`}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{course.modules.length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </CardContent>
          </Card>
          <Card className={`${config.cardClass} border-border`}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total Content</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Progress */}
        <Card className={`${config.cardClass} border-border`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${config.headingClass}`}>
              <BookOpen className={`w-5 h-5 ${accent.text}`} />
              Module Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.modules.map((module, idx) => {
                const modProgress = moduleProgress.find(p => p.moduleId === module.id);
                const isModuleComplete = modProgress?.isComplete;
                return (
                  <div key={module.id} className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium shrink-0 ${
                      isModuleComplete 
                        ? 'bg-green-500/20 text-green-400' 
                        : `${accent.bgLight} ${accent.text}`
                    }`}>
                      {isModuleComplete ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isModuleComplete ? 'text-green-400' : 'text-foreground'}`}>
                        {module.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {modProgress?.completedLessons || 0} of {module.lessons.length} lessons
                      </p>
                    </div>
                    {isModuleComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (modProgress?.completedLessons || 0) > 0 ? (
                      <div className="w-16">
                        <Progress 
                          value={(modProgress?.completedLessons || 0) / module.lessons.length * 100} 
                          className="h-1.5"
                        />
                      </div>
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render separate page content (bonuses, resources, community, testimonials)
  const renderSeparatePage = (pageType: TabType) => {
    const page = course.separatePages?.find(p => p.type === pageType);
    if (!page) return <div className="text-center py-8 text-muted-foreground">Page not available</div>;
    
    const content = page.content as Record<string, unknown>;
    
    switch (pageType) {
      case 'bonuses': {
        const bonuses = (content.bonuses as Array<{ title: string; description: string; value?: string }>) || [];
        return (
          <div className={`space-y-6 ${config.containerClass}`}>
            <h2 className={`text-2xl font-bold ${config.headingClass}`}>{page.title}</h2>
            <div className="grid gap-4">
              {bonuses.map((bonus, idx) => (
                <Card key={idx} className={`${config.cardClass} ${accent.borderLight}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Gift className={`w-8 h-8 ${accent.text} shrink-0`} />
                    <div className="flex-1">
                      <h3 className={`font-semibold ${config.headingClass}`}>{bonus.title}</h3>
                      <p className="text-sm text-muted-foreground">{bonus.description}</p>
                      {bonus.value && <Badge className={`mt-2 ${accent.bgLight} ${accent.text}`}>{bonus.value} value</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }
      
      case 'resources': {
        const resources = (content.resources as Array<{ title: string; description: string; type: string }>) || [];
        return (
          <div className={`space-y-6 ${config.containerClass}`}>
            <h2 className={`text-2xl font-bold ${config.headingClass}`}>{page.title}</h2>
            <div className="grid gap-3">
              {resources.map((res, idx) => (
                <Card key={idx} className={`${config.cardClass}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Download className={`w-5 h-5 ${accent.text}`} />
                    <div className="flex-1">
                      <p className="font-medium">{res.title}</p>
                      <p className="text-xs text-muted-foreground">{res.description}</p>
                    </div>
                    <Badge variant="outline">{res.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }
      
      case 'community': {
        return (
          <div className={`space-y-6 ${config.containerClass}`}>
            <h2 className={`text-2xl font-bold ${config.headingClass}`}>{page.title}</h2>
            <Card className={`${config.cardClass}`}>
              <CardContent className="p-6 text-center">
                <MessageCircle className={`w-12 h-12 mx-auto ${accent.text} mb-4`} />
                <p className="text-muted-foreground">{(content.communityDescription as string) || 'Join our community!'}</p>
                {content.communityFeatures && (
                  <ul className="mt-4 space-y-2">
                    {(content.communityFeatures as string[]).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 justify-center text-sm">
                        <Check className={`w-4 h-4 ${accent.text}`} /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }
      
      case 'testimonials': {
        const testimonials = (content.testimonials as Array<{ name: string; role?: string; quote: string; rating?: number }>) || [];
        return (
          <div className={`space-y-6 ${config.containerClass}`}>
            <h2 className={`text-2xl font-bold ${config.headingClass}`}>{page.title}</h2>
            <div className="grid gap-4">
              {testimonials.map((t, idx) => (
                <Card key={idx} className={`${config.cardClass}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 fill-current ${accent.text}`} />
                      ))}
                    </div>
                    <p className="text-sm italic mb-3">"{t.quote}"</p>
                    <p className={`text-sm font-medium ${config.headingClass}`}>{t.name}</p>
                    {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  const handleLogoFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateLogo) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }
    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `course-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('builder-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('builder-images').getPublicUrl(filePath);
      onUpdateLogo(publicUrl);
      toast.success('Logo uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = '';
    }
  }, [onUpdateLogo]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Hidden logo file input */}
      <input
        ref={logoFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoFileUpload}
      />

      {/* Website Navigation Bar */}
      <header className="flex-shrink-0 border-b border-border/40 bg-background">
        {isMobile ? (
          <div className="px-4 py-2.5 space-y-2">
            <div className="flex items-center gap-3">
              {/* Logo */}
              {isCreatorView ? (
                <button
                  onClick={() => logoFileRef.current?.click()}
                  className="shrink-0 w-8 h-8 rounded-md border border-border/40 bg-muted/20 flex items-center justify-center overflow-hidden hover:border-primary/40 transition-colors"
                  title="Upload logo"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              ) : logoUrl ? (
                <div className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                </div>
              ) : null}

              <Select value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
                <SelectTrigger className="flex-1 bg-card border-border h-9">
                  <SelectValue>
                    {(() => {
                      const tab = TABS.find(t => t.id === activeTab);
                      if (!tab) return null;
                      return <span className="text-sm">{tab.label}</span>;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TABS.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile right actions */}
              {isCreatorView ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab(activeTab === 'pricing' ? 'landing' : 'pricing')}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                      activeTab === 'pricing' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pricing
                  </button>
                  {onOpenPublishSettings && (
                    <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={onOpenPublishSettings}>
                      {isPublished ? 'Settings' : 'Publish'}
                    </Button>
                  )}
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={onSignIn} className="h-7 text-xs">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Desktop: Standard website navbar */
          <div className="flex items-center h-20 px-6">
            {/* Logo - left */}
            <div className="flex items-center gap-3 shrink-0">
              {isCreatorView ? (
                <button
                  onClick={() => logoFileRef.current?.click()}
                  className="shrink-0 w-14 h-14 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-center overflow-hidden hover:border-primary/40 hover:bg-muted/30 transition-all group"
                  title={logoUrl ? "Change logo" : "Upload logo"}
                >
                  {isUploadingLogo ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>
              ) : logoUrl ? (
                <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
              ) : null}
            </div>

            {/* Navigation links - center */}
            <nav className="flex items-center gap-1 flex-1 justify-center">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 shrink-0">
              {isCreatorView ? (
                <>
                  <button
                    onClick={() => setActiveTab(activeTab === 'pricing' ? 'landing' : 'pricing')}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === 'pricing' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pricing
                  </button>

                  {isPublished && onUnpublish && (
                    <button
                      onClick={onUnpublish}
                      disabled={isPublishing}
                      className="text-sm font-medium text-destructive/70 hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      Unpublish
                    </button>
                  )}

                  {onOpenPublishSettings && (
                    <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={onOpenPublishSettings}>
                      <Globe className="w-3.5 h-3.5 mr-1.5" />
                      {isPublished ? 'Publish Settings' : 'Publish'}
                    </Button>
                  )}
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={onSignIn} className="h-8 text-xs">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Tab Content - Isolated Course Preview Container */}
      <div 
        className="flex-1 overflow-auto"
        style={{
          // Isolate course preview from builder UI colors
          ...(hasDesignConfig ? {
            '--course-primary': designColors.primary || '#d4a853',
            '--course-secondary': designColors.secondary || '#1a1a1a',
            '--course-accent': designColors.accent || '#f59e0b',
            '--course-background': designColors.background || '#0a0a0a',
            '--course-card-bg': designColors.cardBackground || '#111111',
            '--course-text': designColors.text || '#ffffff',
            '--course-text-muted': designColors.textMuted || '#9ca3af',
            '--course-spacing': (designConfig.spacing === 'compact' ? '24px' : designConfig.spacing === 'spacious' ? '64px' : '40px'),
            '--course-radius': (designConfig.borderRadius === 'none' ? '0px' : designConfig.borderRadius === 'small' ? '4px' : designConfig.borderRadius === 'large' ? '16px' : '8px'),
            backgroundColor: designColors.background || '#0a0a0a',
            color: designColors.text || '#ffffff',
          } as React.CSSProperties : {}),
        }}
      >
        {activeTab === 'landing' && renderLandingPage()}
        {activeTab === 'curriculum' && renderCurriculum()}
        {activeTab === 'lesson' && renderLessonPreview()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'pricing' && (
          <div className="p-4 sm:p-6">
            <PricingTab
              courseId={course.id}
              priceCents={(course as any).price_cents ?? null}
              currency={(course as any).currency ?? 'USD'}
              onUpdate={(updates) => {
                if (onUpdate) {
                  onUpdate({ ...course, price_cents: updates.price_cents ?? undefined } as any);
                }
              }}
            />
          </div>
        )}
        {['bonuses', 'resources', 'community', 'testimonials'].includes(activeTab) && (
          <div className="p-4 sm:p-6">{renderSeparatePage(activeTab)}</div>
        )}
      </div>

      {/* Visual Edit Mode Indicator */}
      {isVisualEditMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black px-4 py-2 rounded-full font-medium flex items-center gap-2 z-50 shadow-lg text-sm pointer-events-none">
          <Pencil className="w-4 h-4" />
          Visual Edit Mode — Click any element to edit
        </div>
      )}

      {/* Inline Edit Modal */}
      <InlineEditModal target={inlineEditTarget} onClose={() => setInlineEditTarget(null)} />
    </div>
  );
}
