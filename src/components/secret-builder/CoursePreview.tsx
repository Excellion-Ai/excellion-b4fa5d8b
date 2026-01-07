import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  GripVertical,
  Settings,
  Copy,
  Eye,
  Image as ImageIcon,
  Upload,
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
  thumbnail?: string;
  brand_color?: string;
}

interface CoursePreviewProps {
  course: Course;
  onUpdate?: (course: Course) => void;
  onPublish?: () => void;
  onRefine?: () => void;
  onOpenSettings?: () => void;
  onPreviewAsStudent?: () => void;
  onDuplicate?: () => void;
  onUploadThumbnail?: () => void;
  isPublishing?: boolean;
}

const LessonTypeIcon = ({ type, contentType }: { type: Lesson['type']; contentType?: string }) => {
  const displayType = contentType || type;
  const icons: Record<string, React.ReactNode> = {
    video: <span className="text-base">🎥</span>,
    text: <span className="text-base">📖</span>,
    quiz: <span className="text-base">❓</span>,
    assignment: <span className="text-base">📝</span>,
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

// Sortable Lesson Item
function SortableLesson({
  lesson,
  lessonIdx,
  onEdit,
  isEditing,
  editValue,
  setEditValue,
  onSave,
  onCancel,
}: {
  lesson: Lesson;
  lessonIdx: number;
  onEdit: () => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50 group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-xs text-muted-foreground shrink-0 w-6">{lessonIdx + 1}.</span>
        <LessonTypeIcon type={lesson.type} contentType={lesson.content_type} />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-7 text-sm"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onSave}>
                <Check className="w-3.5 h-3.5 text-green-400" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancel}>
                <X className="w-3.5 h-3.5 text-red-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={onEdit}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
          )}
          {lesson.description && !isEditing && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{lesson.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {lesson.is_preview && (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Free Preview</Badge>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {lesson.duration}
        </span>
      </div>
    </div>
  );
}

// Sortable Module Item
function SortableModule({
  module,
  moduleIdx,
  children,
  onEditTitle,
  isEditingTitle,
  editTitleValue,
  setEditTitleValue,
  onSaveTitle,
  onCancelTitle,
}: {
  module: Module;
  moduleIdx: number;
  children: React.ReactNode;
  onEditTitle: () => void;
  isEditingTitle: boolean;
  editTitleValue: string;
  setEditTitleValue: (val: string) => void;
  onSaveTitle: () => void;
  onCancelTitle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={module.id}
      className="border border-border rounded-lg px-4 bg-muted/20"
    >
      <AccordionTrigger className="hover:no-underline py-4 group">
        <div className="flex items-center gap-3 text-left flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">
            {moduleIdx + 1}
          </span>
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  className="h-8"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onSaveTitle}>
                  <Check className="w-4 h-4 text-green-400" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancelTitle}>
                  <X className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{module.title}</p>
                {module.lessons.some(l => l.type === 'quiz') && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Quiz</Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTitle();
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {module.lessons.length} lessons • {module.description}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-2 pl-10">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function CoursePreview({
  course,
  onUpdate,
  onPublish,
  onRefine,
  onOpenSettings,
  onPreviewAsStudent,
  onDuplicate,
  onUploadThumbnail,
  isPublishing = false,
}: CoursePreviewProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(course.title);
  const [tempDescription, setTempDescription] = useState(course.description);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [tempModuleTitle, setTempModuleTitle] = useState('');
  const [tempLessonTitle, setTempLessonTitle] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdate) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingThumbnail(true);

    try {
      // Get user ID for proper path isolation
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `thumbnails/${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('builder-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('builder-images')
        .getPublicUrl(filePath);

      // Update course with new thumbnail
      onUpdate({ ...course, thumbnail: publicUrl });
      toast.success('Thumbnail uploaded!');
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
      // Reset input so same file can be selected again
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

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

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onUpdate) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newModules = arrayMove(course.modules, oldIndex, newIndex);
      onUpdate({ ...course, modules: newModules });
    }
  };

  const handleLessonDragEnd = (moduleId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onUpdate) return;

    const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const module = course.modules[moduleIndex];
    const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
    const newIndex = module.lessons.findIndex((l) => l.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newLessons = arrayMove(module.lessons, oldIndex, newIndex);
      const newModules = [...course.modules];
      newModules[moduleIndex] = { ...module, lessons: newLessons };
      onUpdate({ ...course, modules: newModules });
    }
  };

  const handleSaveModuleTitle = (moduleId: string) => {
    if (onUpdate && tempModuleTitle.trim()) {
      const newModules = course.modules.map((m) =>
        m.id === moduleId ? { ...m, title: tempModuleTitle.trim() } : m
      );
      onUpdate({ ...course, modules: newModules });
    }
    setEditingModuleId(null);
  };

  const handleSaveLessonTitle = (moduleId: string, lessonId: string) => {
    if (onUpdate && tempLessonTitle.trim()) {
      const newModules = course.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, title: tempLessonTitle.trim() } : l
              ),
            }
          : m
      );
      onUpdate({ ...course, modules: newModules });
    }
    setEditingLessonId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Course Header with Thumbnail */}
      <Card className="bg-card border-border overflow-hidden">
        {/* Brand Color Header Bar */}
        {course.brand_color && (
          <div 
            className="h-1.5" 
            style={{ backgroundColor: course.brand_color }}
          />
        )}
        {/* Hidden file input for thumbnail */}
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          className="hidden"
        />
        {/* Thumbnail Area */}
        <div
          onClick={() => !isUploadingThumbnail && thumbnailInputRef.current?.click()}
          className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 cursor-pointer group"
        >
          {isUploadingThumbnail ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt="Course thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <Upload className="h-8 w-8" />
              <span className="text-sm">Click to upload course thumbnail</span>
            </div>
          )}
          {!isUploadingThumbnail && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

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
          <div className="flex flex-wrap gap-2">
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
            <Button variant="outline" onClick={onOpenSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={onPreviewAsStudent}>
              <Eye className="w-4 h-4 mr-2" />
              Student View
            </Button>
            <Button variant="ghost" onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
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

      {/* Course Curriculum with Drag & Drop */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Course Curriculum</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Drag to reorder modules and lessons
          </p>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleModuleDragEnd}
          >
            <SortableContext
              items={course.modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="multiple" className="space-y-2">
                {course.modules.map((module, moduleIdx) => (
                  <SortableModule
                    key={module.id}
                    module={module}
                    moduleIdx={moduleIdx}
                    isEditingTitle={editingModuleId === module.id}
                    editTitleValue={tempModuleTitle}
                    setEditTitleValue={setTempModuleTitle}
                    onEditTitle={() => {
                      setEditingModuleId(module.id);
                      setTempModuleTitle(module.title);
                    }}
                    onSaveTitle={() => handleSaveModuleTitle(module.id)}
                    onCancelTitle={() => setEditingModuleId(null)}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleLessonDragEnd(module.id)}
                    >
                      <SortableContext
                        items={module.lessons.map((l) => l.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {module.lessons.map((lesson, lessonIdx) => (
                          <SortableLesson
                            key={lesson.id}
                            lesson={lesson}
                            lessonIdx={lessonIdx}
                            isEditing={editingLessonId === lesson.id}
                            editValue={tempLessonTitle}
                            setEditValue={setTempLessonTitle}
                            onEdit={() => {
                              setEditingLessonId(lesson.id);
                              setTempLessonTitle(lesson.title);
                            }}
                            onSave={() => handleSaveLessonTitle(module.id, lesson.id)}
                            onCancel={() => setEditingLessonId(null)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </SortableModule>
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}
