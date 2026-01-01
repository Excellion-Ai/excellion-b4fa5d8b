// ============= Content Validator =============
// Validates generated content against quality rules
// SHARED SOURCE OF TRUTH for banned phrases - used by both frontend and edge functions

import { ContentValidationResult, ContentValidationIssue, BusinessBrief } from './types';
import { SiteSpec } from '@/types/site-spec';

// Absolutely banned phrases - NEVER should appear
export const BANNED_PHRASES = [
  // Generic placeholders
  'welcome to our website',
  'discover what we have to offer',
  'everything you need to succeed',
  'custom section content goes here',
  'lorem ipsum',
  'feature 1',
  'feature 2',
  'service 1',
  'service 2',
  'your text here',
  'add your',
  'insert text',
  'placeholder',

  // Generic tech/SaaS phrases for non-tech businesses
  'fast & reliable',
  'fast and reliable',
  'built for speed',
  'your data is always protected',
  'data protected',
  '99.9% uptime',
  'scalable',
  'enterprise-grade',
  'api access',
  'sla',
  'ownership & export',
  'code ownership',
  
  // Banned generic CTAs
  'start free trial',
  'contact sales',
  'get demo',
  'learn more',
  'get started',
  'explore',
  'discover',
  'lets work together',
  "let's work together",
  'ready to get started',
  
  // Meta/builder references
  'excellion',
  'website builder',
  'ai builder',
  'powered by',
  'built with',
  'made with',

  // Generic quality claims without substance
  'top quality',
  'best in class',
  'world-class',
  'industry-leading',
  'cutting-edge',
  'state-of-the-art',
  'next-generation',
  'revolutionary',
  'game-changing',
  'innovative solutions',
  'synergy',
  'leverage',
  'optimize your workflow',
  
  // Generic testimonials/reviews
  'amazing service',
  'great experience',
  'highly recommend',
  'john d.',
  'jane s.',
  'satisfied customer',
  'happy client',
  
  // Empty/stub content
  'coming soon',
  'under construction',
  'stay tuned',
  'check back later',
  'sample text',
  'example text',
];

// Phrases that are fine for SaaS but banned for other industries
export const SAAS_ONLY_PHRASES = [
  'free trial',
  'pro plan',
  'enterprise plan',
  'starter plan',
  'per month',
  '/month',
  'per user',
  'advanced analytics',
  'dashboard',
  'integration',
  'uptime',
];

// Industry-specific required keywords (at least one must appear)
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  'pressure_washing': ['clean', 'wash', 'pressure', 'surface', 'driveway', 'deck', 'patio', 'grime', 'dirt'],
  'plumbing': ['plumb', 'pipe', 'drain', 'water', 'repair', 'install', 'leak', 'faucet', 'toilet'],
  'auto_detailing': ['detail', 'car', 'vehicle', 'auto', 'shine', 'polish', 'wax', 'interior', 'exterior'],
  'restaurant': ['menu', 'food', 'dine', 'eat', 'dish', 'chef', 'cuisine', 'taste', 'flavor', 'ingredient'],
  'bakery': ['bake', 'bread', 'pastry', 'cake', 'fresh', 'oven', 'flour', 'sweet', 'dough'],
  'law_firm': ['legal', 'attorney', 'lawyer', 'case', 'court', 'represent', 'rights', 'justice', 'counsel'],
  'dental': ['dental', 'teeth', 'smile', 'oral', 'dentist', 'cleaning', 'whitening', 'exam'],
  'salon': ['hair', 'style', 'cut', 'color', 'beauty', 'treatment', 'stylist'],
  'yoga_fitness': ['fitness', 'yoga', 'workout', 'exercise', 'class', 'train', 'strength', 'wellness'],
  'lighter_shop': ['lighter', 'flame', 'collection', 'zippo', 'collector', 'brand', 'repair', 'accessory'],
  'dispensary': ['cannabis', 'flower', 'edible', 'product', 'strain', 'menu'],
  'saas': ['software', 'platform', 'solution', 'feature', 'tool', 'automate', 'integrate'],
};

/**
 * Checks for banned phrases in content
 */
function checkBannedPhrases(content: string, industry: string): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const lowerContent = content.toLowerCase();

  // Check absolutely banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lowerContent.includes(phrase)) {
      issues.push({
        type: 'banned_phrase',
        location: 'content',
        details: `Banned phrase found: "${phrase}"`,
        severity: 'error',
      });
    }
  }

  // Check SaaS-only phrases for non-SaaS industries
  if (industry !== 'saas') {
    for (const phrase of SAAS_ONLY_PHRASES) {
      if (lowerContent.includes(phrase)) {
        issues.push({
          type: 'banned_phrase',
          location: 'content',
          details: `SaaS-only phrase found in non-SaaS business: "${phrase}"`,
          severity: 'error',
        });
      }
    }
  }

  return issues;
}

/**
 * Checks for placeholder content
 */
function checkPlaceholders(content: string): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const lowerContent = content.toLowerCase();

  const placeholderPatterns = [
    /\[.*?\]/g, // [placeholder]
    /\{.*?\}/g, // {placeholder}
    /xxx+/gi,
    /tbd/gi,
    /coming soon/gi,
    /under construction/gi,
    /lorem/gi,
    /ipsum/gi,
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(lowerContent)) {
      issues.push({
        type: 'placeholder',
        location: 'content',
        details: `Placeholder pattern found: ${pattern.source}`,
        severity: 'error',
      });
    }
  }

  return issues;
}

/**
 * Checks for industry relevance
 */
function checkIndustryRelevance(content: string, industry: string): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const lowerContent = content.toLowerCase();

  const keywords = INDUSTRY_KEYWORDS[industry];
  if (!keywords) return issues;

  // Check if at least some industry keywords appear
  const foundKeywords = keywords.filter((kw) => lowerContent.includes(kw.toLowerCase()));
  
  if (foundKeywords.length === 0) {
    issues.push({
      type: 'generic_content',
      location: 'content',
      details: `No industry-specific keywords found. Expected at least one of: ${keywords.slice(0, 5).join(', ')}`,
      severity: 'warning',
    });
  }

  return issues;
}

/**
 * Checks CTA appropriateness
 */
function checkCTAs(content: string, brief: BusinessBrief): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const lowerContent = content.toLowerCase();

  // Bad CTAs that should never appear for non-SaaS
  if (brief.industry !== 'saas') {
    const badCTAs = ['start free trial', 'contact sales', 'get demo', 'sign up'];
    for (const cta of badCTAs) {
      if (lowerContent.includes(cta)) {
        issues.push({
          type: 'wrong_cta',
          location: 'cta',
          details: `Inappropriate CTA for ${brief.industry}: "${cta}"`,
          severity: 'error',
        });
      }
    }
  }

  // Check for overly generic CTAs
  const genericCTAs = ['learn more', 'get started', 'explore', 'discover'];
  for (const cta of genericCTAs) {
    if (lowerContent.includes(cta)) {
      issues.push({
        type: 'wrong_cta',
        location: 'cta',
        details: `Generic CTA should be more specific: "${cta}"`,
        severity: 'warning',
      });
    }
  }

  return issues;
}

/**
 * Checks for specific, concrete details
 */
function checkSpecificity(content: string): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  // Content should have some concrete details (numbers, locations, specific services)
  const specificityIndicators = [
    /\d+/g, // numbers
    /\$\d+/g, // prices
    /\d+\s*(years?|months?|hours?|days?)/gi, // time references
    /located|serving|based in/gi, // location references
    /call|book|schedule|order|visit/gi, // action words
  ];

  let specificityScore = 0;
  for (const pattern of specificityIndicators) {
    if (pattern.test(content)) {
      specificityScore++;
    }
  }

  // If content is substantial but lacks specificity
  if (content.length > 500 && specificityScore < 2) {
    issues.push({
      type: 'missing_specifics',
      location: 'content',
      details: 'Content lacks specific details (numbers, locations, concrete offerings)',
      severity: 'warning',
    });
  }

  return issues;
}

/**
 * Main validation function
 */
export function validateContent(content: string, brief: BusinessBrief): ContentValidationResult {
  const issues: ContentValidationIssue[] = [];

  // Run all checks
  issues.push(...checkBannedPhrases(content, brief.industry));
  issues.push(...checkPlaceholders(content));
  issues.push(...checkIndustryRelevance(content, brief.industry));
  issues.push(...checkCTAs(content, brief));
  issues.push(...checkSpecificity(content));

  // Calculate score
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));

  return {
    valid: errorCount === 0,
    issues,
    score,
  };
}

/**
 * Validates a SiteSpec object
 */
export function validateSiteSpec(siteSpec: any, brief: BusinessBrief): ContentValidationResult {
  // Convert SiteSpec to string for validation
  const contentString = JSON.stringify(siteSpec);
  return validateContent(contentString, brief);
}

/**
 * Quick check if a single string contains banned content
 */
export function hasBannedContent(text: string, industry = 'service_general'): boolean {
  const lowerText = text.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase)) {
      return true;
    }
  }

  if (industry !== 'saas') {
    for (const phrase of SAAS_ONLY_PHRASES) {
      if (lowerText.includes(phrase)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get a list of banned phrases for injection into AI prompts
 */
export function getBannedPhrasesForPrompt(): string {
  return BANNED_PHRASES.map((p) => `"${p}"`).join(', ');
}

/**
 * FINAL-SPEC VALIDATION: Deep scan for banned phrases and placeholders
 * Used in BuilderShell AFTER spec is assembled but BEFORE rendering
 */
export type FinalSpecValidationResult = {
  valid: boolean;
  violations: Array<{
    sectionId: string;
    phrase: string;
    location: string;
  }>;
  hasPlaceholders: boolean;
};

export function validateFinalSpec(spec: SiteSpec | null, industry = 'service_general'): FinalSpecValidationResult {
  const result: FinalSpecValidationResult = {
    valid: true,
    violations: [],
    hasPlaceholders: false,
  };

  if (!spec) return result;

  // Convert full spec to searchable string
  const specString = JSON.stringify(spec).toLowerCase();

  // Check for all banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (specString.includes(phrase.toLowerCase())) {
      result.valid = false;
      result.violations.push({
        sectionId: 'spec',
        phrase,
        location: 'full-spec',
      });
    }
  }

  // Check for SaaS-only phrases in non-SaaS industries
  if (industry !== 'saas') {
    for (const phrase of SAAS_ONLY_PHRASES) {
      if (specString.includes(phrase.toLowerCase())) {
        result.valid = false;
        result.violations.push({
          sectionId: 'spec',
          phrase: `SaaS-only: ${phrase}`,
          location: 'full-spec',
        });
      }
    }
  }

  // Check for placeholder patterns
  const placeholderPatterns = [
    /\[.*?\]/g, // [placeholder]
    /\{.*?\}/g, // {placeholder}
    /xxx+/gi,
    /tbd/gi,
    /lorem ipsum/gi,
    /custom section content/gi,
    /add your customer review/gi,
    /your testimonial goes here/gi,
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(specString)) {
      result.hasPlaceholders = true;
      result.valid = false;
      break;
    }
  }

  return result;
}
