import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, BookOpen, Check, Award, Trophy, CheckCircle, 
  Clock, ArrowRight, Calendar, LayoutDashboard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { format, formatDistanceToNow } from 'date-fns';

interface Certificate {
  id: string;
  course_id: string;
}

interface CourseData {
  id: string;
  title: string;
  subdomain: string | null;
  tagline?: string;
  description: string | null;
  thumbnail_url: string | null;
  modules: any;
}

interface Enrollment {
  id: string;
  progress_percent: number;
  enrolled_at: string;
  course_id: string;
  course: CourseData;
  certificate?: Certificate | null;
}

interface LessonActivity {
  lesson_id: string;
  completed_at: string;
  enrollment_id: string;
  lessonName?: string;
  courseName?: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recentActivity, setRecentActivity] = useState<LessonActivity[]>([]);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth?redirect=/dashboard/student');
        return;
      }

      // Set user name
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
      setUserName(name);

      // Fetch enrollments with course data
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress_percent,
          enrolled_at,
          course_id,
          courses (
            id,
            title,
            subdomain,
            description,
            thumbnail_url,
            modules
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      // Fetch certificates
      const { data: certData } = await supabase
        .from('certificates')
        .select('id, course_id')
        .eq('user_id', user.id);

      // Fetch lesson progress count
      const { count: lessonCount } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('completed', true);

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed_at, enrollment_id')
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (certData) {
        setCertificates(certData);
      }

      if (lessonCount !== null) {
        setTotalLessonsCompleted(lessonCount);
      }

      if (activityData) {
        setRecentActivity(activityData);
      }

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
      } else if (enrollmentData) {
        // Create certificate map by course_id
        const certMap = new Map<string, Certificate>();
        if (certData) {
          certData.forEach((cert) => {
            certMap.set(cert.course_id, cert);
          });
        }

        const mapped = enrollmentData
          .filter((e: any) => e.courses)
          .map((e: any) => ({
            id: e.id,
            progress_percent: e.progress_percent || 0,
            enrolled_at: e.enrolled_at,
            course_id: e.course_id,
            certificate: certMap.get(e.course_id) || null,
            course: {
              id: e.courses.id,
              title: e.courses.title,
              subdomain: e.courses.subdomain,
              description: e.courses.description,
              thumbnail_url: e.courses.thumbnail_url,
              modules: e.courses.modules,
            },
          }));
        setEnrollments(mapped);
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [navigate]);

  const inProgressCourses = enrollments.filter(e => e.progress_percent < 100);
  const completedCourses = enrollments.filter(e => e.progress_percent === 100);
  const mostRecentCourse = inProgressCourses[0];

  const getTotalLessons = (modules: any): number => {
    if (!modules || !Array.isArray(modules)) return 0;
    return modules.reduce((acc: number, mod: any) => {
      return acc + (mod.lessons?.length || 0);
    }, 0);
  };

  const getCompletedLessonCount = (enrollment: Enrollment): number => {
    const totalLessons = getTotalLessons(enrollment.course.modules);
    return Math.round((enrollment.progress_percent / 100) * totalLessons);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Excellion</title>
        <meta name="description" content="Your learning dashboard - track progress and continue learning" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {enrollments.length === 0 ? (
            /* Empty State */
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No courses yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Start your learning journey by enrolling in a course. Browse our catalog to find something that interests you.
                </p>
                <Button size="lg" onClick={() => navigate('/')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Course Progress */}
              <div className="lg:col-span-2 space-y-8">
                {/* Continue Learning Card */}
                {mostRecentCourse && (
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-muted-foreground">
                        Continue Where You Left Off
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4">
                        {mostRecentCourse.course.thumbnail_url && (
                          <img
                            src={mostRecentCourse.course.thumbnail_url}
                            alt={mostRecentCourse.course.title}
                            className="w-24 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold mb-1 truncate">
                            {mostRecentCourse.course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {getCompletedLessonCount(mostRecentCourse)} of {getTotalLessons(mostRecentCourse.course.modules)} lessons complete
                          </p>
                          <Progress value={mostRecentCourse.progress_percent} className="h-2 mb-3" />
                        </div>
                      </div>
                      <Button 
                        className="w-full sm:w-auto gap-2"
                        onClick={() => navigate(`/learn/${mostRecentCourse.course.subdomain || mostRecentCourse.course.id}`)}
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* In Progress Courses */}
                {inProgressCourses.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      In Progress
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {inProgressCourses.map((enrollment) => {
                        const courseSlug = enrollment.course.subdomain || enrollment.course.id;
                        const totalLessons = getTotalLessons(enrollment.course.modules);
                        const completedLessons = getCompletedLessonCount(enrollment);
                        
                        return (
                          <Card 
                            key={enrollment.id} 
                            className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1"
                          >
                            {enrollment.course.thumbnail_url && (
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={enrollment.course.thumbnail_url}
                                  alt={enrollment.course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <CardContent className="p-4 space-y-3">
                              <h3 className="font-semibold line-clamp-2">
                                {enrollment.course.title}
                              </h3>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {completedLessons} of {totalLessons} lessons
                                  </span>
                                  <span className="font-medium text-primary">
                                    {enrollment.progress_percent}%
                                  </span>
                                </div>
                                <Progress value={enrollment.progress_percent} className="h-2" />
                              </div>
                              {enrollment.enrolled_at && (
                                <p className="text-xs text-muted-foreground">
                                  Enrolled {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
                                </p>
                              )}
                              <Button 
                                className="w-full"
                                onClick={() => navigate(`/learn/${courseSlug}`)}
                              >
                                Continue
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Courses */}
                {completedCourses.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-green-500" />
                      Completed
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {completedCourses.map((enrollment) => {
                        const courseSlug = enrollment.course.subdomain || enrollment.course.id;
                        
                        return (
                          <Card 
                            key={enrollment.id} 
                            className="bg-card border-border overflow-hidden hover:border-green-500/50 transition-all hover:shadow-lg hover:-translate-y-1"
                          >
                            {enrollment.course.thumbnail_url && (
                              <div className="aspect-video overflow-hidden relative">
                                <img
                                  src={enrollment.course.thumbnail_url}
                                  alt={enrollment.course.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-green-500/90 text-white border-0">
                                    <Check className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                </div>
                              </div>
                            )}
                            <CardContent className="p-4 space-y-3">
                              <h3 className="font-semibold line-clamp-2">
                                {enrollment.course.title}
                              </h3>
                              <p className="text-sm text-green-500 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Course completed
                              </p>
                              <div className="flex flex-col gap-2">
                                {enrollment.certificate && (
                                  <Button 
                                    variant="outline"
                                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
                                    onClick={() => navigate(`/certificate/${enrollment.certificate!.id}`)}
                                  >
                                    <Award className="h-4 w-4" />
                                    View Certificate
                                  </Button>
                                )}
                                <Button 
                                  variant="secondary"
                                  className="w-full"
                                  onClick={() => navigate(`/learn/${courseSlug}`)}
                                >
                                  Review Course
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <Card className="bg-card border-border">
                      <CardContent className="p-4 space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div 
                            key={`${activity.enrollment_id}-${activity.lesson_id}-${index}`}
                            className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                          >
                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                Completed a lesson
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Right Column - Stats Sidebar */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
                
                {/* Courses Enrolled */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">{enrollments.length}</p>
                      <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Courses Completed */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-500">{completedCourses.length}</p>
                      <p className="text-sm text-muted-foreground">Courses Completed</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificates Earned */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-yellow-500">{certificates.length}</p>
                      <p className="text-sm text-muted-foreground">Certificates Earned</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Lessons Completed */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-500">{totalLessonsCompleted}</p>
                      <p className="text-sm text-muted-foreground">Lessons Completed</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <Link 
                      to="/my-courses"
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      View All Courses
                    </Link>
                    {certificates.length > 0 && (
                      <Link 
                        to={`/certificate/${certificates[0].id}`}
                        className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-2"
                      >
                        <Award className="h-4 w-4" />
                        View Certificates
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
