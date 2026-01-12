import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FileText,
  BookOpen,
  Play,
  LayoutDashboard,
  Check,
  Clock,
  ChevronRight,
  ChevronLeft,
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
} from 'lucide-react';
import { ExtendedCourse, ModuleWithContent, LessonContent, calculateModuleDuration, CoursePage } from '@/types/course-pages';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLessonProgress } from '@/hooks/useLessonProgress';

type TabType = 'landing' | 'curriculum' | 'lesson' | 'dashboard' | 'bonuses' | 'resources' | 'community' | 'testimonials';

interface CoursePreviewTabsProps {
  course: ExtendedCourse;
  onUpdate?: (course: ExtendedCourse) => void;
  onPublish?: () => void;
  onRefine?: () => void;
  onOpenSettings?: () => void;
  onPreviewAsStudent?: () => void;
  onDuplicate?: () => void;
  onUploadThumbnail?: () => void;
  isPublishing?: boolean;
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

const LessonTypeIcon = ({ type, size = 'sm' }: { type: string; size?: 'sm' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const icons: Record<string, React.ReactNode> = {
    video: <Video className={sizeClass} />,
    text: <FileText className={sizeClass} />,
    quiz: <HelpCircle className={sizeClass} />,
    assignment: <ClipboardCheck className={sizeClass} />,
  };
  return icons[type] || <FileText className={sizeClass} />;
};

export function CoursePreviewTabs({
  course,
  onUpdate,
  onPublish,
  onRefine,
  onOpenSettings,
  onPreviewAsStudent,
  onDuplicate,
  onUploadThumbnail,
  isPublishing = false,
}: CoursePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const isMobile = useIsMobile();

  // Build dynamic tabs based on course configuration
  const TABS = [...BASE_TABS];
  if (course.separatePages && course.isMultiPage) {
    for (const page of course.separatePages) {
      if (page.isEnabled && PAGE_TYPE_CONFIG[page.type]) {
        const config = PAGE_TYPE_CONFIG[page.type];
        TABS.push({
          id: page.type as TabType,
          label: page.title || config.label,
          icon: config.icon,
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

  const totalMinutes = course.modules.reduce((acc, m) => {
    return acc + m.lessons.reduce((a, l) => {
      const match = l.duration.match(/(\d+)/);
      return a + (match ? parseInt(match[1]) : 0);
    }, 0);
  }, 0);
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

  // Landing Page Content
  const renderLandingPage = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div 
        className="relative rounded-xl overflow-hidden p-6 sm:p-8 md:p-12"
        style={{ 
          background: course.brand_color 
            ? `linear-gradient(135deg, ${course.brand_color}30 0%, hsl(var(--background)) 100%)`
            : 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--background)) 100%)'
        }}
      >
        {course.thumbnail && (
          <div className="absolute inset-0 opacity-20">
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)} Level
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            {course.title}
          </h1>
          {course.tagline && (
            <p className="text-lg sm:text-xl font-medium text-primary mb-4">{course.tagline}</p>
          )}
          <p className="text-muted-foreground mb-6">{course.description}</p>
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
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
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            onClick={() => setActiveTab('curriculum')}
          >
            Enroll Now
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>

      {/* What You'll Learn */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {course.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-foreground/90 text-sm">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Curriculum Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
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
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground text-sm">{module.title}</p>
                    <p className="text-xs text-muted-foreground">{module.lessons.length} lessons</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      {course.pages?.faq && course.pages.faq.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {course.pages.faq.map((faq, idx) => (
                <AccordionItem 
                  key={idx} 
                  value={`faq-${idx}`}
                  className="bg-muted/20 border border-border/50 rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="py-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Ready to Start?</h3>
          <p className="text-muted-foreground mb-6">Join thousands of students already learning</p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            onClick={() => setActiveTab('curriculum')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Enroll Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Curriculum Content
  const renderCurriculum = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{course.title}</h2>
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
            <span className="text-sm font-medium text-primary">{progressPercent}%</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {course.modules.map((module, moduleIdx) => {
          const modProgress = moduleProgress.find(p => p.moduleId === module.id);
          return (
            <Card key={module.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold shrink-0 ${
                    modProgress?.isComplete 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {modProgress?.isComplete ? <Check className="w-4 h-4" /> : moduleIdx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      {modProgress && modProgress.completedLessons > 0 && (
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          {modProgress.completedLessons}/{modProgress.totalLessons}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 ml-11">
                  {module.lessons.map((lesson, lessonIdx) => {
                    const isComplete = isLessonComplete(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(moduleIdx, lessonIdx)}
                        className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors text-left touch-manipulation ${
                          isComplete
                            ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                            : 'bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <LessonTypeIcon type={lesson.type} />
                          )}
                          <span className={`text-sm font-medium ${isComplete ? 'text-green-400' : 'text-foreground'}`}>
                            {lesson.title}
                          </span>
                          {lesson.is_preview && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              Free Preview
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Lesson Preview Content
  const renderLessonPreview = () => (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar - 30% on desktop */}
      <div className="lg:w-[30%] shrink-0">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Course Content</CardTitle>
              <Badge className="text-xs bg-primary/20 text-primary">
                {completedLessonCount}/{totalLessons}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] lg:h-[500px]">
              <div className="p-3 space-y-2">
                {course.modules.map((module, moduleIdx) => {
                  const modProgress = moduleProgress.find(p => p.moduleId === module.id);
                  return (
                    <div key={module.id} className="space-y-1">
                      <p className={`text-xs font-medium px-2 py-1 flex items-center gap-2 ${
                        modProgress?.isComplete ? 'text-green-400' : 'text-muted-foreground'
                      }`}>
                        {modProgress?.isComplete && <CheckCircle2 className="w-3 h-3" />}
                        Module {moduleIdx + 1}: {module.title}
                      </p>
                      {module.lessons.map((lesson, lessonIdx) => {
                        const isActive = moduleIdx === selectedModuleIdx && lessonIdx === selectedLessonIdx;
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
                                ? 'bg-primary/20 text-primary border border-primary/30'
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
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - 70% on desktop */}
      <div className="flex-1 min-w-0 space-y-4">
        {currentLesson ? (
          <>
            {/* Lesson Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Module {selectedModuleIdx + 1} • Lesson {selectedLessonIdx + 1}
                </p>
                <h2 className="text-xl font-bold text-foreground">{currentLesson.title}</h2>
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
            <Card className="bg-card border-border">
              <CardContent className="py-6">
                {currentLesson.type === 'video' ? (
                  <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Video Player</p>
                    </div>
                  </div>
                ) : currentLesson.type === 'quiz' ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Quiz: {currentLesson.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">Test your knowledge</p>
                    <Button className="bg-blue-500 hover:bg-blue-600">Start Quiz</Button>
                  </div>
                ) : currentLesson.type === 'assignment' ? (
                  <div className="text-center py-8">
                    <ClipboardCheck className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Assignment: {currentLesson.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">Complete this hands-on exercise</p>
                    <Button className="bg-purple-500 hover:bg-purple-600">View Assignment</Button>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    {currentLesson.content_markdown ? (
                      <div className="whitespace-pre-wrap text-foreground/90">
                        {currentLesson.content_markdown}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Lesson content will appear here...</p>
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
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className={`rounded-xl p-6 border ${
          isComplete 
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20'
            : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20'
        }`}>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
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
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-primary'}`} />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Course completion</span>
                <span className={`font-medium ${isComplete ? 'text-green-400' : 'text-foreground'}`}>
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
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {completedLessonCount > 0 ? 'Continue Learning' : 'Start Learning'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={handleContinueLearning}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left touch-manipulation"
              >
                <div className="w-16 h-12 rounded bg-primary/20 flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 text-primary" />
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
              <h3 className="text-lg font-bold text-foreground mb-2">Course Complete!</h3>
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
          <Card className="bg-card border-border">
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold ${completedLessonCount > 0 ? 'text-green-400' : 'text-foreground'}`}>
                {completedLessonCount}
              </p>
              <p className="text-xs text-muted-foreground">Lessons Complete</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Total Lessons</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{course.modules.length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total Content</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
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
                        : 'bg-muted text-muted-foreground'
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

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation Bar */}
      <div className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-2">
        {isMobile ? (
          // Mobile: Dropdown Select
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
            <SelectTrigger className="w-full bg-card border-border">
              <SelectValue>
                {(() => {
                  const tab = TABS.find(t => t.id === activeTab);
                  if (!tab) return null;
                  const Icon = tab.icon;
                  return (
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </span>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.id} value={tab.id}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        ) : (
          // Desktop: Horizontal Tabs
          <div className="flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg touch-manipulation ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'landing' && renderLandingPage()}
        {activeTab === 'curriculum' && renderCurriculum()}
        {activeTab === 'lesson' && renderLessonPreview()}
        {activeTab === 'dashboard' && renderDashboard()}
        {['bonuses', 'resources', 'community', 'testimonials'].includes(activeTab) && (
          <div className="space-y-6">
            {course.separatePages?.find(p => p.type === activeTab) ? (
              (() => {
                const page = course.separatePages?.find(p => p.type === activeTab);
                if (!page) return null;
                const content = page.content as Record<string, unknown>;
                
                if (activeTab === 'bonuses') {
                  const bonuses = (content.bonuses as Array<{ title: string; description: string; value?: string }>) || [];
                  return (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">{page.title}</h2>
                      <div className="grid gap-4">
                        {bonuses.map((bonus, idx) => (
                          <Card key={idx} className="bg-card/50 border-primary/20">
                            <CardContent className="p-4 flex items-start gap-4">
                              <Gift className="w-8 h-8 text-primary shrink-0" />
                              <div className="flex-1">
                                <h3 className="font-semibold">{bonus.title}</h3>
                                <p className="text-sm text-muted-foreground">{bonus.description}</p>
                                {bonus.value && <Badge className="mt-2 bg-primary/20">{bonus.value} value</Badge>}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                if (activeTab === 'resources') {
                  const resources = (content.resources as Array<{ title: string; description: string; type: string }>) || [];
                  return (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">{page.title}</h2>
                      <div className="grid gap-3">
                        {resources.map((res, idx) => (
                          <Card key={idx} className="bg-card/50">
                            <CardContent className="p-4 flex items-center gap-4">
                              <Download className="w-5 h-5 text-primary" />
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
                
                if (activeTab === 'community') {
                  return (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">{page.title}</h2>
                      <Card className="bg-card/50">
                        <CardContent className="p-6 text-center">
                          <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                          <p className="text-muted-foreground">{(content.communityDescription as string) || 'Join our community!'}</p>
                          {content.communityFeatures && (
                            <ul className="mt-4 space-y-2">
                              {(content.communityFeatures as string[]).map((f, i) => (
                                <li key={i} className="flex items-center gap-2 justify-center text-sm">
                                  <Check className="w-4 h-4 text-green-500" /> {f}
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                }
                
                if (activeTab === 'testimonials') {
                  const testimonials = (content.testimonials as Array<{ name: string; role?: string; quote: string; rating?: number }>) || [];
                  return (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">{page.title}</h2>
                      <div className="grid gap-4">
                        {testimonials.map((t, idx) => (
                          <Card key={idx} className="bg-card/50">
                            <CardContent className="p-4">
                              <div className="flex gap-1 mb-2">
                                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                ))}
                              </div>
                              <p className="text-sm italic mb-3">"{t.quote}"</p>
                              <p className="text-sm font-medium">{t.name}</p>
                              {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()
            ) : (
              <div className="text-center py-8 text-muted-foreground">Page not available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
