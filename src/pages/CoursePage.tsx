import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, BookOpen, GraduationCap, Check, Users, User, Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CourseReviews } from '@/components/course';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration_minutes?: number;
  duration?: string;
  content?: string;
  is_preview?: boolean;
  content_type?: string;
}

interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  duration_weeks: number | null;
  modules: CourseModule[];
  learningOutcomes?: string[];
  status: string | null;
  subdomain: string | null;
  published_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  price_cents: number | null;
  currency: string | null;
  instructor_name: string | null;
  instructor_bio: string | null;
  total_students: number | null;
  average_rating: number | null;
  review_count: number;
  _isOwnerPreview?: boolean;
}

const LessonTypeIcon = ({ type, contentType }: { type: string; contentType?: string }) => {
  const displayType = contentType || type;
  const icons: Record<string, React.ReactNode> = {
    video: <span className="text-base">🎥</span>,
    text: <span className="text-base">📖</span>,
    quiz: <span className="text-base">❓</span>,
    assignment: <span className="text-base">📝</span>,
  };
  return icons[displayType] || <span className="text-base">📖</span>;
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colors: Record<string, string> = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <Badge className={colors[difficulty?.toLowerCase()] || colors.beginner}>
      {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Beginner'}
    </Badge>
  );
};

const formatPrice = (cents: number | null, currency: string | null) => {
  if (!cents || cents === 0) return 'Free';
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  return `${symbols[currency || 'USD'] || '$'}${(cents / 100).toFixed(0)}`;
};

export default function CoursePage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
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
    const referrer = document.referrer || null;

    await supabase.from('course_views').insert({
      course_id: courseId,
      viewer_id: user?.id || null,
      referrer,
      device_type: deviceType,
    });
  };

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!subdomain) {
        setError('No course subdomain provided');
        setIsLoading(false);
        return;
      }

      console.log("Loading course with slug:", subdomain);

      // Get current user session
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      console.log("Current user:", userId);
      setCurrentUser(session?.session?.user || null);

      // Protect the quickstart course — require login
      if (subdomain === 'excellion-quickstart' && !userId) {
        navigate(`/auth?redirect=/course/excellion-quickstart`);
        return;
      }

      // First, try to find the course by subdomain (regardless of status)
      let { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('subdomain', subdomain)
        .is('deleted_at', null)
        .single();

      console.log("Course data (by subdomain):", courseData);
      console.log("Course error (by subdomain):", courseError);

      // Fallback: try by UUID if subdomain lookup failed
      if (courseError && subdomain.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const idQuery = await supabase
          .from('courses')
          .select('*')
          .eq('id', subdomain)
          .is('deleted_at', null)
          .single();
        
        courseData = idQuery.data;
        courseError = idQuery.error;
        console.log("Course data (by UUID):", courseData);
        console.log("Course error (by UUID):", courseError);
      }

      // If no course found at all
      if (courseError || !courseData) {
        console.error("Course not found:", courseError);
        setError('Course not found');
        setIsLoading(false);
        return;
      }

      console.log("Course user_id:", courseData.user_id);
      console.log("Course status:", courseData.status);

      // Check if user can view this course
      // Allow if: course is published OR user is the creator
      const isOwnerPreview = courseData.user_id === userId && courseData.status !== 'published';
      const canView = courseData.status === 'published' || courseData.user_id === userId;

      if (!canView) {
        console.log("User cannot view this course - not published and not owner");
        setError('Course not found');
        setIsLoading(false);
        return;
      }

      const modules = Array.isArray(courseData.modules) ? (courseData.modules as unknown as CourseModule[]) : [];
      const learningOutcomes = (courseData as any).learningOutcomes || (courseData as any).learning_outcomes || [];
      setCourse({
        ...courseData,
        modules,
        learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
        _isOwnerPreview: isOwnerPreview,
      } as Course);

      // Track course view (only for published courses, not owner previews)
      if (!isOwnerPreview) {
        trackCourseView(courseData.id);
      }

      // Check if user is enrolled (only for non-preview scenarios)
      if (userId && !isOwnerPreview) {
        const [enrollmentResult, purchaseResult] = await Promise.all([
          supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', courseData.id)
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('purchases')
            .select('id')
            .eq('course_id', courseData.id)
            .eq('user_id', userId)
            .eq('status', 'completed')
            .maybeSingle()
        ]);
        
        setIsEnrolled(!!enrollmentResult.data);
        setHasPurchased(!!purchaseResult.data);
      }

      setIsLoading(false);
    };

    fetchCourseAndEnrollment();
  }, [subdomain]);

  const enrollInCourse = async () => {
    if (!course) return;

    if (!currentUser) {
      navigate(`/auth?redirect=/course/${subdomain}`);
      return;
    }

    // If course is paid and not purchased, redirect to checkout
    if (course.price_cents && course.price_cents > 0 && !hasPurchased) {
      startCheckout();
      return;
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('course_id', course.id)
      .maybeSingle();

    if (existingEnrollment) {
      navigate(`/learn/${course.subdomain || course.id}`);
      return;
    }

    setIsEnrolling(true);

    const { error: insertError } = await supabase
      .from('enrollments')
      .insert({
        user_id: currentUser.id,
        course_id: course.id,
        progress_percent: 0,
      });

    setIsEnrolling(false);

    if (insertError) {
      toast.error('Failed to enroll. Please try again.');
      return;
    }

    toast.success('Successfully enrolled!');
    navigate(`/learn/${course.subdomain || course.id}`);
  };

  const startCheckout = async () => {
    if (!course) return;

    if (!currentUser) {
      navigate(`/auth?redirect=/course/${subdomain}`);
      return;
    }

    setIsCheckingOut(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-course-checkout', {
        body: { course_id: course.id },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const priceText = formatPrice(course.price_cents, course.currency);

  const defaultImage = "https://excellion.lovable.app/og-image.png";
  const courseUrl = `https://excellion.lovable.app/course/${course.subdomain || course.id}`;

  return (
    <>
      <Helmet>
        <title>{course.title} | Excellion</title>
        <meta name="description" content={course.description || `Learn ${course.title} with our comprehensive course`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={course.title} />
        <meta property="og:description" content={course.description || `Learn ${course.title} with our comprehensive course`} />
        <meta property="og:image" content={course.thumbnail_url || defaultImage} />
        <meta property="og:url" content={courseUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={course.title} />
        <meta name="twitter:description" content={course.description || `Learn ${course.title}`} />
        <meta name="twitter:image" content={course.thumbnail_url || defaultImage} />
        <link rel="canonical" href={courseUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": course.title,
            "description": course.description,
            "provider": {
              "@type": "Organization",
              "name": "Excellion"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-background">
      {/* Draft Preview Banner */}
      {course.status === 'draft' && course._isOwnerPreview && (
        <div className="bg-yellow-600 text-black px-4 py-2 text-center">
          <span className="font-medium">This is a preview.</span> Your course is not published yet.
          <Button 
            variant="link" 
            className="ml-4 text-black underline hover:text-black/80 p-0 h-auto"
            onClick={() => navigate(`/secret-builder/${course.id}`)}
          >
            Back to Editor
          </Button>
        </div>
      )}

      {/* Hero Section with Thumbnail */}
      {course.thumbnail_url && (
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Course Header */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl md:text-4xl">{course.title}</CardTitle>
            {course.description && (
              <p className="text-lg text-muted-foreground mt-2">{course.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <DifficultyBadge difficulty={course.difficulty || 'beginner'} />
              {course.duration_weeks && (
                <Badge variant="outline" className="gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {course.duration_weeks} weeks
                </Badge>
              )}
              <Badge variant="outline" className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {course.modules.length} modules
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {totalLessons} lessons
              </Badge>
              {(course.total_students ?? 0) > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {course.total_students} students
                </Badge>
              )}
              {course.average_rating && course.review_count > 0 && (
                <Badge variant="outline" className="gap-1.5 text-primary border-primary/30">
                  <Star className="w-3.5 h-3.5 fill-primary" />
                  {course.average_rating.toFixed(1)} ({course.review_count} reviews)
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Instructor Section */}
        {course.instructor_name && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Your Instructor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {course.instructor_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{course.instructor_name}</h3>
                  {course.instructor_bio && (
                    <p className="text-muted-foreground mt-1">{course.instructor_bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Outcomes */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 md:grid-cols-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Course Curriculum */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Course Curriculum</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-3">
              {course.modules.map((module, moduleIdx) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border border-border rounded-lg px-4 bg-muted/20"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-semibold shrink-0">
                        {moduleIdx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">
                          Week {moduleIdx + 1}: {module.title}
                        </p>
                        {module.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {module.lessons.length} lessons • {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-2 pl-11">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <LessonTypeIcon type={lesson.type} contentType={lesson.content_type} />
                            <p className="text-sm font-medium text-foreground">
                              {lesson.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.is_preview && (
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                Preview
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration || `${lesson.duration_minutes || 10} min`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Course Reviews */}
        <CourseReviews 
          courseId={course.id} 
          averageRating={course.average_rating} 
          reviewCount={course.review_count} 
        />

        {/* Enroll CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="py-8 text-center">
            {isEnrolled ? (
              <>
                <h3 className="text-2xl font-bold mb-2">Welcome back!</h3>
                <p className="text-muted-foreground mb-6">
                  You're enrolled in this course. Continue where you left off.
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate(`/learn/${course.subdomain || course.id}`)}
                >
                  Continue Learning
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
                <p className="text-muted-foreground mb-2">
                  Join {course.total_students || 0} students who have already enrolled.
                </p>
                
                {/* Price Display */}
                <div className="mb-6">
                  {course.price_cents && course.price_cents > 0 ? (
                    <p className="text-3xl font-bold text-primary">
                      {priceText}
                    </p>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-1">
                      Free
                    </Badge>
                  )}
                </div>
                
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={enrollInCourse}
                  disabled={isEnrolling || isCheckingOut}
                >
                  {isEnrolling || isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isCheckingOut ? 'Starting checkout...' : 'Enrolling...'}
                    </>
                  ) : course.price_cents && course.price_cents > 0 ? (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now - {priceText}
                    </>
                  ) : (
                    'Enroll Free'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}