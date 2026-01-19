import { useState } from 'react';
import { ExtendedCourse } from '@/types/course-pages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle2,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { VideoPlayer } from '@/components/video';

interface WebinarTemplateProps {
  course: ExtendedCourse;
  isPreview?: boolean;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export function WebinarTemplate({ 
  course, 
  isPreview,
  onEnroll,
  isEnrolled,
  isEnrolling,
}: WebinarTemplateProps) {
  const [email, setEmail] = useState('');
  
  // Get video URL from first lesson if available
  const firstLesson = course.modules?.[0]?.lessons?.[0];
  const videoUrl = firstLesson?.video_url;
  
  // Duration estimate
  const durationText = course.duration_weeks 
    ? `${course.duration_weeks * 60} minutes`
    : firstLesson?.duration || '60 minutes';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950/20 via-background to-background">
      {/* Hero Section */}
      <div className="relative py-16 px-4 bg-gradient-to-br from-indigo-600/20 via-background to-purple-600/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              <Video className="w-3.5 h-3.5 mr-1" />
              {isEnrolled ? 'Watch Now' : 'Free Webinar'}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              {course.title}
            </h1>
            
            {course.tagline && (
              <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>
            )}
          </div>

          {/* Video Player or Thumbnail */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-indigo-500/30 mb-8">
            {isEnrolled && videoUrl ? (
              <VideoPlayer url={videoUrl} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/50">
                    <Play className="w-10 h-10 text-indigo-400 ml-1" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {isEnrolled ? 'Loading...' : 'Register to Watch'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Webinar Info */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-indigo-500/30">
              <Clock className="w-4 h-4 text-indigo-400" />
              {durationText}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-indigo-500/30">
              <Video className="w-4 h-4 text-indigo-400" />
              On-Demand Access
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-indigo-500/30">
              <Users className="w-4 h-4 text-indigo-400" />
              Free Registration
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Description */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground">
            {course.description}
          </p>
        </div>

        {/* What You'll Learn */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <Card className="bg-card/80 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                In This Webinar, You'll Discover
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Registration Form (if not enrolled) */}
        {!isEnrolled && !isPreview && (
          <Card className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Get Instant Access
              </CardTitle>
              <p className="text-muted-foreground">
                Enter your email to watch this webinar now
              </p>
            </CardHeader>
            <CardContent className="max-w-md mx-auto">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-indigo-500/30"
                />
                <Button 
                  size="lg" 
                  className="w-full text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={onEnroll}
                  disabled={isEnrolling}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already registered CTA */}
        {isEnrolled && !isPreview && (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Enjoying the webinar?
            </h3>
            <p className="text-muted-foreground mb-6">
              Check out our full courses for more in-depth training
            </p>
            <Button variant="outline" size="lg">
              Browse Courses
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
