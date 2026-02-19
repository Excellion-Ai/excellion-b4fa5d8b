import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoursePreviewTabs } from '@/components/secret-builder/CoursePreviewTabs';
import { QuickstartLanding } from '@/components/course/QuickstartLanding';
import type { ExtendedCourse, ModuleWithContent, LessonContent } from '@/types/course-pages';

// Helper: map raw DB row to ExtendedCourse
function mapToExtendedCourse(raw: any): ExtendedCourse {
  const rawModules: any[] = Array.isArray(raw.modules) ? raw.modules : [];

  const modules: ModuleWithContent[] = rawModules.map((mod: any, mIdx: number) => {
    const lessons: LessonContent[] = (Array.isArray(mod.lessons) ? mod.lessons : []).map((les: any) => ({
      id: les.id || `lesson-${Math.random()}`,
      title: les.title || 'Untitled Lesson',
      duration: les.duration || les.duration_minutes ? `${les.duration_minutes} min` : '10 min',
      type: les.type || les.content_type || 'text',
      description: les.description,
      is_preview: les.is_preview || false,
      content_markdown: les.content_markdown || les.content,
      video_url: les.video_url,
      quiz_questions: les.quiz_questions,
      passing_score: les.passing_score,
      assignment_brief: les.assignment_brief,
      resources: les.resources,
    }));

    return {
      id: mod.id || `module-${mIdx}`,
      title: mod.title || `Module ${mIdx + 1}`,
      description: mod.description || '',
      lessons,
      is_first: mIdx === 0,
      is_last: mIdx === rawModules.length - 1,
    };
  });

  const pageSections = raw.page_sections as any;
  const designConfig = raw.design_config as any;

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    tagline: raw.tagline,
    difficulty: raw.difficulty || 'beginner',
    duration_weeks: raw.duration_weeks || 0,
    modules,
    learningOutcomes: Array.isArray(raw.learningOutcomes)
      ? raw.learningOutcomes
      : Array.isArray(raw.learning_outcomes)
      ? raw.learning_outcomes
      : [],
    thumbnail: raw.thumbnail_url,
    brand_color: raw.brand_color,
    layout_style: (raw.layout_template || 'creator') as any,
    layout_template: raw.layout_template,
    design_config: designConfig || undefined,
    section_order: raw.section_order as any,
    pages: pageSections
      ? {
          landing_sections: pageSections.landing || [],
          faq: pageSections.faq,
          instructor: pageSections.instructor,
          pricing: raw.price_cents
            ? { price: raw.price_cents / 100, currency: raw.currency || 'USD' }
            : undefined,
        }
      : undefined,
    // pass through db-level fields that CoursePreviewTabs reads via (course as any)
    ...(raw as any),
  } as ExtendedCourse;
}

export default function CoursePage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Track course view (once per session)
  const trackCourseView = async (courseId: string) => {
    const key = `viewed_course_${courseId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');
    const { data: { user } } = await supabase.auth.getUser();
    const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    await supabase.from('course_views').insert({
      course_id: courseId,
      viewer_id: user?.id || null,
      referrer: document.referrer || null,
      device_type: deviceType,
    });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!subdomain) {
        setError('No course subdomain provided');
        setIsLoading(false);
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      setCurrentUser(session?.session?.user || null);

      if (subdomain === 'quickstart' && !userId) {
        navigate(`/auth?redirect=/course/quickstart`);
        return;
      }

      let courseData: any = null;
      let courseError: any = null;

      const publicQuery = await supabase
        .from('public_courses' as any)
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      courseData = publicQuery.data;
      courseError = publicQuery.error;

      if (courseError && subdomain.match(/^[0-9a-f-]{36}$/i)) {
        const idQuery = await supabase
          .from('public_courses' as any)
          .select('*')
          .eq('id', subdomain)
          .single();
        courseData = idQuery.data;
        courseError = idQuery.error;
      }

      if (courseError && userId) {
        const ownerQuery = await supabase
          .from('courses')
          .select('*')
          .eq('subdomain', subdomain)
          .is('deleted_at', null)
          .single();
        if (ownerQuery.data) { courseData = ownerQuery.data; courseError = null; }
        else if (subdomain.match(/^[0-9a-f-]{36}$/i)) {
          const ownerIdQuery = await supabase
            .from('courses')
            .select('*')
            .eq('id', subdomain)
            .is('deleted_at', null)
            .single();
          if (ownerIdQuery.data) { courseData = ownerIdQuery.data; courseError = null; }
        }
      }

      // Auto-seed quickstart
      if ((courseError || !courseData) && subdomain === 'quickstart') {
        try {
          const seedResp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-quickstart`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
          );
          const seedResult = await seedResp.json();
          if (seedResult?.success) {
            const retryQuery = await supabase.from('public_courses' as any).select('*').eq('subdomain', 'quickstart').single();
            if (retryQuery.data) { courseData = retryQuery.data; courseError = null; }
          }
        } catch { }
      }

      if (!courseData) {
        setError(subdomain === 'quickstart' ? 'recovery' : 'Course not found');
        setIsLoading(false);
        return;
      }

      const isOwnerPreview = courseData.user_id === userId && courseData.status !== 'published';
      const canView = courseData.status === 'published' || courseData.user_id === userId;

      if (!canView) {
        setError('Course not found');
        setIsLoading(false);
        return;
      }

      setCourse({ ...courseData, _isOwnerPreview: isOwnerPreview });

      if (!isOwnerPreview) trackCourseView(courseData.id);

      if (userId && !isOwnerPreview) {
        const [enrollmentResult, purchaseResult] = await Promise.all([
          supabase.from('enrollments').select('id').eq('course_id', courseData.id).eq('user_id', userId).maybeSingle(),
          supabase.from('purchases').select('id').eq('course_id', courseData.id).eq('user_id', userId).eq('status', 'completed').maybeSingle(),
        ]);
        setIsEnrolled(!!enrollmentResult.data);
        setHasPurchased(!!purchaseResult.data);
      }

      setIsLoading(false);
    };

    fetchCourse();
  }, [subdomain]);

  const enrollInCourse = async () => {
    if (!course) return;
    if (!currentUser) {
      navigate(`/auth?redirect=/course/${subdomain}`);
      return;
    }
    if (course.price_cents && course.price_cents > 0 && !hasPurchased) {
      startCheckout();
      return;
    }
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('course_id', course.id)
      .maybeSingle();
    if (existing) {
      navigate(`/learn/${course.subdomain || course.id}`);
      return;
    }
    setIsEnrolling(true);
    const { error: insertError } = await supabase.from('enrollments').insert({
      user_id: currentUser.id,
      course_id: course.id,
      progress_percent: 0,
    });
    setIsEnrolling(false);
    if (insertError) { toast.error('Failed to enroll. Please try again.'); return; }
    toast.success('Successfully enrolled!');
    navigate(`/learn/${course.subdomain || course.id}`);
  };

  const startCheckout = async () => {
    if (!course || !currentUser) {
      navigate(`/auth?redirect=/course/${subdomain}`);
      return;
    }
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-course-checkout', {
        body: { course_id: course.id },
      });
      if (error) throw new Error(error.message);
      if (data?.url) window.location.href = data.url;
      else throw new Error('No checkout URL returned');
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    if (error === 'recovery' && subdomain === 'quickstart') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Restoring this course…</h1>
            <p className="text-muted-foreground mb-6">Refresh in 10 seconds.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Button onClick={() => (window.location.href = '/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://excellion.lovable.app/og-image.png';
  const courseUrl = `https://excellion.lovable.app/course/${course.subdomain || course.id}`;

  // Quickstart: keep dedicated landing
  if (subdomain === 'quickstart') {
    return (
      <>
        <Helmet>
          <title>{course.title} | Excellion</title>
          <meta name="description" content={course.description || `Learn ${course.title}`} />
          <meta property="og:title" content={course.title} />
          <meta property="og:description" content={course.description || ''} />
          <meta property="og:image" content={course.thumbnail_url || defaultImage} />
          <meta property="og:url" content={courseUrl} />
        </Helmet>
        <QuickstartLanding
          course={course}
          onEnroll={enrollInCourse}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
        />
      </>
    );
  }

  const extendedCourse = mapToExtendedCourse(course);
  const logoUrl = (course.design_config as any)?.logo_url || undefined;

  return (
    <>
      <Helmet>
        <title>{course.title} | Excellion</title>
        <meta name="description" content={course.description || `Learn ${course.title}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={course.title} />
        <meta property="og:description" content={course.description || ''} />
        <meta property="og:image" content={course.social_image_url || course.thumbnail_url || defaultImage} />
        <meta property="og:url" content={courseUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={course.title} />
        <meta name="twitter:image" content={course.social_image_url || course.thumbnail_url || defaultImage} />
        <link rel="canonical" href={courseUrl} />
      </Helmet>

      {/* Full-height layout matching the builder exactly */}
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Draft Preview Banner */}
        {course._isOwnerPreview && (
          <div className="bg-yellow-600 px-4 py-2 text-center text-sm flex-shrink-0 z-50" style={{ color: '#000' }}>
            <span className="font-medium">Preview mode</span> — your course is not published yet.
            <Button
              variant="link"
              className="ml-4 underline p-0 h-auto text-sm"
              style={{ color: '#000' }}
              onClick={() => navigate(`/secret-builder/${course.id}`)}
            >
              Back to Editor
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <CoursePreviewTabs
            course={extendedCourse}
            isCreatorView={false}
            logoUrl={logoUrl}
            onSignIn={() => navigate(`/auth?redirect=/course/${subdomain}`)}
          />
        </div>
      </div>
    </>
  );
}

