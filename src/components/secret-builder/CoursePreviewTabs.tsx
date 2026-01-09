import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, Play } from 'lucide-react';
import { CoursePreview } from './CoursePreview';
import { CourseLandingPreview } from './CourseLandingPreview';
import { CourseStudentView } from './CourseStudentView';
import { Button } from '@/components/ui/button';
import { ExtendedCourse } from '@/types/course-pages';

interface CoursePreviewTabsProps {
  course: ExtendedCourse;
  onUpdate?: (course: ExtendedCourse) => void;
  onPublish?: () => void;
  onRefine?: () => void;
  onOpenSettings?: () => void;
  onPreviewAsStudent?: () => void;
  onDuplicate?: () => void;
  onUploadThumbnail?: () => void;
  isPublishing?: boolean;
}

export function CoursePreviewTabs({
  course,
  onUpdate,
  onPublish,
  onRefine,
  onOpenSettings,
  onPreviewAsStudent,
  onDuplicate,
  onUploadThumbnail,
  isPublishing = false,
}: CoursePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<'landing' | 'curriculum' | 'lesson'>('landing');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
    setActiveTab('lesson');
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const module = course.modules.find(m => m.id === moduleId);
    if (module && module.lessons.length > 0) {
      setSelectedLessonId(module.lessons[0].id);
    }
    setActiveTab('lesson');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation Bar */}
      <div className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="landing" className="gap-2 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Landing Page
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="gap-2 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="lesson" className="gap-2 text-xs">
                <Play className="w-3.5 h-3.5" />
                Lesson Preview
              </TabsTrigger>
            </TabsList>

            {/* Module quick nav when on lesson view */}
            {activeTab === 'lesson' && course.modules.length > 0 && (
              <div className="flex items-center gap-1">
                {course.modules.map((module, idx) => (
                  <Button
                    key={module.id}
                    size="sm"
                    variant={selectedModuleId === module.id ? 'default' : 'ghost'}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleModuleClick(module.id)}
                  >
                    M{idx + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'landing' && (
          <CourseLandingPreview
            course={course}
            onUpdate={onUpdate}
            onEnrollClick={() => setActiveTab('curriculum')}
          />
        )}

        {activeTab === 'curriculum' && (
          <CoursePreview
            course={course}
            onUpdate={onUpdate}
            onPublish={onPublish}
            onRefine={onRefine}
            onOpenSettings={onOpenSettings}
            onPreviewAsStudent={() => {
              if (course.modules.length > 0) {
                const firstModule = course.modules[0];
                setSelectedModuleId(firstModule.id);
                if (firstModule.lessons.length > 0) {
                  setSelectedLessonId(firstModule.lessons[0].id);
                }
              }
              setActiveTab('lesson');
            }}
            onDuplicate={onDuplicate}
            onUploadThumbnail={onUploadThumbnail}
            isPublishing={isPublishing}
            onLessonClick={handleLessonClick}
          />
        )}

        {activeTab === 'lesson' && (
          <CourseStudentView
            course={course}
            selectedModuleId={selectedModuleId}
            selectedLessonId={selectedLessonId}
            onSelectModule={setSelectedModuleId}
            onSelectLesson={(mId, lId) => {
              setSelectedModuleId(mId);
              setSelectedLessonId(lId);
            }}
            onBack={() => {
              setActiveTab('curriculum');
            }}
          />
        )}
      </div>
    </div>
  );
}
