import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, Eye, Users, Trophy, Clock, TrendingUp, Monitor, Smartphone, Tablet, 
  ArrowLeft, ExternalLink, Award, Download, CheckCircle, UserCheck, UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, parseISO, startOfDay, differenceInDays } from 'date-fns';

interface CourseData {
  id: string;
  title: string;
  subdomain: string | null;
  status: string | null;
  modules: any;
  created_at: string;
  published_at: string | null;
}

interface CourseView {
  id: string;
  created_at: string;
  device_type: string | null;
  referrer: string | null;
}

interface Enrollment {
  id: string;
  user_id: string;
  progress_percent: number | null;
  enrolled_at: string | null;
  completed_at: string | null;
}

interface LessonView {
  id: string;
  lesson_id: string;
  time_spent_seconds: number | null;
  created_at: string;
}

interface Certificate {
  id: string;
  student_name: string;
  issued_at: string;
}

interface LessonProgress {
  lesson_id: string;
  module_id: string;
  completed: boolean;
  enrollment_id: string;
}

type DateRange = '7' | '30' | '90' | 'all';

export default function CourseDetailAnalytics() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [views, setViews] = useState<CourseView[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lessonViews, setLessonViews] = useState<LessonView[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 20;

  useEffect(() => {
    const fetchCourseAnalytics = async () => {
      if (!courseId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth?redirect=/dashboard/analytics/' + courseId);
        return;
      }

      // Fetch course details
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, subdomain, status, modules, created_at, published_at')
        .eq('id', courseId)
        .eq('user_id', user.id)
        .single();

      if (!courseData) {
        navigate('/dashboard/analytics');
        return;
      }

      setCourse(courseData);

      // Fetch all analytics data in parallel
      const [viewsRes, enrollmentsRes, lessonViewsRes, certsRes, progressRes] = await Promise.all([
        supabase.from('course_views').select('id, created_at, device_type, referrer').eq('course_id', courseId).order('created_at', { ascending: false }),
        supabase.from('enrollments').select('id, user_id, progress_percent, enrolled_at, completed_at').eq('course_id', courseId).order('enrolled_at', { ascending: false }),
        supabase.from('lesson_views').select('id, lesson_id, time_spent_seconds, created_at').eq('course_id', courseId),
        supabase.from('certificates').select('id, student_name, issued_at').eq('course_id', courseId),
        supabase.from('lesson_progress').select('lesson_id, module_id, completed, enrollment_id'),
      ]);

      setViews(viewsRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
      setLessonViews(lessonViewsRes.data || []);
      setCertificates(certsRes.data || []);

      // Filter lesson progress for this course's enrollments
      const enrollmentIds = (enrollmentsRes.data || []).map(e => e.id);
      const filteredProgress = (progressRes.data || []).filter(p => enrollmentIds.includes(p.enrollment_id));
      setLessonProgress(filteredProgress);

      setIsLoading(false);
    };

    fetchCourseAnalytics();
  }, [courseId, navigate]);

  // Filter data by date range
  const filterByDate = <T extends { created_at?: string; enrolled_at?: string | null }>(data: T[], dateField: keyof T) => {
    if (dateRange === 'all') return data;
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return data.filter(item => {
      const dateValue = item[dateField] as string | null;
      return dateValue && new Date(dateValue) >= cutoff;
    });
  };

  const filteredViews = useMemo(() => filterByDate(views, 'created_at'), [views, dateRange]);
  const filteredEnrollments = useMemo(() => filterByDate(enrollments, 'enrolled_at'), [enrollments, dateRange]);
  const filteredLessonViews = useMemo(() => filterByDate(lessonViews, 'created_at'), [lessonViews, dateRange]);

  // Get all lessons from curriculum
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    const modules = Array.isArray(course.modules) ? course.modules : [];
    const lessons: { id: string; title: string; moduleName: string; order: number }[] = [];
    let order = 0;
    
    modules.forEach((module: any) => {
      const moduleLessons = module.lessons || [];
      moduleLessons.forEach((lesson: any) => {
        lessons.push({
          id: lesson.id || lesson.slug || `lesson-${order}`,
          title: lesson.title || `Lesson ${order + 1}`,
          moduleName: module.title || 'Module',
          order: order++,
        });
      });
    });
    
    return lessons;
  }, [course?.modules]);

  // Overview stats
  const stats = useMemo(() => {
    const totalViews = filteredViews.length;
    const totalEnrollments = filteredEnrollments.length;
    const completedEnrollments = filteredEnrollments.filter(e => e.progress_percent === 100).length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const avgProgress = totalEnrollments > 0 
      ? Math.round(filteredEnrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / totalEnrollments) 
      : 0;
    const totalCertificates = certificates.length;

    return { totalViews, totalEnrollments, completionRate, avgProgress, totalCertificates };
  }, [filteredViews, filteredEnrollments, certificates]);

  // Views chart data
  const viewsChartData = useMemo(() => {
    const days = parseInt(dateRange === 'all' ? '30' : dateRange);
    const data: { date: string; views: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayViews = filteredViews.filter(v => format(parseISO(v.created_at), 'yyyy-MM-dd') === dateStr).length;
      data.push({ date: format(date, 'MMM d'), views: dayViews });
    }
    
    return data;
  }, [filteredViews, dateRange]);

  // Enrollments chart data
  const enrollmentsChartData = useMemo(() => {
    const days = parseInt(dateRange === 'all' ? '30' : dateRange);
    const data: { date: string; enrollments: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEnrollments = filteredEnrollments.filter(e => 
        e.enrolled_at && format(parseISO(e.enrolled_at), 'yyyy-MM-dd') === dateStr
      ).length;
      data.push({ date: format(date, 'MMM d'), enrollments: dayEnrollments });
    }
    
    return data;
  }, [filteredEnrollments, dateRange]);

  // Lesson performance data
  const lessonPerformance = useMemo(() => {
    return allLessons.map(lesson => {
      const lessonViewsForLesson = filteredLessonViews.filter(lv => lv.lesson_id === lesson.id);
      const avgTime = lessonViewsForLesson.length > 0
        ? Math.round(lessonViewsForLesson.reduce((sum, lv) => sum + (lv.time_spent_seconds || 0), 0) / lessonViewsForLesson.length / 60)
        : 0;
      const completedCount = lessonProgress.filter(p => p.lesson_id === lesson.id && p.completed).length;
      const completionRate = filteredEnrollments.length > 0 
        ? Math.round((completedCount / filteredEnrollments.length) * 100) 
        : 0;

      return {
        ...lesson,
        views: lessonViewsForLesson.length,
        avgTime,
        completionRate,
      };
    });
  }, [allLessons, filteredLessonViews, lessonProgress, filteredEnrollments]);

  // Student funnel data
  const funnelData = useMemo(() => {
    const totalStudents = filteredEnrollments.length;
    if (totalStudents === 0 || allLessons.length === 0) return [];

    return allLessons.map(lesson => {
      const studentsReached = lessonProgress.filter(p => p.lesson_id === lesson.id).length;
      const percentage = Math.round((studentsReached / totalStudents) * 100);
      return {
        name: lesson.title,
        students: studentsReached,
        percentage,
      };
    });
  }, [allLessons, lessonProgress, filteredEnrollments]);

  // Student list with status
  const studentList = useMemo(() => {
    return filteredEnrollments.map(e => {
      const isCompleted = e.progress_percent === 100;
      let status: 'completed' | 'active' | 'inactive' = 'inactive';
      
      if (isCompleted) {
        status = 'completed';
      } else if (e.enrolled_at) {
        const daysSinceEnroll = differenceInDays(new Date(), new Date(e.enrolled_at));
        status = daysSinceEnroll <= 7 ? 'active' : 'inactive';
      }

      return {
        id: e.id,
        userId: e.user_id,
        enrolledAt: e.enrolled_at,
        progress: e.progress_percent || 0,
        status,
      };
    });
  }, [filteredEnrollments]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * studentsPerPage;
    return studentList.slice(start, start + studentsPerPage);
  }, [studentList, studentPage]);

  const totalStudentPages = Math.ceil(studentList.length / studentsPerPage);

  // Device breakdown
  const deviceBreakdown = useMemo(() => {
    const total = filteredViews.length;
    if (total === 0) return { desktop: 0, mobile: 0, tablet: 0 };

    const desktop = filteredViews.filter(v => v.device_type === 'desktop').length;
    const mobile = filteredViews.filter(v => v.device_type === 'mobile').length;
    const tablet = filteredViews.filter(v => v.device_type === 'tablet').length;

    return {
      desktop: Math.round((desktop / total) * 100),
      mobile: Math.round((mobile / total) * 100),
      tablet: Math.round((tablet / total) * 100),
    };
  }, [filteredViews]);

  // Traffic sources
  const trafficSources = useMemo(() => {
    const total = filteredViews.length;
    if (total === 0) return [];

    const sourceMap = new Map<string, number>();
    
    filteredViews.forEach(v => {
      let source = 'Direct';
      if (v.referrer) {
        if (v.referrer.includes('google')) source = 'Google';
        else if (v.referrer.includes('facebook')) source = 'Facebook';
        else if (v.referrer.includes('twitter') || v.referrer.includes('x.com')) source = 'Twitter/X';
        else if (v.referrer.includes('linkedin')) source = 'LinkedIn';
        else source = 'Other';
      }
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    return Array.from(sourceMap.entries())
      .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredViews]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: { type: string; message: string; date: Date; icon: string }[] = [];
    
    filteredEnrollments.slice(0, 10).forEach(e => {
      if (e.enrolled_at) {
        activities.push({
          type: 'enrollment',
          message: 'New student enrolled',
          date: new Date(e.enrolled_at),
          icon: 'user',
        });
      }
      if (e.completed_at) {
        activities.push({
          type: 'completion',
          message: 'Course completed',
          date: new Date(e.completed_at),
          icon: 'trophy',
        });
      }
    });

    certificates.slice(0, 5).forEach(c => {
      activities.push({
        type: 'certificate',
        message: `Certificate issued to ${c.student_name}`,
        date: new Date(c.issued_at),
        icon: 'award',
      });
    });

    filteredViews.slice(0, 5).forEach(v => {
      activities.push({
        type: 'view',
        message: 'Course page viewed',
        date: new Date(v.created_at),
        icon: 'eye',
      });
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);
  }, [filteredEnrollments, filteredViews, certificates]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const exportToCSV = () => {
    const data = studentList.map(s => ({
      user_id: s.userId,
      enrolled_at: s.enrolledAt || '',
      progress_percent: s.progress,
      status: s.status,
    }));

    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = headers + '\n' + rows.join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course?.title || 'course'}-students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>{course.title} Analytics | Excellion</title></Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/analytics')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Course Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportToCSV} disabled={studentList.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/course/${course.subdomain || course.id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Course
            </Button>
            
            {/* Date Range Filter */}
            <div className="flex gap-1">
              {(['7', '30', '90', 'all'] as DateRange[]).map(range => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className={dateRange === range ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  {range === 'all' ? 'All' : `${range}d`}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrollments</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalEnrollments.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold text-primary">{stats.completionRate}%</p>
                </div>
                <Trophy className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalCertificates}</p>
                </div>
                <Award className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-3xl font-bold text-primary">{stats.avgProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Views Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Views Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Enrollments Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Enrollments Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Performance Table */}
        {lessonPerformance.length > 0 && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Lesson Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessonPerformance.map((lesson, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell className="text-muted-foreground">{lesson.moduleName}</TableCell>
                      <TableCell className="text-right">{lesson.views}</TableCell>
                      <TableCell className="text-right">{lesson.avgTime} min</TableCell>
                      <TableCell className="text-right">{lesson.completionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Student Progress Funnel */}
        {funnelData.length > 0 && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Student Progress Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      width={150}
                      tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [value, name === 'students' ? 'Students' : name]}
                    />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student List */}
        {studentList.length > 0 && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Enrolled Students ({studentList.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-xs">{student.userId.slice(0, 8)}...</TableCell>
                      <TableCell>{student.enrolledAt ? format(parseISO(student.enrolledAt), 'MMM d, yyyy') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={student.progress} className="h-2 w-24" />
                          <span className="text-sm text-muted-foreground">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={student.status === 'completed' ? 'default' : student.status === 'active' ? 'secondary' : 'outline'}
                          className={student.status === 'completed' ? 'bg-green-600' : ''}
                        >
                          {student.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {student.status === 'active' && <UserCheck className="h-3 w-3 mr-1" />}
                          {student.status === 'inactive' && <UserX className="h-3 w-3 mr-1" />}
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalStudentPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                    disabled={studentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground py-2">
                    Page {studentPage} of {totalStudentPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
                    disabled={studentPage === totalStudentPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Device Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-primary" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <span className="text-sm font-medium">{deviceBreakdown.desktop}%</span>
                  </div>
                  <Progress value={deviceBreakdown.desktop} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-chart-2" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <span className="text-sm font-medium">{deviceBreakdown.mobile}%</span>
                  </div>
                  <Progress value={deviceBreakdown.mobile} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4 text-chart-3" />
                      <span className="text-sm">Tablet</span>
                    </div>
                    <span className="text-sm font-medium">{deviceBreakdown.tablet}%</span>
                  </div>
                  <Progress value={deviceBreakdown.tablet} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {trafficSources.length > 0 ? (
                <div className="space-y-4">
                  {trafficSources.map(source => (
                    <div key={source.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{source.name}</span>
                        <span className="text-sm text-muted-foreground">{source.count} ({source.percent}%)</span>
                      </div>
                      <Progress value={source.percent} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No traffic data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        activity.type === 'completion' || activity.type === 'certificate' ? 'bg-green-500' :
                        activity.type === 'enrollment' ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
