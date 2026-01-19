import { ExtendedCourse } from '@/types/course-pages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Target,
  Trophy,
  Flame,
  CheckCircle2,
  Circle,
  ChevronRight,
  Users,
  Clock,
} from 'lucide-react';

interface ChallengeTemplateProps {
  course: ExtendedCourse;
  isPreview?: boolean;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export function ChallengeTemplate({ 
  course, 
  isPreview,
  onEnroll,
  isEnrolled,
  isEnrolling,
}: ChallengeTemplateProps) {
  // Calculate total days from modules/lessons
  const totalDays = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
  
  // Flatten lessons as "days"
  const days = course.modules?.flatMap((module, moduleIdx) => 
    module.lessons?.map((lesson, lessonIdx) => ({
      ...lesson,
      dayNumber: course.modules?.slice(0, moduleIdx).reduce((a, m) => a + (m.lessons?.length || 0), 0) + lessonIdx + 1,
      moduleName: module.title,
    }))
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950/20 via-background to-background">
      {/* Hero Section */}
      <div className="relative py-16 px-4 bg-gradient-to-br from-orange-600/20 via-background to-red-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Flame className="w-3.5 h-3.5 mr-1" />
            {totalDays}-Day Challenge
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            {course.title}
          </h1>
          
          {course.tagline && (
            <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>
          )}
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {course.description}
          </p>

          {/* Challenge Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-orange-500/30">
              <Calendar className="w-4 h-4 text-orange-400" />
              {totalDays} Days
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-orange-500/30">
              <Target className="w-4 h-4 text-orange-400" />
              Daily Tasks
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-orange-500/30">
              <Trophy className="w-4 h-4 text-orange-400" />
              Completion Badge
            </Badge>
          </div>

          {/* CTA Button */}
          {!isPreview && (
            <Button 
              size="lg" 
              className="text-lg px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={onEnroll}
              disabled={isEnrolling}
            >
              {isEnrolled ? 'Continue Challenge' : 'Join the Challenge'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Progress Tracker (if enrolled) */}
        {isEnrolled && (
          <Card className="bg-card/80 border-orange-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Your Progress
                </CardTitle>
                <Badge className="bg-orange-500/20 text-orange-400">
                  Day 1 of {totalDays}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={0} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                Complete daily tasks to build your streak!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Day Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-500" />
            Daily Schedule
          </h2>
          
          <div className="grid gap-3">
            {days.map((day, idx) => (
              <Card 
                key={day.id} 
                className={`bg-card/60 border-border transition-all hover:border-orange-500/50 ${
                  idx === 0 ? 'ring-2 ring-orange-500/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Day Number */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex flex-col items-center justify-center border border-orange-500/30">
                      <span className="text-xs text-orange-400 uppercase font-medium">Day</span>
                      <span className="text-xl font-bold text-orange-400">{day.dayNumber}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{day.title}</h3>
                      <p className="text-sm text-muted-foreground">{day.moduleName}</p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex-shrink-0">
                      {idx === 0 && !isEnrolled ? (
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                          Preview
                        </Badge>
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What You'll Achieve */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <Card className="bg-card/80 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                By the End of This Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 md:grid-cols-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        {!isPreview && !isEnrolled && (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              Ready to Transform?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join hundreds of others taking on this challenge
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={onEnroll}
              disabled={isEnrolling}
            >
              Start the Challenge
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
