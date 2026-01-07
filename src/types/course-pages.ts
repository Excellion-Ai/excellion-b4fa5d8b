// Multi-page course structure types

export type LandingSectionType = 
  | 'hero'
  | 'outcomes'
  | 'curriculum'
  | 'instructor'
  | 'pricing'
  | 'faq'
  | 'who_is_for'
  | 'course_includes'
  | 'testimonials'
  | 'guarantee'
  | 'bonuses'
  | 'community';

export interface CoursePages {
  landing_sections: LandingSectionType[];
  included_bonuses?: string[];
  show_guarantee?: boolean;
  target_audience?: string;
  instructor?: {
    name: string;
    bio: string;
    avatar?: string;
  };
  pricing?: {
    price: number;
    currency: string;
    original_price?: number;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface LessonContent {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  description?: string;
  is_preview?: boolean;
  content_markdown?: string;
  video_url?: string;
  quiz_questions?: number;
  assignment_brief?: string;
  resources?: Array<{ title: string; url: string }>;
}

export interface ModuleWithContent {
  id: string;
  title: string;
  description: string;
  lessons: LessonContent[];
  has_quiz?: boolean;
  has_assignment?: boolean;
  is_first?: boolean;
  is_last?: boolean;
  total_duration?: string;
  layout_variant?: 'video_heavy' | 'text_heavy' | 'mixed' | 'project_based';
}

export interface ExtendedCourse {
  title: string;
  description: string;
  tagline?: string;
  difficulty: string;
  duration_weeks: number;
  modules: ModuleWithContent[];
  learningOutcomes?: string[];
  thumbnail?: string;
  brand_color?: string;
  pages?: CoursePages;
}

// Utility function to determine module layout variant
export function getModuleLayoutVariant(module: ModuleWithContent): ModuleWithContent['layout_variant'] {
  const videoCount = module.lessons.filter(l => l.type === 'video').length;
  const textCount = module.lessons.filter(l => l.type === 'text').length;
  const assignmentCount = module.lessons.filter(l => l.type === 'assignment').length;
  const total = module.lessons.length;

  if (assignmentCount > 0 && assignmentCount >= total * 0.3) return 'project_based';
  if (videoCount > total * 0.6) return 'video_heavy';
  if (textCount > total * 0.6) return 'text_heavy';
  return 'mixed';
}

// Calculate total duration for a module
export function calculateModuleDuration(lessons: LessonContent[]): string {
  let totalMinutes = 0;
  for (const lesson of lessons) {
    const match = lesson.duration.match(/(\d+)\s*(min|hour|hr)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('hour') || unit === 'hr') {
        totalMinutes += value * 60;
      } else {
        totalMinutes += value;
      }
    }
  }
  
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${totalMinutes}m`;
}
