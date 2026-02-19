import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, Users, Trophy, Clock, TrendingUp, Monitor, Smartphone, Tablet, ExternalLink, Sparkles, DollarSign, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, subDays, parseISO, startOfDay } from 'date-fns';

interface Course {
  id: string;
  title: string;
  subdomain: string | null;
  status: string | null;
  created_at: string;
}

interface CourseView {
  id: string;
  course_id: string;
  created_at: string;
  device_type: string | null;
  referrer: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percent: number | null;
  enrolled_at: string | null;
  completed_at: string | null;
}

interface LessonView {
  id: string;
  course_id: string;
  lesson_id: string;
  time_spent_seconds: number | null;
  created_at: string;
}

interface Purchase {
  id: string;
  course_id: string;
  amount_cents: number;
  status: string;
  purchased_at: string;
}

type DateRange = '7' | '30' | '90' | 'all';

export default function CreatorAnalytics() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [views, setViews] = useState<CourseView[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lessonViews, setLessonViews] = useState<LessonView[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30');

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth?redirect=/dashboard/analytics');
        return;
      }

      // Fetch creator's courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, subdomain, status, created_at')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      const coursesList = coursesData || [];
      setCourses(coursesList);

      if (coursesList.length === 0) {
        setIsLoading(false);
        return;
      }

      const courseIds = coursesList.map(c => c.id);

      // Fetch all analytics data in parallel
      const [viewsRes, enrollmentsRes, lessonViewsRes, purchasesRes] = await Promise.all([
        supabase.from('course_views').select('id, course_id, created_at, device_type, referrer').in('course_id', courseIds),
        supabase.from('enrollments').select('id, course_id, progress_percent, enrolled_at, completed_at').in('course_id', courseIds),
        supabase.from('lesson_views').select('id, course_id, lesson_id, time_spent_seconds, created_at').in('course_id', courseIds),
        supabase.from('purchases').select('id, course_id, amount_cents, status, purchased_at').in('course_id', courseIds).eq('status', 'completed'),
      ]);

      setViews(viewsRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
      setLessonViews(lessonViewsRes.data || []);
      setPurchases(purchasesRes.data || []);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [navigate]);

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
  const filteredPurchases = useMemo(() => {
    if (dateRange === 'all') return purchases;
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return purchases.filter(p => new Date(p.purchased_at) >= cutoff);
  }, [purchases, dateRange]);

  // Calculate overview stats
  const stats = useMemo(() => {
    const totalViews = filteredViews.length;
    const totalEnrollments = filteredEnrollments.length;
    const completedEnrollments = filteredEnrollments.filter(e => e.progress_percent === 100).length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const totalSeconds = filteredLessonViews.reduce((sum, lv) => sum + (lv.time_spent_seconds || 0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const totalEarnings = filteredPurchases.reduce((sum, p) => sum + p.amount_cents, 0) / 100;

    return { totalViews, totalEnrollments, completionRate, totalHours, totalEarnings };
  }, [filteredViews, filteredEnrollments, filteredLessonViews, filteredPurchases]);

  // Views chart data (last 30 days)
  const chartData = useMemo(() => {
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

  // Course performance data
  const coursePerformance = useMemo(() => {
    return courses.map(course => {
      const courseViews = filteredViews.filter(v => v.course_id === course.id).length;
      const courseEnrollments = filteredEnrollments.filter(e => e.course_id === course.id);
      const completed = courseEnrollments.filter(e => e.progress_percent === 100).length;
      const completionRate = courseEnrollments.length > 0 ? Math.round((completed / courseEnrollments.length) * 100) : 0;
      const courseLessonViews = filteredLessonViews.filter(lv => lv.course_id === course.id);
      const avgWatchTime = courseLessonViews.length > 0
        ? Math.round(courseLessonViews.reduce((sum, lv) => sum + (lv.time_spent_seconds || 0), 0) / courseLessonViews.length / 60)
        : 0;

      return {
        ...course,
        views: courseViews,
        enrollments: courseEnrollments.length,
        completionRate,
        avgWatchTime,
      };
    }).sort((a, b) => b.views - a.views);
  }, [courses, filteredViews, filteredEnrollments, filteredLessonViews]);

  // Top lessons
  const topLessons = useMemo(() => {
    const lessonMap = new Map<string, { lessonId: string; courseId: string; views: number; totalTime: number }>();
    
    filteredLessonViews.forEach(lv => {
      const key = `${lv.course_id}:${lv.lesson_id}`;
      const existing = lessonMap.get(key) || { lessonId: lv.lesson_id, courseId: lv.course_id, views: 0, totalTime: 0 };
      existing.views += 1;
      existing.totalTime += lv.time_spent_seconds || 0;
      lessonMap.set(key, existing);
    });

    return Array.from(lessonMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(item => ({
        ...item,
        courseName: courses.find(c => c.id === item.courseId)?.title || 'Unknown',
        avgTime: item.views > 0 ? Math.round(item.totalTime / item.views / 60) : 0,
      }));
  }, [filteredLessonViews, courses]);

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

  const pieData = [
    { name: 'Desktop', value: deviceBreakdown.desktop, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: deviceBreakdown.mobile, color: 'hsl(var(--chart-2))' },
    { name: 'Tablet', value: deviceBreakdown.tablet, color: 'hsl(var(--chart-3))' },
  ].filter(d => d.value > 0);

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
      .sort((a, b) => b.count - a.count);
  }, [filteredViews]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: { type: string; message: string; date: Date }[] = [];
    
    filteredEnrollments.slice(0, 10).forEach(e => {
      const course = courses.find(c => c.id === e.course_id);
      if (e.enrolled_at) {
        activities.push({
          type: 'enrollment',
          message: `New enrollment in "${course?.title || 'Course'}"`,
          date: new Date(e.enrolled_at),
        });
      }
      if (e.completed_at) {
        activities.push({
          type: 'completion',
          message: `Course completed: "${course?.title || 'Course'}"`,
          date: new Date(e.completed_at),
        });
      }
    });

    filteredViews.slice(0, 5).forEach(v => {
      const course = courses.find(c => c.id === v.course_id);
      activities.push({
        type: 'view',
        message: `New view on "${course?.title || 'Course'}"`,
        date: new Date(v.created_at),
      });
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [filteredEnrollments, filteredViews, courses]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state - no courses
  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Helmet><title>Analytics | Excellion</title></Helmet>
        <div className="text-center max-w-md px-4">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No courses yet</h1>
          <p className="text-muted-foreground mb-6">Create your first course to see analytics</p>
          <Button onClick={() => navigate('/secret-builder-hub')} className="bg-primary hover:bg-primary/90">
            Create Course
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no views
  const hasData = filteredViews.length > 0 || filteredEnrollments.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Analytics | Excellion</title></Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/secret-builder-hub')}
              className="h-9 w-9 rounded-full hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Track your course performance</p>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex gap-2">
            {(['7', '30', '90', 'all'] as DateRange[]).map(range => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
                className={dateRange === range ? 'bg-primary hover:bg-primary/90' : ''}
              >
                {range === 'all' ? 'All Time' : `${range} Days`}
              </Button>
            ))}
          </div>
        </div>

        {!hasData ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No views yet</h2>
              <p className="text-muted-foreground mb-4">Share your courses to start getting traffic</p>
              <Button variant="outline" onClick={() => navigate('/secret-builder-hub')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-3xl font-bold text-primary">${stats.totalEarnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Revenue</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </div>
                    <Eye className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Enrollments</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalEnrollments.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Students enrolled</p>
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
                      <p className="text-xs text-muted-foreground mt-1">Courses completed</p>
                    </div>
                    <Trophy className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Watch Time</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalHours}h</p>
                      <p className="text-xs text-muted-foreground mt-1">Hours of learning</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Views Chart */}
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Course Views ({dateRange === 'all' ? 'Last 30 Days' : `Last ${dateRange} Days`})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
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
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Device Breakdown */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <>
                      <div className="h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-primary" />
                            <span className="text-sm">Desktop</span>
                          </div>
                          <span className="text-sm font-medium">{deviceBreakdown.desktop}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-chart-2" />
                            <span className="text-sm">Mobile</span>
                          </div>
                          <span className="text-sm font-medium">{deviceBreakdown.mobile}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tablet className="h-4 w-4 text-chart-3" />
                            <span className="text-sm">Tablet</span>
                          </div>
                          <span className="text-sm font-medium">{deviceBreakdown.tablet}%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No device data yet</p>
                  )}
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
                    <div className="space-y-3">
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            activity.type === 'completion' ? 'bg-green-500' :
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

            {/* Course Performance Table */}
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Enrollments</TableHead>
                      <TableHead className="text-right">Completion</TableHead>
                      <TableHead className="text-right">Avg Watch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursePerformance.map(course => (
                      <TableRow 
                        key={course.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/dashboard/analytics/${course.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {course.title}
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{course.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{course.enrollments.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{course.completionRate}%</TableCell>
                        <TableCell className="text-right">{course.avgWatchTime} min</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Lessons Table */}
            {topLessons.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Most Viewed Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Avg Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topLessons.map((lesson, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{lesson.lessonId}</TableCell>
                          <TableCell className="text-muted-foreground">{lesson.courseName}</TableCell>
                          <TableCell className="text-right">{lesson.views.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{lesson.avgTime} min</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
