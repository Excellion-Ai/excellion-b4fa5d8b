import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Search, Clock, BookOpen, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import LazyFooter from '@/components/LazyFooter';

interface CourseModule {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

interface CourseData {
  id: string;
  title: string;
  subdomain: string | null;
  description: string | null;
  difficulty: string | null;
  duration_weeks: number | null;
  modules: CourseModule[] | null;
  status: string | null;
  published_at: string | null;
  thumbnail_url: string | null;
  average_rating: number | null;
  review_count: number | null;
}

interface Curriculum {
  category?: string;
  difficulty?: string;
  duration_weeks?: number;
  template?: string;
}

const TEMPLATE_GRADIENTS: Record<string, string> = {
  creator: 'from-amber-500/80 to-orange-600/80',
  technical: 'from-indigo-500/80 to-blue-600/80',
  academic: 'from-navy-600/80 to-slate-700/80',
  visual: 'from-rose-500/80 to-violet-600/80',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function getTemplateGradient(modules: CourseModule[] | null): string {
  // Try to detect template from curriculum structure
  const curriculum = modules as unknown as Curriculum;
  const template = curriculum?.template || 'creator';
  return TEMPLATE_GRADIENTS[template] || TEMPLATE_GRADIENTS.creator;
}

function getCourseCategory(modules: CourseModule[] | null): string {
  const curriculum = modules as unknown as Curriculum;
  return curriculum?.category || 'General';
}

function getCourseDifficulty(course: CourseData): string {
  if (course.difficulty) return course.difficulty;
  const curriculum = course.modules as unknown as Curriculum;
  return curriculum?.difficulty || 'beginner';
}

function getCourseDuration(course: CourseData): number {
  if (course.duration_weeks) return course.duration_weeks;
  const curriculum = course.modules as unknown as Curriculum;
  return curriculum?.duration_weeks || 4;
}

function getTotalLessons(modules: CourseModule[] | null): number {
  if (!modules || !Array.isArray(modules)) return 0;
  return modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    // Use public_courses view which strips lesson content_markdown for security
    const { data, error } = await supabase
      .from('public_courses' as any)
      .select('id, title, subdomain, description, difficulty, duration_weeks, modules, status, published_at, thumbnail_url, average_rating, review_count')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } else if (data) {
      const mappedCourses: CourseData[] = (data as any[]).map((course: any) => ({
        ...course,
        modules: Array.isArray(course.modules) ? course.modules as unknown as CourseModule[] : null,
      }));
      setCourses(mappedCourses);
    }
    setIsLoading(false);
  }

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach(course => {
      const category = getCourseCategory(course.modules);
      if (category) cats.add(category);
    });
    return ['All', ...Array.from(cats)];
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course => {
        const title = (course.title || '').toLowerCase();
        const description = (course.description || '').toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(course => getCourseCategory(course.modules) === selectedCategory);
    }

    // Sort
    switch (sortOrder) {
      case 'oldest':
        result.sort((a, b) => new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime());
        break;
      case 'az':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'za':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      default:
        result.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
    }

    return result;
  }, [courses, searchQuery, selectedCategory, sortOrder]);

  const CourseCard = ({ course }: { course: CourseData }) => {
    const gradient = getTemplateGradient(course.modules);
    const category = getCourseCategory(course.modules);
    const difficulty = getCourseDifficulty(course);
    const duration = getCourseDuration(course);
    const totalLessons = getTotalLessons(course.modules);
    const courseUrl = `/course/${course.subdomain || course.id}`;
    const initial = (course.title || 'C')[0].toUpperCase();

    return (
      <Card className="group bg-card border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-6xl font-bold text-white/80">{initial}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Category badge */}
          <Badge variant="outline" className="text-accent border-accent/50 text-xs">
            {category}
          </Badge>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 min-h-[3.5rem]">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={DIFFICULTY_COLORS[difficulty?.toLowerCase()] || DIFFICULTY_COLORS.beginner}>
              {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Beginner'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {duration} weeks
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              {totalLessons} lessons
            </div>
            {course.average_rating && (course.review_count ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-accent">
                <Star className="w-3 h-3 fill-accent" />
                {course.average_rating.toFixed(1)} ({course.review_count})
              </div>
            )}
          </div>

          {/* CTA */}
          <Link to={courseUrl} className="block">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              View Course
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  const SkeletonCard = () => (
    <Card className="bg-card border-border overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Explore Courses | Excellion</title>
        <meta name="description" content="Browse expert-created online courses. Learn new skills at your own pace." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Explore Courses | Excellion" />
        <meta property="og:description" content="Browse expert-created online courses. Learn new skills at your own pace." />
        <meta property="og:url" content="https://excellion.lovable.app/courses" />
        <link rel="canonical" href="https://excellion.lovable.app/courses" />
      </Helmet>
      <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Courses
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn new skills from expert-created courses
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:ring-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery || selectedCategory !== 'All'
              ? `Showing ${filteredCourses.length} of ${courses.length} courses`
              : `Showing ${filteredCourses.length} courses`}
          </p>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              {searchQuery || selectedCategory !== 'All' ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No courses match your search
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try different keywords or clear filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No courses available yet
                  </h3>
                  <p className="text-muted-foreground">
                    Check back soon for new courses!
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <LazyFooter />
      </div>
    </>
  );
}
