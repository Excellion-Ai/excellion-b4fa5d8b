import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QuickstartLanding } from '@/components/course/QuickstartLanding';

export default function QuickstartCoursePage() {
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      // Fetch quickstart course
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, description, difficulty, modules, price_cents, subdomain')
        .eq('subdomain', 'quickstart')
        .maybeSingle();

      if (!courseData) {
        // Try seed recovery
        try {
          await supabase.functions.invoke('seed-quickstart');
          const { data: retry } = await supabase
            .from('courses')
            .select('id, title, description, difficulty, modules, price_cents, subdomain')
            .eq('subdomain', 'quickstart')
            .maybeSingle();
          if (retry) {
            setCourse({ ...retry, modules: Array.isArray(retry.modules) ? retry.modules : [] });
          }
        } catch {
          // ignore
        }
        setIsLoading(false);
        return;
      }

      const parsed = { ...courseData, modules: Array.isArray(courseData.modules) ? courseData.modules : [] };

      // Check enrollment
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseData.id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (enrollment) {
          setIsEnrolled(true);
        }
      }

      setCourse(parsed);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth?redirect=/course/quickstart');
      return;
    }

    if (isEnrolled) {
      navigate('/course/quickstart');
      return;
    }

    setIsEnrolling(true);

    const { error } = await supabase.from('enrollments').insert({
      course_id: course.id,
      user_id: user.id,
    });

    setIsEnrolling(false);

    if (error) {
      if (error.code === '23505') {
        // Already enrolled
        navigate('/course/quickstart');
        return;
      }
      toast.error('Failed to enroll. Please try again.');
      return;
    }

    toast.success('Enrolled! Let\'s get started 🚀');
    navigate('/course/quickstart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        Course not found
      </div>
    );
  }

  return (
    <QuickstartLanding
      course={course}
      onEnroll={handleEnroll}
      isEnrolled={isEnrolled}
      isEnrolling={isEnrolling}
    />
  );
}
