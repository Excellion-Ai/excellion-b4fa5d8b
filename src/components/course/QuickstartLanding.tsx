import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Clock,
  BookOpen,
  GraduationCap,
  Play,
  PlayCircle,
  CheckSquare,
  Info,
  Sparkles,
  MessageSquareText,
  Rocket,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  estimated_minutes?: number;
  checklist?: string[];
  templates?: string[];
  content_type?: string;
  is_preview?: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  modules: CourseModule[];
  price_cents: number | null;
  subdomain: string | null;
}

interface QuickstartLandingProps {
  course: Course;
  onEnroll: () => void;
  isEnrolled: boolean;
  isEnrolling: boolean;
}

const MODULE_DELIVERABLES: Record<string, { deliverable: string; minutes: number }> = {
  m1: { deliverable: 'A finalized prompt ready to generate your draft', minutes: 10 },
  m2: { deliverable: 'A complete draft reviewed and sections flagged for improvement', minutes: 10 },
  m3: { deliverable: 'All course and sales page content finalized', minutes: 25 },
  m4: { deliverable: 'A live, shareable URL with your course and sales page', minutes: 10 },
};

const VALUE_PROPS = [
  {
    icon: Sparkles,
    title: 'Generate a full draft in one click',
    description:
      'Course modules, lesson scripts, downloadable resources, and a sales page — all from a single AI-generated prompt.',
  },
  {
    icon: MessageSquareText,
    title: 'Refine any section by typing a prompt',
    description:
      'Rewrite a lesson, swap a module intro, update your FAQ, or change your sales headline without rebuilding the page.',
  },
  {
    icon: Rocket,
    title: 'Publish when you are ready',
    description:
      'Connect your domain, toggle sections on or off, and go live on your schedule.',
  },
];

function getModuleMinutes(mod: CourseModule): number {
  return mod.lessons.reduce((sum, l) => sum + (l.estimated_minutes || 5), 0);
}

export function QuickstartLanding({ course, onEnroll, isEnrolled, isEnrolling }: QuickstartLandingProps) {
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const displayTime = '1 hour';

  const scrollToCurriculum = () => {
    document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ctaLabel = isEnrolled ? 'Continue Learning' : 'Start Quickstart';

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero ─── */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
            Free
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {course.title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            One voice call creates your prompt. One click generates a complete draft — course, scripts, downloads, and sales page. Then refine any section with a typed command. No manual building.
          </p>

          {/* Metadata chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
              <Clock className="w-3.5 h-3.5" /> ~{displayTime}
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
              <BookOpen className="w-3.5 h-3.5" /> {course.modules.length} modules
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
              <GraduationCap className="w-3.5 h-3.5" /> {totalLessons} lessons
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm py-1 px-3">
              Beginner
            </Badge>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button size="lg" className="text-base px-8 py-6" onClick={onEnroll} disabled={isEnrolling}>
              {isEnrolling ? 'Enrolling…' : ctaLabel}
            </Button>
            <button
              onClick={scrollToCurriculum}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              See the curriculum
            </button>
          </div>

          <p className="text-sm text-muted-foreground/70 italic">
            Most coaches generate their full draft in under 10 minutes and publish the same day.
          </p>
        </div>
      </section>

      {/* ─── Value Props (3 cards) ─── */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VALUE_PROPS.map((prop) => (
              <Card
                key={prop.title}
                className="bg-card/60 border-primary/10 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <prop.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{prop.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prop.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Course Preview Media Card ─── */}
      <section className="pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-video rounded-xl bg-muted/10 border border-border overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-4">
              <PlayCircle className="w-16 h-16 text-primary/60 mx-auto" />
              <div>
                <p className="text-foreground font-medium">Course Preview</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Videos coming soon. Start with the written checklists now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Curriculum ─── */}
      <section id="curriculum" className="pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Curriculum</h2>
          <p className="text-center text-muted-foreground mb-8 text-sm">
            {course.modules.length} modules · {totalLessons} lessons · ~{displayTime} total
          </p>

          <Accordion type="multiple" className="space-y-3">
            {course.modules.map((mod, idx) => {
              const meta = MODULE_DELIVERABLES[mod.id];
              const mins = meta?.minutes || getModuleMinutes(mod);
              const deliverable = meta?.deliverable || mod.description || '';

              return (
                <AccordionItem
                  key={mod.id}
                  value={mod.id}
                  className="border border-border rounded-xl overflow-hidden bg-card/40 px-1"
                >
                  <AccordionTrigger className="hover:no-underline px-4 py-4">
                    <div className="flex items-center gap-4 text-left w-full pr-4">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm md:text-base truncate">
                          Module {idx + 1}: {mod.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {deliverable}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="w-3 h-3" /> {mins} min
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {mod.lessons.length} lessons
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2">

                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {lesson.title}
                              </p>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            {lesson.is_preview && (
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] shrink-0">
                                Preview
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-20 h-12 rounded bg-muted/20 border border-border flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4 text-primary/50" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Video: {lesson.estimated_minutes || 5}:00
                            </span>
                          </div>

                          {lesson.checklist && lesson.checklist.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                                Do this now
                              </p>
                              {lesson.checklist.map((item, ci) => (
                                <div key={ci} className="flex items-start gap-2">
                                  <CheckSquare className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                                  <span className="text-xs text-muted-foreground">{item}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Ready to generate your draft?
          </h2>
          <p className="text-muted-foreground">
            Most coaches generate their full draft in under 10 minutes and publish the same day.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" className="text-base px-8 py-6" onClick={onEnroll} disabled={isEnrolling}>
              {isEnrolling ? 'Enrolling…' : ctaLabel}
            </Button>
            <button
              onClick={scrollToCurriculum}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              See the curriculum
            </button>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">Free</Badge>
        </div>
      </section>
    </div>
  );
}
