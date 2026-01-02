// ============= Site Spec Validator =============
// Pure validation - NO FALLBACKS
// Spec-First Architecture: AI outputs complete specs, renderer displays as-is

import { SiteSpec, SiteSection } from '@/types/site-spec';

// ============= BANNED PHRASES =============
// These should NEVER appear in a generated site
export const BANNED_PHRASES = [
  'welcome to our website',
  'discover what we have to offer',
  'everything you need to succeed',
  'custom section content goes here',
  'lorem ipsum',
  'feature 1',
  'feature 2',
  'feature 3',
  'fast & reliable',
  'fast and reliable',
  'excellion',
  'website builder',
  'top quality',
  'best in class',
  'world-class',
  'industry-leading',
  'cutting-edge',
  'state-of-the-art',
  'next-generation',
  'revolutionary',
  'transform your business',
  'placeholder',
  'coming soon',
  'tbd',
  'n/a',
  'sample text',
] as const;

// ============= VALIDATION TYPES =============
export type ValidationIssue = {
  page: string;
  sectionId: string;
  sectionType: string;
  issue: 'banned_phrase' | 'empty_content' | 'placeholder' | 'missing_industry_relevance';
  details: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
  score: number;
};

// ============= VALIDATION FUNCTIONS =============

export function hasBannedPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      return phrase;
    }
  }
  
  return null;
}

export function isEmptyOrPlaceholder(content: unknown): boolean {
  if (!content) return true;
  if (typeof content === 'string' && content.trim() === '') return true;
  
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  const lower = str.toLowerCase();
  
  const placeholderPatterns = [
    /lorem\s*ipsum/i,
    /placeholder/i,
    /coming\s*soon/i,
    /insert\s*(text|content)\s*here/i,
    /^tbd$/i,
    /^n\/a$/i,
    /sample\s*(text|content)/i,
  ];
  
  for (const pattern of placeholderPatterns) {
    if (pattern.test(lower)) return true;
  }
  
  return false;
}

export function validateSiteSpec(
  spec: SiteSpec | null,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  if (!spec || !spec.pages) {
    return { valid: false, issues: [{ page: 'root', sectionId: '', sectionType: '', issue: 'empty_content', details: 'No site spec provided' }], score: 0 };
  }
  
  for (const page of spec.pages) {
    for (const section of page.sections || []) {
      const sectionStr = JSON.stringify(section.content || section);
      
      // Check for banned phrases
      const bannedPhrase = hasBannedPhrase(sectionStr);
      if (bannedPhrase) {
        issues.push({
          page: page.path,
          sectionId: section.id,
          sectionType: section.type,
          issue: 'banned_phrase',
          details: `Contains banned phrase: "${bannedPhrase}"`,
        });
      }
      
      // Check for placeholder content
      if (isEmptyOrPlaceholder(section.content)) {
        issues.push({
          page: page.path,
          sectionId: section.id,
          sectionType: section.type,
          issue: 'placeholder',
          details: 'Section contains placeholder or empty content',
        });
      }
    }
  }
  
  const score = Math.max(0, 100 - issues.length * 10);
  
  return {
    valid: issues.length === 0,
    issues,
    score,
  };
}

// SPEC-FIRST: No fillMissingSiteContent function
// The AI must output complete specs - we render exactly what we receive
