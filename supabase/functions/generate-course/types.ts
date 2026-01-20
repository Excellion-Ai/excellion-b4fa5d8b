// Shared types for generate-course function

export type CourseTemplate = 'creator' | 'technical' | 'academic' | 'visual' | 'standard' | 'challenge' | 'leadmagnet' | 'webinar' | 'coach';
export type BaseTemplate = 'creator' | 'technical' | 'academic' | 'visual';

export interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  description: string;
  is_preview?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  is_first?: boolean;
  is_last?: boolean;
  has_quiz?: boolean;
  has_assignment?: boolean;
}

export interface LandingPage {
  hero_headline: string;
  hero_subheadline: string;
  features: Array<{ title: string; description: string; icon: string }>;
  faqs: Array<{ question: string; answer: string }>;
  sections?: string[];
  instructor?: {
    name: string;
    bio: string;
    avatar?: string;
  };
  pricing?: {
    amount: number;
    currency: string;
    features: string[];
  };
}

export interface Curriculum {
  modules: Module[];
  landing_page: LandingPage;
  learningOutcomes?: string[];
  difficulty?: string;
  duration_weeks?: number;
  brand_color?: string;
  template?: CourseTemplate;
}

export interface CoursePage {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  isEnabled: boolean;
  order: number;
}

export interface GeneratedCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  tagline: string;
  curriculum: Curriculum;
  status: string;
  thumbnail_url?: string;
  separatePages?: CoursePage[];
  isMultiPage?: boolean;
}

export interface CourseRequest {
  prompt: string;
  use_preloaded?: boolean;
  options?: {
    difficulty?: string;
    duration_weeks?: number;
    includeQuizzes?: boolean;
    includeAssignments?: boolean;
    template?: CourseTemplate;
    separatePages?: boolean;
    includeBonusPage?: boolean;
    includeResourcesPage?: boolean;
    includeCommunityPage?: boolean;
    includeTestimonialsPage?: boolean;
  };
}
