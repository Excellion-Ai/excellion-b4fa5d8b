import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, BookOpen, Eye, EyeOff, ChevronDown, ChevronRight, Pencil, Check, X } from 'lucide-react';

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  subdomain: string | null;
  status: string | null;
  total_students: number | null;
  created_at: string;
  modules: any[];
}

export default function AdminCourses() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Access denied.');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchCourses();
  }, [isAdmin]);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, subdomain, status, total_students, created_at, modules')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load courses');
    } else {
      setCourses((data || []).map(c => ({
        ...c,
        modules: Array.isArray(c.modules) ? c.modules as any[] : [],
      })));
    }
    setLoading(false);
  };

  const togglePublish = async (course: CourseRow) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('courses')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', course.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Course ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchCourses();
    }
  };

  const saveLessonEdit = async (courseId: string, moduleId: string, lessonId: string, field: string, value: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updatedModules = course.modules.map((m: any) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: m.lessons.map((l: any) => {
          if (l.id !== lessonId) return l;
          return { ...l, [field]: value };
        }),
      };
    });

    const { error } = await supabase
      .from('courses')
      .update({ modules: updatedModules as any })
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Saved');
      setEditingLesson(null);
      fetchCourses();
    }
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Back to Admin
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No courses found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <Card key={course.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandedCourse === course.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.subdomain ? `/course/${course.subdomain}` : 'No slug'} · {course.modules.length} modules · {course.total_students || 0} students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                        {course.status || 'draft'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublish(course)}
                        className="gap-1.5"
                      >
                        {course.status === 'published' ? (
                          <><EyeOff className="h-3.5 w-3.5" /> Unpublish</>
                        ) : (
                          <><Eye className="h-3.5 w-3.5" /> Publish</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedCourse === course.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {course.modules.map((mod: any) => (
                        <div key={mod.id} className="border border-border rounded-lg p-4">
                          <h4 className="font-semibold text-foreground mb-2">{mod.title}</h4>
                          <div className="space-y-2">
                            {(mod.lessons || []).map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center justify-between bg-secondary/20 rounded-md px-3 py-2">
                                {editingLesson === `${course.id}-${lesson.id}` ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <Input
                                      value={editText}
                                      onChange={e => setEditText(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => saveLessonEdit(course.id, mod.id, lesson.id, 'title', editText)}
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => setEditingLesson(null)}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm text-foreground/80">{lesson.title}</span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        setEditingLesson(`${course.id}-${lesson.id}`);
                                        setEditText(lesson.title);
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
