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
  | 'community'
  | 'certificate';

export type CourseLayoutStyle = 'creator' | 'technical' | 'academic' | 'visual';

// Page types that can exist as separate pages
export type CoursePageType = 
  | 'landing'      // Main sales/landing page
  | 'curriculum'   // Full curriculum overview
  | 'bonuses'      // Bonus materials page
  | 'community'    // Community/discussion page
  | 'resources'    // Downloadable resources
  | 'about'        // About instructor/course
  | 'testimonials' // Student success stories
  | 'faq';         // FAQ page

export interface CoursePage {
  id: string;
  type: CoursePageType;
  title: string;
  slug: string;
  content: CoursePageContent;
  isEnabled: boolean;
  order: number;
}

export interface CoursePageContent {
  // Landing page content
  hero_headline?: string;
  hero_subheadline?: string;
  sections?: LandingSectionType[];
  
  // Bonuses page content
  bonuses?: Array<{
    title: string;
    description: string;
    value?: string;
    icon?: string;
  }>;
  
  // Resources page content
  resources?: Array<{
    title: string;
    description: string;
    downloadUrl?: string;
    type: 'pdf' | 'video' | 'template' | 'worksheet' | 'other';
  }>;
  
  // Community page content
  communityDescription?: string;
  communityFeatures?: string[];
  communityPlatform?: string;
  
  // Testimonials page content
  testimonials?: Array<{
    name: string;
    role?: string;
    quote: string;
    avatar?: string;
    rating?: number;
  }>;
  
  // FAQ page content
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  
  // About page content
  instructorBio?: string;
  instructorCredentials?: string[];
  instructorImage?: string;
}

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
  // Multi-page support
  separatePages?: CoursePage[];
  isMultiPage?: boolean;
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
  id?: string;
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
  layout_style?: CourseLayoutStyle;
  // Multi-page navigation
  separatePages?: CoursePage[];
  isMultiPage?: boolean;
}

// Style configuration for each layout type
export interface LayoutStyleConfig {
  containerClass: string;
  cardClass: string;
  headingClass: string;
  accentColor: string;
  moduleLayout: 'timeline' | 'accordion' | 'numbered' | 'grid';
  showInstructorLarge: boolean;
  showCertificate: boolean;
  showTestimonials: boolean;
  codeBlockStyle: boolean;
  compactDensity: boolean;
  imageHeavy: boolean;
}

export function getLayoutStyleConfig(style: CourseLayoutStyle = 'creator'): LayoutStyleConfig {
  const configs: Record<CourseLayoutStyle, LayoutStyleConfig> = {
    creator: {
      containerClass: 'bg-gradient-to-b from-amber-950/10 via-background to-background',
      cardClass: 'bg-card/80 border-amber-500/20',
      headingClass: 'text-amber-100',
      accentColor: 'amber',
      moduleLayout: 'timeline',
      showInstructorLarge: true,
      showCertificate: false,
      showTestimonials: true,
      codeBlockStyle: false,
      compactDensity: false,
      imageHeavy: false,
    },
    technical: {
      containerClass: 'bg-slate-950',
      cardClass: 'bg-slate-900/80 border-slate-700',
      headingClass: 'text-slate-100 font-mono',
      accentColor: 'emerald',
      moduleLayout: 'accordion',
      showInstructorLarge: false,
      showCertificate: false,
      showTestimonials: false,
      codeBlockStyle: true,
      compactDensity: true,
      imageHeavy: false,
    },
    academic: {
      containerClass: 'bg-stone-50 dark:bg-stone-950',
      cardClass: 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700',
      headingClass: 'text-stone-900 dark:text-stone-100 font-serif',
      accentColor: 'blue',
      moduleLayout: 'numbered',
      showInstructorLarge: false,
      showCertificate: true,
      showTestimonials: false,
      codeBlockStyle: false,
      compactDensity: false,
      imageHeavy: false,
    },
    visual: {
      containerClass: 'bg-gradient-to-br from-violet-950/20 via-background to-fuchsia-950/10',
      cardClass: 'bg-card/60 backdrop-blur border-violet-500/30',
      headingClass: 'text-violet-100 font-bold',
      accentColor: 'violet',
      moduleLayout: 'grid',
      showInstructorLarge: false,
      showCertificate: false,
      showTestimonials: true,
      codeBlockStyle: false,
      compactDensity: false,
      imageHeavy: true,
    },
  };
  return configs[style] || configs.creator;
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

// Format section numbers for academic style
export function formatSectionNumber(moduleIdx: number, lessonIdx?: number): string {
  if (lessonIdx !== undefined) {
    return `${moduleIdx + 1}.${lessonIdx + 1}`;
  }
  return `${moduleIdx + 1}.0`;
}
