import { SectionConfig } from './SectionEditor';

export const LANDING_SECTIONS: SectionConfig[] = [
  { id: 'hero', label: 'Hero Section', required: true },
  { id: 'outcomes', label: "What You'll Learn" },
  { id: 'curriculum', label: 'Curriculum Overview' },
  { id: 'instructor', label: 'Meet Your Instructor' },
  { id: 'testimonials', label: 'Student Testimonials' },
  { id: 'features', label: 'Course Features' },
  { id: 'faq', label: 'Frequently Asked Questions' },
  { id: 'guarantee', label: 'Money-Back Guarantee' },
  { id: 'bonus', label: 'Bonus Materials' },
  { id: 'cta', label: 'Enroll CTA', required: true },
];

export const CURRICULUM_SECTIONS: SectionConfig[] = [
  { id: 'header', label: 'Course Header', required: true },
  { id: 'modules', label: 'Module List', required: true },
  { id: 'footer', label: 'Footer Navigation' },
];

export const LESSON_SECTIONS: SectionConfig[] = [
  { id: 'sidebar', label: 'Lesson Sidebar' },
  { id: 'content', label: 'Lesson Content', required: true },
  { id: 'navigation', label: 'Prev/Next Navigation' },
];

export const DASHBOARD_SECTIONS: SectionConfig[] = [
  { id: 'welcome', label: 'Welcome Message' },
  { id: 'progress', label: 'Progress Bar', required: true },
  { id: 'next_lesson', label: 'Next Lesson Card' },
  { id: 'stats', label: 'Completion Stats' },
];

export const DEFAULT_PAGE_SECTIONS = {
  landing: ['hero', 'outcomes', 'curriculum', 'faq', 'cta'],
  curriculum: ['header', 'modules', 'footer'],
  lesson: ['sidebar', 'content', 'navigation'],
  dashboard: ['welcome', 'progress', 'next_lesson', 'stats'],
};

export function getSectionsForPage(pageType: 'landing' | 'curriculum' | 'lesson' | 'dashboard') {
  switch (pageType) {
    case 'landing':
      return LANDING_SECTIONS;
    case 'curriculum':
      return CURRICULUM_SECTIONS;
    case 'lesson':
      return LESSON_SECTIONS;
    case 'dashboard':
      return DASHBOARD_SECTIONS;
  }
}
