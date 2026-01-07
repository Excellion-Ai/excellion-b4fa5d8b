import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Check,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  Target,
  Gift,
  Shield,
  MessageCircle,
  Play,
  ChevronRight,
  Star,
  Award,
  FileText,
  Video,
  HelpCircle,
  ClipboardCheck,
} from 'lucide-react';
import { ExtendedCourse, LandingSectionType } from '@/types/course-pages';

interface CourseLandingPreviewProps {
  course: ExtendedCourse;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnrollClick?: () => void;
}

const LessonTypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    video: <Video className="w-3.5 h-3.5" />,
    text: <FileText className="w-3.5 h-3.5" />,
    quiz: <HelpCircle className="w-3.5 h-3.5" />,
    assignment: <ClipboardCheck className="w-3.5 h-3.5" />,
  };
  return icons[type] || <FileText className="w-3.5 h-3.5" />;
};

export function CourseLandingPreview({
  course,
  onUpdate,
  onEnrollClick,
}: CourseLandingPreviewProps) {
  const pages = course.pages;
  const sections = pages?.landing_sections || ['hero', 'outcomes', 'curriculum', 'pricing', 'faq'];
  
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = course.modules.reduce((acc, m) => {
    return acc + m.lessons.reduce((a, l) => {
      const match = l.duration.match(/(\d+)/);
      return a + (match ? parseInt(match[1]) : 0);
    }, 0);
  }, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const renderSection = (sectionType: LandingSectionType) => {
    switch (sectionType) {
      case 'hero':
        return (
          <div key="hero" className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10 p-8 md:p-12">
            {course.thumbnail && (
              <div className="absolute inset-0 opacity-20">
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative z-10 max-w-2xl">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)} Level
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {course.title}
              </h1>
              {course.tagline && (
                <p className="text-xl text-primary font-medium mb-4">{course.tagline}</p>
              )}
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  {course.modules.length} modules
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  {totalLessons} lessons
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {course.duration_weeks} weeks
                </div>
              </div>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onEnrollClick}>
                Enroll Now
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        );

      case 'outcomes':
        return course.learningOutcomes && course.learningOutcomes.length > 0 ? (
          <Card key="outcomes" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 md:grid-cols-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null;

      case 'curriculum':
        return (
          <Card key="curriculum" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Course Curriculum
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.modules.length} modules • {totalLessons} lessons • {totalHours}+ hours of content
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {course.modules.map((module, idx) => (
                  <AccordionItem 
                    key={module.id} 
                    value={module.id}
                    className="border border-border rounded-lg px-4 bg-muted/10"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {module.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-2 pl-10">
                        {module.lessons.map((lesson, lIdx) => (
                          <div 
                            key={lesson.id}
                            className="flex items-center justify-between p-2.5 rounded-md bg-background/50 border border-border/50"
                          >
                            <div className="flex items-center gap-3">
                              <LessonTypeIcon type={lesson.type} />
                              <span className="text-sm">{lesson.title}</span>
                              {lesson.is_preview && (
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                  Free Preview
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );

      case 'who_is_for':
        return pages?.target_audience ? (
          <Card key="who_is_for" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Who This Course Is For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">{pages.target_audience}</p>
            </CardContent>
          </Card>
        ) : null;

      case 'course_includes':
        return (
          <Card key="course_includes" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                This Course Includes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{totalHours}+ hours of video</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Certificate of completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Lifetime access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Practical exercises</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Q&A support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'instructor':
        return (
          <Card key="instructor" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Meet Your Instructor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Your Instructor</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Expert instructor with years of experience in this field. 
                    Click to edit and add your instructor bio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'testimonials':
        return (
          <Card key="testimonials" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Student Success Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-3">
                      "Add your student testimonial here..."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
                      <span className="text-sm font-medium">Student Name</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'guarantee':
        return pages?.show_guarantee ? (
          <Card key="guarantee" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <Shield className="w-12 h-12 text-green-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg text-foreground">30-Day Money-Back Guarantee</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    If you're not satisfied with the course, get a full refund within 30 days. No questions asked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null;

      case 'bonuses':
        return pages?.included_bonuses && pages.included_bonuses.length > 0 ? (
          <Card key="bonuses" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Bonus Materials Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {pages.included_bonuses.map((bonus, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <Check className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-sm capitalize">{bonus.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null;

      case 'community':
        return (
          <Card key="community" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Join Our Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with fellow students, share your progress, and get help from our community.
              </p>
              <Button variant="outline" disabled>
                Community Access Included
              </Button>
            </CardContent>
          </Card>
        );

      case 'pricing':
        return (
          <Card key="pricing" className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Start Learning?</h3>
              <p className="text-muted-foreground mb-6">
                Get instant access to all {totalLessons} lessons
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$99</span>
                <span className="text-muted-foreground ml-2">one-time payment</span>
              </div>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onEnrollClick}>
                Enroll Now
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'faq':
        return pages?.faq && pages.faq.length > 0 ? (
          <Card key="faq" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {pages.faq.map((item, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`faq-${idx}`}
                    className="border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="text-left font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {sections.map(section => renderSection(section))}
      
      {/* Final CTA */}
      <div className="text-center py-8">
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onEnrollClick}>
          Enroll Now & Start Learning
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
