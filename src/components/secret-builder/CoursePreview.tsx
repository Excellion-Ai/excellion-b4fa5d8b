import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronDown,
  Clock,
  Video,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Pencil,
  Check,
  X,
  Sparkles,
  Globe,
  GraduationCap,
  BookOpen,
  Users,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  description?: string;
  is_preview?: boolean;
  content_type?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  title: string;
  description: string;
  difficulty: string;
  duration_weeks: number;
  modules: Module[];
  learningOutcomes?: string[];
}

interface CoursePreviewProps {
  course: Course;
  onUpdate?: (course: Course) => void;
  onPublish?: () => void;
  onRefine?: () => void;
  isPublishing?: boolean;
}

const LessonTypeIcon = ({ type, contentType }: { type: Lesson['type']; contentType?: string }) => {
  // Use content_type if provided, otherwise fall back to type
  const displayType = contentType || type;
  const icons: Record<string, React.ReactNode> = {
    video: <span className="text-base">🎥</span>,
    text: <span className="text-base">📖</span>,
    quiz: <span className="text-base">❓</span>,
    assignment: <ClipboardCheck className="w-4 h-4 text-orange-400" />,
  };
  return icons[displayType] || <span className="text-base">📖</span>;
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colors: Record<string, string> = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <Badge className={colors[difficulty] || colors.beginner}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
};

export function CoursePreview({
  course,
  onUpdate,
  onPublish,
  onRefine,
  isPublishing = false,
}: CoursePreviewProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(course.title);
  const [tempDescription, setTempDescription] = useState(course.description);

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  const handleSaveTitle = () => {
    if (onUpdate && tempTitle.trim()) {
      onUpdate({ ...course, title: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (onUpdate) {
      onUpdate({ ...course, description: tempDescription.trim() });
    }
    setEditingDescription(false);
  };

  const handleCancelTitle = () => {
    setTempTitle(course.title);
    setEditingTitle(false);
  };

  const handleCancelDescription = () => {
    setTempDescription(course.description);
    setEditingDescription(false);
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-2xl font-bold h-auto py-1"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                    <Check className="w-4 h-4 text-green-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelTitle}>
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => setEditingTitle(true)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {editingDescription ? (
                <div className="mt-3">
                  <Textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" onClick={handleSaveDescription}>
                      <Check className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelDescription}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 group mt-2">
                  <p className="text-muted-foreground">{course.description}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 shrink-0"
                    onClick={() => setEditingDescription(true)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Course Stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <DifficultyBadge difficulty={course.difficulty} />
            <Badge variant="outline" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {course.duration_weeks} weeks
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {course.modules.length} modules
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              {totalLessons} lessons
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onPublish}
              disabled={isPublishing}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Globe className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish Course'}
            </Button>
            <Button variant="outline" onClick={onRefine}>
              <Sparkles className="w-4 h-4 mr-2" />
              Refine with AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 md:grid-cols-2">
              {course.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/80">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Course Curriculum */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Course Curriculum</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {course.modules.map((module, moduleIdx) => (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="border border-border rounded-lg px-4 bg-muted/20"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">
                      {moduleIdx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{module.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {module.lessons.length} lessons • {module.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-2 pl-10">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <LessonTypeIcon type={lesson.type} contentType={lesson.content_type} />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {lesson.title}
                            </p>
                            {lesson.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.is_preview && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                              Preview
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
