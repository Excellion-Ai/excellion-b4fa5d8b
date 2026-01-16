import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  FileText,
  Video,
  HelpCircle,
  ClipboardCheck,
  BookOpen,
  Flag,
  Award,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { ExtendedCourse, ModuleWithContent, LessonContent, getModuleLayoutVariant, calculateModuleDuration } from '@/types/course-pages';

interface CourseStudentViewProps {
  course: ExtendedCourse;
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  onSelectModule: (moduleId: string | null) => void;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onBack: () => void;
}

const LessonTypeIcon = ({ type, size = 'sm' }: { type: string; size?: 'sm' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  const icons: Record<string, React.ReactNode> = {
    video: <Video className={sizeClass} />,
    text: <FileText className={sizeClass} />,
    quiz: <HelpCircle className={sizeClass} />,
    assignment: <ClipboardCheck className={sizeClass} />,
  };
  return icons[type] || <FileText className={sizeClass} />;
};

// Module Overview Page (when a module is selected but no lesson)
function ModuleOverview({
  course,
  module,
  moduleIdx,
  onSelectLesson,
  onNextModule,
  onPrevModule,
}: {
  course: ExtendedCourse;
  module: ModuleWithContent;
  moduleIdx: number;
  onSelectLesson: (lessonId: string) => void;
  onNextModule: () => void;
  onPrevModule: () => void;
}) {
  const layoutVariant = getModuleLayoutVariant(module);
  const totalDuration = calculateModuleDuration(module.lessons);
  const isFirst = moduleIdx === 0;
  const isLast = moduleIdx === course.modules.length - 1;
  const hasQuiz = module.lessons.some(l => l.type === 'quiz');
  const hasAssignment = module.lessons.some(l => l.type === 'assignment');
  const videoCount = module.lessons.filter(l => l.type === 'video').length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10 p-6">
        {isFirst && (
          <Badge className="absolute top-4 right-4 bg-green-500/20 text-green-400 border-green-500/30">
            <Flag className="w-3 h-3 mr-1" />
            Start Here
          </Badge>
        )}
        {isLast && (
          <Badge className="absolute top-4 right-4 bg-accent/20 text-accent border-accent/30">
            <Award className="w-3 h-3 mr-1" />
            Final Module
          </Badge>
        )}
        
        <p className="text-sm text-primary font-medium mb-2">Module {moduleIdx + 1}</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">{module.title}</h2>
        <p className="text-muted-foreground mb-4">{module.description}</p>
        
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {module.lessons.length} lessons
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {totalDuration}
          </Badge>
          {hasQuiz && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Quiz Included
            </Badge>
          )}
          {hasAssignment && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Hands-on Project
            </Badge>
          )}
        </div>
      </div>

      {/* Welcome message for first module */}
      {isFirst && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Flag className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Welcome to the Course!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This is where your learning journey begins. Work through each lesson at your own pace.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List - Different layouts based on variant */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Lessons in This Module</CardTitle>
        </CardHeader>
        <CardContent>
          {layoutVariant === 'video_heavy' ? (
            // Video-heavy layout: larger cards with thumbnails
            <div className="grid gap-3">
              {module.lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/50 transition-colors text-left w-full"
                >
                  <div className="w-20 h-14 rounded bg-primary/20 flex items-center justify-center shrink-0">
                    {lesson.type === 'video' ? (
                      <Play className="w-6 h-6 text-primary" />
                    ) : (
                      <LessonTypeIcon type={lesson.type} size="lg" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </span>
                      {lesson.type === 'video' && (
                        <Badge variant="outline" className="text-xs">Video</Badge>
                      )}
                    </div>
                  </div>
                  <Circle className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            // Default list layout
            <div className="space-y-2">
              {module.lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                    <LessonTypeIcon type={lesson.type} />
                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                    <Circle className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final module completion preview */}
      {isLast && (
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="py-6 text-center">
            <Award className="w-12 h-12 text-accent mx-auto mb-3" />
            <h4 className="font-semibold text-lg text-foreground">Almost There!</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Complete this final module to earn your certificate of completion.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevModule}
          disabled={isFirst}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Module
        </Button>
        <Button
          onClick={onNextModule}
          disabled={isLast}
        >
          Next Module
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Individual Lesson View
function LessonView({
  course,
  module,
  lesson,
  lessonIdx,
  onNext,
  onPrev,
  onBack,
}: {
  course: ExtendedCourse;
  module: ModuleWithContent;
  lesson: LessonContent;
  lessonIdx: number;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
}) {
  const isFirst = lessonIdx === 0;
  const isLast = lessonIdx === module.lessons.length - 1;

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-4">
            {/* Video Player Placeholder */}
            <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Video Player</p>
              </div>
            </div>
            
            {/* Video Description */}
            {lesson.description && (
              <Card className="bg-card border-border">
                <CardContent className="py-4">
                  <h4 className="font-medium text-foreground mb-2">About This Lesson</h4>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lesson.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            {/* Reading time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Estimated read time: {lesson.duration}
            </div>

            {/* Content */}
            <Card className="bg-card border-border">
              <CardContent className="py-6 prose prose-invert prose-sm max-w-none">
                {lesson.content_markdown ? (
                  <div className="whitespace-pre-wrap text-foreground/90">
                    {lesson.content_markdown}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Lesson content will appear here...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Key Takeaways */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5" />
                    Key point from this lesson...
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5" />
                    Another important concept...
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <HelpCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{lesson.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {Array.isArray(lesson.quiz_questions) ? lesson.quiz_questions.length : 5} questions • {lesson.duration}
                </p>
                <Badge className="mb-6">Pass score: 80%</Badge>
                <div>
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="py-6">
                <div className="flex items-start gap-4 mb-6">
                  <ClipboardCheck className="w-8 h-8 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Hands-on assignment</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Assignment Brief</h4>
                    <p className="text-sm text-muted-foreground">
                      {lesson.assignment_brief || lesson.description || 'Complete this assignment to practice what you learned.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Requirements</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-0.5 shrink-0" />
                        Complete all required sections
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-0.5 shrink-0" />
                        Submit your work for review
                      </li>
                    </ul>
                  </div>

                  <Button className="w-full bg-purple-500 hover:bg-purple-600">
                    Submit Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar - Module outline */}
      <div className="hidden lg:block w-64 shrink-0">
        <Card className="bg-card border-border sticky top-4">
          <CardHeader className="pb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="w-full justify-start -ml-2">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Module
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">Lessons in this module</p>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {module.lessons.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => onBack()}
                    className={`flex items-center gap-2 w-full p-2 rounded text-left text-xs transition-colors ${
                      l.id === lesson.id
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {l.id === lesson.id ? (
                      <Play className="w-3 h-3 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 shrink-0" />
                    )}
                    <span className="truncate">{l.title}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Lesson Header */}
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 lg:hidden">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Module
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <LessonTypeIcon type={lesson.type} />
            <span className="capitalize">{lesson.type} Lesson</span>
            <span>•</span>
            <span>{lesson.duration}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
        </div>

        {/* Lesson Content */}
        {renderLessonContent()}

        {/* Mark Complete & Navigation */}
        <div className="border-t border-border pt-6">
          <Button className="w-full mb-4 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={isFirst}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Lesson
            </Button>
            <Button
              onClick={onNext}
              disabled={isLast}
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function CourseStudentView({
  course,
  selectedModuleId,
  selectedLessonId,
  onSelectModule,
  onSelectLesson,
  onBack,
}: CourseStudentViewProps) {
  const moduleIdx = course.modules.findIndex(m => m.id === selectedModuleId);
  const module = moduleIdx >= 0 ? course.modules[moduleIdx] : null;
  const lessonIdx = module ? module.lessons.findIndex(l => l.id === selectedLessonId) : -1;
  const lesson = lessonIdx >= 0 ? module?.lessons[lessonIdx] : null;

  // If no module selected, show course overview
  if (!module) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{course.title}</h2>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">0% complete</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.modules.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => onSelectModule(m.id)}
                  className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-medium">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.lessons.length} lessons</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If module selected but no lesson, show module overview
  if (!lesson) {
    return (
      <ModuleOverview
        course={course}
        module={module}
        moduleIdx={moduleIdx}
        onSelectLesson={(lessonId) => onSelectLesson(module.id, lessonId)}
        onNextModule={() => {
          if (moduleIdx < course.modules.length - 1) {
            onSelectModule(course.modules[moduleIdx + 1].id);
          }
        }}
        onPrevModule={() => {
          if (moduleIdx > 0) {
            onSelectModule(course.modules[moduleIdx - 1].id);
          }
        }}
      />
    );
  }

  // Show lesson view
  return (
    <LessonView
      course={course}
      module={module}
      lesson={lesson}
      lessonIdx={lessonIdx}
      onNext={() => {
        if (lessonIdx < module.lessons.length - 1) {
          onSelectLesson(module.id, module.lessons[lessonIdx + 1].id);
        }
      }}
      onPrev={() => {
        if (lessonIdx > 0) {
          onSelectLesson(module.id, module.lessons[lessonIdx - 1].id);
        }
      }}
      onBack={onBack}
    />
  );
}
