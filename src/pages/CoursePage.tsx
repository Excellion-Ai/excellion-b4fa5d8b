import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CourseModule {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    type: 'video' | 'text' | 'quiz' | 'assignment';
    duration_minutes?: number;
    content?: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  duration_weeks: number | null;
  modules: CourseModule[];
  status: string | null;
  subdomain: string | null;
  published_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function CoursePage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!subdomain) {
        setError('No course subdomain provided');
        setIsLoading(false);
        return;
      }

      console.log('[CoursePage] Fetching course with subdomain:', subdomain);

      // Try subdomain first, fallback to ID for backwards compatibility
      let query = supabase
        .from('courses')
        .select('*')
        .eq('subdomain', subdomain)
        .single();

      let { data, error: fetchError } = await query;

      // If not found by subdomain, try by ID (UUID)
      if (fetchError && subdomain.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const idQuery = await supabase
          .from('courses')
          .select('*')
          .eq('id', subdomain)
          .single();
        
        data = idQuery.data;
        fetchError = idQuery.error;
      }

      if (fetchError) {
        console.error('[CoursePage] Fetch error:', fetchError);
        setError(fetchError.message);
      } else if (data) {
        console.log('[CoursePage] Course JSON fetched:', data);
        const modules = Array.isArray(data.modules) ? (data.modules as unknown as CourseModule[]) : [];
        setCourse({
          ...data,
          modules,
        });
      }

      setIsLoading(false);
    };

    fetchCourse();
  }, [subdomain]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground">The requested course does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <pre className="bg-card border border-border rounded-lg p-6 overflow-auto text-xs font-mono">
          {JSON.stringify(course, null, 2)}
        </pre>
      </div>
    </div>
  );
}
