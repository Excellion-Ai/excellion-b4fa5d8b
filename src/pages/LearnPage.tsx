import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  content_markdown?: string;
  content?: string;
  duration?: string;
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
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/auth?redirect=/learn/${slug}`);
        return;
      }

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

      // Check enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!enrollment) {
        navigate(`/course/${slug}`);
        return;
      }

      setIsEnrolled(true);
      setCourse({
        ...courseData,
        modules: Array.isArray(courseData.modules) ? (courseData.modules as unknown as CourseModule[]) : [],
      });
      setIsLoading(false);
    };

    fetchCourseAndEnrollment();
  }, [slug, navigate]);

  const modulesForProgress = useMemo(() => {
    if (!course) return [];
    return course.modules.map(m => ({
      id: m.id,
      lessons: m.lessons.map(l => ({ id: l.id })),
    }));
  }, [course]);

  const {
    progressPercent,
    isLessonComplete,
    markLessonComplete,
    getNextIncompleteLesson,
  } = useLessonProgress({
    courseId: course?.id || '',
    modules: modulesForProgress,
  });

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

  const flatLessons = course.modules.flatMap((m, mi) => 
    m.lessons.map((l, li) => ({ moduleIndex: mi, lessonIndex: li, lesson: l, moduleId: m.id }))
  );
  const currentFlatIndex = flatLessons.findIndex(
    f => f.moduleIndex === selectedModuleIndex && f.lessonIndex === selectedLessonIndex
  );

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

  const handleMarkComplete = () => {
    if (currentLesson && currentModule) {
      markLessonComplete(currentLesson.id, currentModule.id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/my-courses')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          My Courses
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate">{course.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{progressPercent}%</span>
          <Progress value={progressPercent} className="w-24 h-2" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-border bg-card shrink-0 hidden md:block">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {course.modules.map((module, mi) => (
                <div key={module.id}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Module {mi + 1}: {module.title}
                  </h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson, li) => {
                      const isActive = mi === selectedModuleIndex && li === selectedLessonIndex;
                      const isComplete = isLessonComplete(lesson.id);
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setSelectedModuleIndex(mi);
                            setSelectedLessonIndex(li);
                          }}
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
                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">{currentLesson?.title}</h2>
            
            <div className="prose prose-invert max-w-none mb-8">
              <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                {lessonContent}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentFlatIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {!isLessonComplete(currentLesson?.id || '') ? (
                <Button onClick={handleMarkComplete} className="bg-primary hover:bg-primary/90">
                  <Check className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              ) : (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Completed
                </span>
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
          </div>
        </main>
      </div>
    </div>
  );
}
