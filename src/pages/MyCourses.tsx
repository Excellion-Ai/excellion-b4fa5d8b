import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

interface EnrolledCourse {
  id: string;
  progress_percent: number;
  course: {
    id: string;
    title: string;
    slug?: string;
    subdomain: string | null;
    tagline?: string;
    description: string | null;
    thumbnail_url: string | null;
  };
}

export default function MyCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth?redirect=/my-courses');
        return;
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress_percent,
          courses (
            id,
            title,
            subdomain,
            description,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
      } else if (data) {
        const mapped = data
          .filter((e: any) => e.courses)
          .map((e: any) => ({
            id: e.id,
            progress_percent: e.progress_percent || 0,
            course: {
              id: e.courses.id,
              title: e.courses.title,
              subdomain: e.courses.subdomain,
              description: e.courses.description,
              thumbnail_url: e.courses.thumbnail_url,
            },
          }));
        setEnrollments(mapped);
      }

      setIsLoading(false);
    };

    fetchEnrollments();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground mb-8">Continue learning where you left off</p>

          {enrollments.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't enrolled in any courses yet.
                </p>
                <Button onClick={() => navigate('/')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => {
                const isComplete = enrollment.progress_percent === 100;
                const courseSlug = enrollment.course.subdomain || enrollment.course.id;
                
                return (
                  <Card 
                    key={enrollment.id} 
                    className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors"
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
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {enrollment.course.title}
                        </CardTitle>
                        {isComplete && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      {enrollment.course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {enrollment.course.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress_percent}%</span>
                        </div>
                        <Progress value={enrollment.progress_percent} className="h-2" />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/learn/${courseSlug}`)}
                      >
                        {isComplete ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
