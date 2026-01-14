import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, BookOpen, GraduationCap, Check, Users, User, Star } from 'lucide-react';
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

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!subdomain) {
        setError('No course subdomain provided');
        setIsLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch published courses by subdomain with new fields
      let { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('status', 'published')
        .single();

      // Fallback to UUID lookup for published courses
      if (fetchError && subdomain.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const idQuery = await supabase
          .from('courses')
          .select('*')
          .eq('id', subdomain)
          .eq('status', 'published')
          .single();
        
        data = idQuery.data;
        fetchError = idQuery.error;
      }

      if (fetchError) {
        setError('Course not found');
        setIsLoading(false);
        return;
      }
      
      if (data) {
        const modules = Array.isArray(data.modules) ? (data.modules as unknown as CourseModule[]) : [];
        const learningOutcomes = (data as any).learningOutcomes || (data as any).learning_outcomes || [];
        setCourse({
          ...data,
          modules,
          learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
        } as Course);

        // Check if user is enrolled
        if (user) {
          const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          setIsEnrolled(!!enrollment);
        }
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
                <p className="text-3xl font-bold text-primary mb-6">
                  {priceText}
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={enrollInCourse}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    course.price_cents && course.price_cents > 0 ? `Enroll for ${priceText}` : 'Enroll for Free'
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