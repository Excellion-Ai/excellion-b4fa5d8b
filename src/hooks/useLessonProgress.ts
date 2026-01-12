import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LessonProgressItem {
  lesson_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  time_spent_seconds: number;
}

interface ModuleProgress {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  isComplete: boolean;
}

interface UseLessonProgressOptions {
  courseId: string;
  modules: Array<{
    id: string;
    lessons: Array<{ id: string }>;
  }>;
}

export function useLessonProgress({ courseId, modules }: UseLessonProgressOptions) {
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const totalLessons = useMemo(() => 
    modules.reduce((acc, m) => acc + m.lessons.length, 0),
    [modules]
  );

  const progressPercent = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  }, [completedLessons.size, totalLessons]);

  const moduleProgress = useMemo((): ModuleProgress[] => {
    return modules.map(module => {
      const completedInModule = module.lessons.filter(l => 
        completedLessons.has(l.id)
      ).length;
      return {
        moduleId: module.id,
        completedLessons: completedInModule,
        totalLessons: module.lessons.length,
        isComplete: completedInModule === module.lessons.length && module.lessons.length > 0,
      };
    });
  }, [modules, completedLessons]);

  // Initialize enrollment and fetch progress
  useEffect(() => {
    const initializeProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get or create enrollment
        let { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!enrollment) {
          const { data: newEnrollment, error } = await supabase
            .from('enrollments')
            .insert({ course_id: courseId, user_id: user.id })
            .select('id')
            .single();

          if (error) {
            console.error('Error creating enrollment:', error);
            setIsLoading(false);
            return;
          }
          enrollment = newEnrollment;
        }

        setEnrollmentId(enrollment.id);

        // Fetch existing lesson progress
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed')
          .eq('enrollment_id', enrollment.id);

        if (progressData) {
          const completedSet = new Set<string>();
          progressData.forEach(p => {
            if (p.completed) {
              completedSet.add(p.lesson_id);
            }
          });
          setCompletedLessons(completedSet);
        }
      } catch (error) {
        console.error('Error initializing lesson progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      initializeProgress();
    }
  }, [courseId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!enrollmentId) return;

    const channel = supabase
      .channel(`lesson-progress-${enrollmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_progress',
          filter: `enrollment_id=eq.${enrollmentId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new as LessonProgressItem;
            setCompletedLessons(prev => {
              const newSet = new Set(prev);
              if (data.completed) {
                newSet.add(data.lesson_id);
              } else {
                newSet.delete(data.lesson_id);
              }
              return newSet;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enrollmentId]);

  // Update enrollment progress when lessons change
  useEffect(() => {
    if (!enrollmentId) return;

    const updateEnrollmentProgress = async () => {
      await supabase
        .from('enrollments')
        .update({ 
          progress_percent: progressPercent,
          completed_at: progressPercent === 100 ? new Date().toISOString() : null,
        })
        .eq('id', enrollmentId);
    };

    updateEnrollmentProgress();
  }, [enrollmentId, progressPercent]);

  const markLessonComplete = useCallback(async (lessonId: string, moduleId: string) => {
    if (!enrollmentId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to track your progress.',
        variant: 'destructive',
      });
      return false;
    }

    // Optimistic update
    setCompletedLessons(prev => new Set(prev).add(lessonId));

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'enrollment_id,lesson_id',
        });

      if (error) throw error;

      toast({
        title: 'Lesson complete! 🎉',
        description: `${progressPercent + Math.round(100 / totalLessons)}% of course completed`,
      });

      return true;
    } catch (error) {
      // Rollback optimistic update
      setCompletedLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
      console.error('Error marking lesson complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [enrollmentId, progressPercent, totalLessons, toast]);

  const markLessonIncomplete = useCallback(async (lessonId: string) => {
    if (!enrollmentId) return false;

    // Optimistic update
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.delete(lessonId);
      return newSet;
    });

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .update({ completed: false, completed_at: null })
        .eq('enrollment_id', enrollmentId)
        .eq('lesson_id', lessonId);

      if (error) throw error;
      return true;
    } catch (error) {
      // Rollback
      setCompletedLessons(prev => new Set(prev).add(lessonId));
      console.error('Error marking lesson incomplete:', error);
      return false;
    }
  }, [enrollmentId]);

  const isLessonComplete = useCallback((lessonId: string) => {
    return completedLessons.has(lessonId);
  }, [completedLessons]);

  const getNextIncompleteLesson = useCallback(() => {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (!completedLessons.has(lesson.id)) {
          return { moduleId: module.id, lessonId: lesson.id };
        }
      }
    }
    return null;
  }, [modules, completedLessons]);

  return {
    isLoading,
    enrollmentId,
    completedLessons: completedLessons.size,
    totalLessons,
    progressPercent,
    moduleProgress,
    markLessonComplete,
    markLessonIncomplete,
    isLessonComplete,
    getNextIncompleteLesson,
  };
}
