import { ExtendedCourse, getLayoutStyleConfig, CourseLayoutStyle } from '@/types/course-pages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Check, 
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface StandardCourseTemplateProps {
  course: ExtendedCourse;
  isPreview?: boolean;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export function StandardCourseTemplate({ 
  course, 
  isPreview,
  onEnroll,
  isEnrolled,
  isEnrolling,
}: StandardCourseTemplateProps) {
  const layoutStyle = (course.layout_style || 'creator') as CourseLayoutStyle;
  const config = getLayoutStyleConfig(layoutStyle);
  
  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className={`min-h-screen ${config.containerClass}`}>
      {/* Hero Section */}
      <div className={`relative py-16 px-4 bg-gradient-to-br ${config.heroGradient}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${config.headingClass}`}>
            {course.title}
          </h1>
          {course.tagline && (
            <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>
          )}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {course.description}
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
              <BookOpen className="w-4 h-4" />
              {course.modules?.length || 0} modules
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
              <GraduationCap className="w-4 h-4" />
              {totalLessons} lessons
            </Badge>
            {course.duration_weeks && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <Clock className="w-4 h-4" />
                {course.duration_weeks} weeks
              </Badge>
            )}
          </div>

          {/* CTA Button */}
          {!isPreview && (
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={onEnroll}
              disabled={isEnrolling}
            >
              {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Learning Outcomes */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <Card className={config.cardClass}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${config.headingClass}`}>
                <GraduationCap className="w-5 h-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 md:grid-cols-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Curriculum */}
        <Card className={config.cardClass}>
          <CardHeader>
            <CardTitle className={`${config.headingClass}`}>
              Course Curriculum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-3">
              {course.modules?.map((module, moduleIdx) => (
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
                        <p className="font-semibold text-foreground">{module.title}</p>
                        {module.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {module.lessons?.length || 0} lessons
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-2 pl-11">
                      {module.lessons?.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {lesson.title}
                          </p>
                          {lesson.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {lesson.duration}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        {!isPreview && (
          <div className="text-center py-8">
            <h3 className={`text-2xl font-bold mb-4 ${config.headingClass}`}>
              Ready to get started?
            </h3>
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={onEnroll}
              disabled={isEnrolling}
            >
              {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
