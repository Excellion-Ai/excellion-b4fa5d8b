// Template configurations extracted to reduce bundle size

export type CourseTemplate = 'creator' | 'technical' | 'academic' | 'visual' | 'standard' | 'challenge' | 'leadmagnet' | 'webinar' | 'coach';
export type BaseTemplate = 'creator' | 'technical' | 'academic' | 'visual';

export const TEMPLATE_TO_BASE: Record<CourseTemplate, BaseTemplate> = {
  creator: 'creator',
  technical: 'technical',
  academic: 'academic',
  visual: 'visual',
  standard: 'technical',
  challenge: 'creator',
  leadmagnet: 'creator',
  webinar: 'academic',
  coach: 'creator',
};

export const TEMPLATE_CONFIG: Record<BaseTemplate, {
  brandColor: string;
  tone: string;
  contentStyle: string;
  lessonFormat: string;
  copyStyle: string;
  featureIcons: string[];
  pricingFeatures: string[];
}> = {
  creator: {
    brandColor: '#f59e0b',
    tone: 'warm, personal, and encouraging',
    contentStyle: 'story-driven with personal anecdotes and real-world examples',
    lessonFormat: 'conversational video lessons with personal stories and actionable takeaways',
    copyStyle: 'Use first-person, be authentic, share personal journey and transformation stories',
    featureIcons: ['Heart', 'Users', 'Sparkles', 'MessageCircle', 'Star'],
    pricingFeatures: ['Personal coaching support', 'Private community access', 'Lifetime updates', 'Bonus materials'],
  },
  technical: {
    brandColor: '#6366f1',
    tone: 'precise, structured, and professional',
    contentStyle: 'systematic with code examples, diagrams, and step-by-step tutorials',
    lessonFormat: 'hands-on coding tutorials with exercises and real project examples',
    copyStyle: 'Use technical terminology accurately, focus on practical skills and measurable outcomes',
    featureIcons: ['Code', 'Terminal', 'Laptop', 'Zap', 'Database'],
    pricingFeatures: ['Source code included', 'Certificate of completion', 'Project files', 'Code review sessions'],
  },
  academic: {
    brandColor: '#1e40af',
    tone: 'formal, scholarly, and authoritative',
    contentStyle: 'research-backed with citations, case studies, and theoretical frameworks',
    lessonFormat: 'structured lectures with readings, assessments, and academic rigor',
    copyStyle: 'Use formal language, cite research, emphasize credentials and methodology',
    featureIcons: ['GraduationCap', 'BookOpen', 'Award', 'FileText', 'Shield'],
    pricingFeatures: ['Accredited certificate', 'Academic support', 'Research materials', 'Professional credential'],
  },
  visual: {
    brandColor: '#f43f5e',
    tone: 'creative, inspiring, and visually-oriented',
    contentStyle: 'portfolio-focused with visual examples, before/after showcases, and creative exercises',
    lessonFormat: 'visual demonstrations with portfolio-building projects and creative challenges',
    copyStyle: 'Use evocative language, focus on creativity, inspiration, and visual transformation',
    featureIcons: ['Palette', 'Image', 'Brush', 'Eye', 'Sparkles'],
    pricingFeatures: ['Portfolio review', 'Creative feedback', 'Asset library', 'Gallery showcase'],
  },
};

export const NICHE_KEYWORDS: Record<BaseTemplate, string[]> = {
  creator: [
    'coach', 'coaching', 'personal brand', 'influencer', 'creator', 'content',
    'social media', 'youtube', 'podcast', 'speaking', 'motivation', 'mindset',
    'life', 'wellness', 'self-help', 'productivity', 'habits', 'leadership',
    'business', 'entrepreneur', 'marketing', 'sales', 'communication',
    'relationship', 'parenting', 'fitness trainer', 'health coach'
  ],
  technical: [
    'programming', 'coding', 'developer', 'software', 'web', 'app', 'python',
    'javascript', 'react', 'data', 'machine learning', 'ai', 'artificial intelligence',
    'database', 'cloud', 'devops', 'cybersecurity', 'blockchain', 'crypto',
    'api', 'backend', 'frontend', 'fullstack', 'engineering', 'it', 'tech',
    'automation', 'excel', 'spreadsheet', 'sql', 'analytics'
  ],
  academic: [
    'certification', 'certificate', 'degree', 'accredited', 'professional',
    'medical', 'legal', 'law', 'healthcare', 'nursing', 'psychology',
    'research', 'science', 'biology', 'chemistry', 'physics', 'mathematics',
    'economics', 'finance', 'accounting', 'mba', 'management', 'hr',
    'compliance', 'regulatory', 'exam prep', 'cpa', 'pmp', 'six sigma'
  ],
  visual: [
    'design', 'photography', 'video', 'editing', 'photoshop', 'illustrator',
    'figma', 'ui', 'ux', 'graphic', 'art', 'drawing', 'painting', 'illustration',
    'animation', 'motion', '3d', 'cinema', 'film', 'creative', 'portfolio',
    'fashion', 'interior', 'architecture', 'branding', 'logo', 'visual'
  ],
};

export const OPTIONAL_SECTIONS: Record<BaseTemplate, string[]> = {
  creator: ['who-is-this-for', 'meet-your-instructor', 'success-stories', 'community-access', 'transformation-journey'],
  technical: ['who-is-this-for', 'prerequisites', 'tech-stack', 'projects-portfolio', 'career-outcomes'],
  academic: ['who-is-this-for', 'credentials', 'research-methodology', 'assessment-structure', 'professional-outcomes'],
  visual: ['who-is-this-for', 'portfolio-showcase', 'before-after-gallery', 'creative-community', 'tools-resources'],
};

const MULTI_PAGE_KEYWORDS = ['multiple pages', 'separate pages', 'multi-page', 'multipage', 'with pages', 'different pages', 'extra pages', 'additional pages', 'full course', 'complete course', 'comprehensive course', 'full site'];
const BONUS_PAGE_KEYWORDS = ['bonus', 'bonuses', 'bonus page', 'bonus content', 'extra content', 'free bonus', 'include bonuses', 'with bonuses'];
const RESOURCES_PAGE_KEYWORDS = ['resource', 'resources', 'downloads', 'downloadable', 'templates', 'worksheets', 'checklists', 'resource page', 'materials'];
const COMMUNITY_PAGE_KEYWORDS = ['community', 'forum', 'discord', 'slack', 'group', 'membership', 'community page', 'student community', 'private group'];
const TESTIMONIALS_PAGE_KEYWORDS = ['testimonial', 'testimonials', 'reviews', 'success stories', 'student reviews', 'social proof', 'testimonials page'];

export interface MultiPageDetection {
  isMultiPage: boolean;
  includeBonusPage: boolean;
  includeResourcesPage: boolean;
  includeCommunityPage: boolean;
  includeTestimonialsPage: boolean;
}

export function detectMultiPageIntent(prompt: string): MultiPageDetection {
  const lowerPrompt = prompt.toLowerCase();
  const hasMultiPageIntent = MULTI_PAGE_KEYWORDS.some(kw => lowerPrompt.includes(kw));
  const includeBonusPage = BONUS_PAGE_KEYWORDS.some(kw => lowerPrompt.includes(kw));
  const includeResourcesPage = RESOURCES_PAGE_KEYWORDS.some(kw => lowerPrompt.includes(kw));
  const includeCommunityPage = COMMUNITY_PAGE_KEYWORDS.some(kw => lowerPrompt.includes(kw));
  const includeTestimonialsPage = TESTIMONIALS_PAGE_KEYWORDS.some(kw => lowerPrompt.includes(kw));
  const isMultiPage = hasMultiPageIntent || includeBonusPage || includeResourcesPage || includeCommunityPage || includeTestimonialsPage;
  
  if (hasMultiPageIntent && !includeBonusPage && !includeResourcesPage && !includeCommunityPage && !includeTestimonialsPage) {
    return { isMultiPage: true, includeBonusPage: true, includeResourcesPage: true, includeCommunityPage: false, includeTestimonialsPage: true };
  }
  
  return { isMultiPage, includeBonusPage, includeResourcesPage, includeCommunityPage, includeTestimonialsPage };
}

export function detectTemplate(prompt: string): BaseTemplate {
  const lowerPrompt = prompt.toLowerCase();
  const scores: Record<BaseTemplate, number> = { creator: 0, technical: 0, academic: 0, visual: 0 };
  
  for (const [template, keywords] of Object.entries(NICHE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        scores[template as BaseTemplate] += keyword.split(' ').length;
      }
    }
  }
  
  let maxScore = 0;
  let selectedTemplate: BaseTemplate = 'creator';
  for (const [template, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedTemplate = template as BaseTemplate;
    }
  }
  return selectedTemplate;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 50);
}

export function selectRandomSections(template: BaseTemplate): string[] {
  const sections = OPTIONAL_SECTIONS[template];
  const count = 2 + Math.floor(Math.random() * 2);
  const shuffled = [...sections].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
