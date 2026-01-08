import { BookOpen, Video, FileText, Clock, BarChart2 } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  lessons?: Array<{
    id: string;
    title: string;
    type?: 'video' | 'text' | 'quiz' | 'assignment';
    duration?: string;
  }>;
}

interface CourseCardPreviewProps {
  title: string;
  modules: Module[];
  difficulty?: string | null;
  durationWeeks?: number | null;
}

export function CourseCardPreview({ title, modules, difficulty, durationWeeks }: CourseCardPreviewProps) {
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const videoCount = modules.reduce((acc, m) => 
    acc + (m.lessons?.filter(l => l.type === 'video').length || 0), 0);
  const textCount = modules.reduce((acc, m) => 
    acc + (m.lessons?.filter(l => l.type === 'text').length || 0), 0);

  return (
    <div className="w-full h-full bg-gradient-to-br from-card via-muted/20 to-card p-3 flex flex-col">
      {/* Mini curriculum outline */}
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {modules.slice(0, 3).map((module, idx) => (
          <div 
            key={module.id || idx} 
            className="flex items-center gap-2 text-[10px] text-muted-foreground bg-background/50 rounded px-2 py-1.5"
          >
            <BookOpen className="w-3 h-3 text-primary/70 shrink-0" />
            <span className="truncate flex-1">{module.title}</span>
            <span className="text-[9px] text-muted-foreground/60 shrink-0">
              {module.lessons?.length || 0} lessons
            </span>
          </div>
        ))}
        {modules.length > 3 && (
          <div className="text-[10px] text-muted-foreground/60 pl-2">
            +{modules.length - 3} more modules
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          <span>{modules.length} modules</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{totalLessons} lessons</span>
        </div>
        {durationWeeks && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{durationWeeks}w</span>
          </div>
        )}
        {difficulty && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize">
            <BarChart2 className="w-3 h-3" />
            <span>{difficulty}</span>
          </div>
        )}
      </div>
    </div>
  );
}
