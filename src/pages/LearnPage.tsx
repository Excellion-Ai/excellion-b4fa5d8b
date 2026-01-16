import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, ChevronLeft, ChevronRight, Circle, Trophy, Star, Award, MessageSquare, FileText, PlayCircle, Film, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CourseReviewForm } from '@/components/course';
import { VideoPlayer } from '@/components/video';
import { QuizPlayer } from '@/components/quiz';
import { ResourceManager } from '@/components/resources';
import type { QuizQuestion } from '@/types/course-pages';

interface Lesson {
  id: string;
  title: string;
  content_markdown?: string;
  content?: string;
  duration?: string;
  type?: 'text' | 'video' | 'text_video' | 'quiz' | 'assignment';
  video_url?: string;
  quiz_questions?: QuizQuestion[];
  passing_score?: number;
}

interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  subdomain: string | null;
  modules: CourseModule[];
}

export default function LearnPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  
  // Progress tracking state
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Lesson view tracking state
  const lessonStartTimeRef = useRef<number | null>(null);
  const currentLessonViewIdRef = useRef<string | null>(null);
  const [lessonResourceCounts, setLessonResourceCounts] = useState<Record<string, number>>({});

  // Calculate total lessons
  const totalLessons = useMemo(() => {
    if (!course) return 0;
    return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  }, [course]);

  // Calculate progress percent
  const progressPercent = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.length / totalLessons) * 100);
  }, [completedLessons.length, totalLessons]);

  // Flat lesson list for navigation
  const flatLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((m, mi) => 
      m.lessons.map((l, li) => ({ moduleIndex: mi, lessonIndex: li, lesson: l, moduleId: m.id }))
    );
  }, [course]);

  const currentFlatIndex = flatLessons.findIndex(
    f => f.moduleIndex === selectedModuleIndex && f.lessonIndex === selectedLessonIndex
  );

  // Fetch course, enrollment, and progress
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/auth?redirect=/learn/${slug}`);
        return;
      }
      setCurrentUserId(user.id);

      // Fetch course by subdomain
      let { data: courseData, error } = await supabase
        .from('courses')
        .select('id, title, subdomain, modules')
        .eq('subdomain', slug)
        .single();

      // Fallback to UUID lookup
      if (error && slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const idQuery = await supabase
          .from('courses')
          .select('id, title, subdomain, modules')
          .eq('id', slug)
          .single();
        courseData = idQuery.data;
        error = idQuery.error;
      }

      if (error || !courseData) {
        navigate('/');
        return;
      }

      const parsedCourse = {
        ...courseData,
        modules: Array.isArray(courseData.modules) ? (courseData.modules as unknown as CourseModule[]) : [],
      };

      // Fetch enrollment with progress data
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, progress_percent')
        .eq('course_id', courseData.id)
        .eq('user_id', user.id)
        .single();

      if (!enrollment) {
        navigate(`/course/${slug}`);
        return;
      }

      setEnrollmentId(enrollment.id);

      // Fetch completed lessons
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('enrollment_id', enrollment.id);

      if (progressData) {
        setCompletedLessons(progressData.map(p => p.lesson_id));
      }

      // Check for existing certificate
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('id')
        .eq('enrollment_id', enrollment.id)
        .maybeSingle();

      if (existingCert) {
        setCertificateId(existingCert.id);
      }

      setCourse(parsedCourse);
      setIsLoading(false);
    };

    fetchData();
  }, [slug, navigate]);

  // Track lesson view and time spent
  const trackLessonView = useCallback(async (courseId: string, lessonId: string, enrId: string | null, userId: string | null) => {
    const { data } = await supabase.from('lesson_views').insert({
      course_id: courseId,
      lesson_id: lessonId,
      viewer_id: userId,
      enrollment_id: enrId,
      time_spent_seconds: 0,
    }).select('id').single();
    
    return data?.id || null;
  }, []);

  const updateTimeSpent = useCallback(async (viewId: string | null, seconds: number) => {
    if (!viewId || seconds < 1) return;
    await supabase.from('lesson_views').update({ time_spent_seconds: Math.round(seconds) }).eq('id', viewId);
  }, []);

  // Track lesson changes and time spent
  useEffect(() => {
    if (!course || !currentUserId) return;

    const currentLesson = course.modules[selectedModuleIndex]?.lessons[selectedLessonIndex];
    if (!currentLesson) return;

    // Save time from previous lesson
    const prevViewId = currentLessonViewIdRef.current;
    const prevStartTime = lessonStartTimeRef.current;
    if (prevViewId && prevStartTime) {
      const seconds = (Date.now() - prevStartTime) / 1000;
      updateTimeSpent(prevViewId, seconds);
    }

    // Track new lesson view
    lessonStartTimeRef.current = Date.now();
    trackLessonView(course.id, currentLesson.id, enrollmentId, currentUserId).then(viewId => {
      currentLessonViewIdRef.current = viewId;
    });
  }, [course, selectedModuleIndex, selectedLessonIndex, currentUserId, enrollmentId, trackLessonView, updateTimeSpent]);

  // Handle page unload to save time
  useEffect(() => {
    const handleBeforeUnload = () => {
      const viewId = currentLessonViewIdRef.current;
      const startTime = lessonStartTimeRef.current;
      if (viewId && startTime) {
        const seconds = (Date.now() - startTime) / 1000;
        if (seconds > 0) {
          // Use sendBeacon for reliable unload tracking (limited but works)
          const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lesson_views?id=eq.${viewId}`;
          const body = JSON.stringify({ time_spent_seconds: Math.round(seconds) });
          navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Update overall progress
  const updateOverallProgress = useCallback(async (completedArray: string[]) => {
    if (!enrollmentId || totalLessons === 0) return;
    
    const percent = Math.round((completedArray.length / totalLessons) * 100);
    
    await supabase
      .from('enrollments')
      .update({
        progress_percent: percent,
        completed_at: percent === 100 ? new Date().toISOString() : null,
      })
      .eq('id', enrollmentId);

    // Show completion modal and generate certificate when reaching 100%
    if (percent === 100 && progressPercent < 100) {
      setShowCompletionModal(true);
      generateCertificate();
    }
  }, [enrollmentId, totalLessons, progressPercent]);

  // Generate certificate
  const generateCertificate = useCallback(async () => {
    if (!enrollmentId || !course) return;

    setIsGeneratingCert(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for existing certificate
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();

    if (existing) {
      setCertificateId(existing.id);
      setIsGeneratingCert(false);
      return;
    }

    // Generate certificate number
    const certNumber = 'CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const studentName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';

    const { data: newCert, error } = await supabase
      .from('certificates')
      .insert({
        enrollment_id: enrollmentId,
        user_id: user.id,
        course_id: course.id,
        student_name: studentName,
        course_title: course.title,
        certificate_number: certNumber,
      })
      .select('id')
      .single();

    if (!error && newCert) {
      setCertificateId(newCert.id);
    }

    setIsGeneratingCert(false);
  }, [enrollmentId, course]);

  // Get module id for a lesson
  const getModuleIdForLesson = useCallback((lessonId: string): string => {
    if (!course) return 'unknown';
    for (const module of course.modules) {
      if (module.lessons.some(l => l.id === lessonId)) {
        return module.id;
      }
    }
    return 'unknown';
  }, [course]);

  // Mark lesson complete
  const markLessonComplete = useCallback(async (lessonId: string) => {
    if (!enrollmentId || completedLessons.includes(lessonId)) return;

    setIsMarkingComplete(true);

    const moduleId = getModuleIdForLesson(lessonId);

    const { error } = await supabase
      .from('lesson_progress')
      .insert({
        enrollment_id: enrollmentId,
        lesson_id: lessonId,
        module_id: moduleId,
        completed_at: new Date().toISOString(),
      });

    setIsMarkingComplete(false);

    if (error) {
      // Check if it's a duplicate - lesson already completed
      if (error.code === '23505') {
        return;
      }
      toast.error('Failed to save progress');
      return;
    }

    const newCompletedLessons = [...completedLessons, lessonId];
    setCompletedLessons(newCompletedLessons);
    await updateOverallProgress(newCompletedLessons);
    
    toast.success('Lesson completed! 🎉');
  }, [enrollmentId, completedLessons, updateOverallProgress]);

  // Check if lesson is complete
  const isLessonComplete = useCallback((lessonId: string) => {
    return completedLessons.includes(lessonId);
  }, [completedLessons]);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentFlatIndex > 0) {
      const prev = flatLessons[currentFlatIndex - 1];
      setSelectedModuleIndex(prev.moduleIndex);
      setSelectedLessonIndex(prev.lessonIndex);
    }
  };

  const handleNext = () => {
    if (currentFlatIndex < flatLessons.length - 1) {
      const next = flatLessons[currentFlatIndex + 1];
      setSelectedModuleIndex(next.moduleIndex);
      setSelectedLessonIndex(next.lessonIndex);
    }
  };

  const handleSelectLesson = (moduleIndex: number, lessonIndex: number) => {
    setSelectedModuleIndex(moduleIndex);
    setSelectedLessonIndex(lessonIndex);
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentModule = course.modules[selectedModuleIndex];
  const currentLesson = currentModule?.lessons[selectedLessonIndex];
  const lessonContent = currentLesson?.content_markdown || currentLesson?.content || 'No content available.';
  const isCurrentLessonComplete = currentLesson ? isLessonComplete(currentLesson.id) : false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Certificate Banner */}
      {progressPercent === 100 && certificateId && (
        <div className="bg-primary/20 border-b border-primary/30 px-4 py-3 flex items-center justify-center gap-3">
          <Award className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            🎉 Congratulations! You completed this course.
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => navigate(`/certificate/${certificateId}`)}
          >
            View Certificate
          </Button>
        </div>
      )}

      {/* Header with Progress */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/my-courses')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          My Courses
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate">{course.title}</h1>
          <p className="text-xs text-muted-foreground">
            {completedLessons.length} of {totalLessons} lessons complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">{progressPercent}%</span>
          <Progress value={progressPercent} className="w-32 h-2" />
          {progressPercent === 100 && (
            <Trophy className="h-5 w-5 text-primary" />
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-border bg-card shrink-0 hidden md:block">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {course.modules.map((module, mi) => {
                const moduleLessonIds = module.lessons.map(l => l.id);
                const completedInModule = moduleLessonIds.filter(id => completedLessons.includes(id)).length;
                
                return (
                  <div key={module.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Module {mi + 1}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {completedInModule}/{module.lessons.length}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">{module.title}</p>
                    <div className="space-y-1">
                      {module.lessons.map((lesson, li) => {
                        const isActive = mi === selectedModuleIndex && li === selectedLessonIndex;
                        const isComplete = isLessonComplete(lesson.id);
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(mi, li)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                              isActive 
                                ? "bg-primary/20 text-primary border border-primary/30" 
                                : "hover:bg-secondary/50 text-foreground"
                            )}
                          >
                            {isComplete ? (
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className={cn("truncate flex-1", isComplete && "text-muted-foreground")}>
                              {lesson.title}
                            </span>
                            {lessonResourceCounts[lesson.id] > 0 && (
                              <span title="Has downloadable resources">
                                <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              {isCurrentLessonComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                  <Check className="h-3 w-3" />
                  Completed
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-6">{currentLesson?.title}</h2>
            
            {/* Quiz content */}
            {currentLesson?.type === 'quiz' && currentLesson?.quiz_questions && currentLesson.quiz_questions.length > 0 ? (
              <QuizPlayer
                lessonTitle={currentLesson.title}
                questions={currentLesson.quiz_questions}
                passingScore={currentLesson.passing_score || 70}
                onComplete={async (score, passed) => {
                  if (passed && currentLesson) {
                    await markLessonComplete(currentLesson.id);
                  }
                }}
                onContinue={handleNext}
              />
            ) : (
              <>
                {/* Video content */}
                {(currentLesson?.type === 'video' || currentLesson?.type === 'text_video') && currentLesson?.video_url && (
                  <div className="mb-6">
                    <VideoPlayer url={currentLesson.video_url} />
                  </div>
                )}

                {/* Text content */}
                {currentLesson?.type !== 'video' && currentLesson?.type !== 'quiz' && (
                  <div className="prose prose-invert max-w-none mb-8">
                    <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                      {lessonContent}
                    </div>
                  </div>
                )}

                {/* Lesson Resources */}
                {course && currentLesson && currentLesson.type !== 'quiz' && (
                  <ResourceManager
                    courseId={course.id}
                    lessonId={currentLesson.id}
                    isEditing={false}
                    onResourcesChange={(count) => {
                      setLessonResourceCounts(prev => ({
                        ...prev,
                        [currentLesson.id]: count,
                      }));
                    }}
                  />
                )}
              </>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentFlatIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {!isCurrentLessonComplete ? (
                <Button 
                  onClick={() => currentLesson && markLessonComplete(currentLesson.id)} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isMarkingComplete}
                >
                  {isMarkingComplete ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Mark Complete
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="border-green-500/30 text-green-500 cursor-default"
                  disabled
                >
                  <Check className="h-4 w-4 mr-1" />
                  Completed
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentFlatIndex === flatLessons.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Review Form - Show when course is 50%+ complete */}
            {progressPercent >= 50 && enrollmentId && currentUserId && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Share Your Feedback</h3>
                  </div>
                  {!showReviewForm && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Leave a Review
                    </Button>
                  )}
                </div>
                {showReviewForm && (
                  <CourseReviewForm
                    courseId={course.id}
                    enrollmentId={enrollmentId}
                    userId={currentUserId}
                    hasCompletedCourse={progressPercent === 100}
                    onReviewSubmitted={() => setShowReviewForm(false)}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Course Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Trophy className="h-16 w-16 text-primary" />
                  <Star className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
              🎉 Course Completed!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Congratulations! You've completed all lessons in <strong>{course.title}</strong>.
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              <span className="font-semibold">{totalLessons} lessons completed</span>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              {certificateId && (
                <Button 
                  onClick={() => navigate(`/certificate/${certificateId}`)}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Award className="h-4 w-4" />
                  View Certificate
                </Button>
              )}
              {isGeneratingCert && (
                <Button disabled className="bg-primary/50 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Certificate...
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => setShowCompletionModal(false)}
              >
                Continue Reviewing
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/my-courses')}
              >
                Back to My Courses
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
