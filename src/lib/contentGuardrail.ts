// Content Guardrail - Detect wrong-niche keywords and persona mismatches
import type { NicheCategory } from './nicheRouter';

export type GuardrailResult = {
  valid: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
};

// Forbidden phrase mappings per category
const FORBIDDEN_BY_CATEGORY: Record<NicheCategory, string[]> = {
  ecommerce: ['book appointment', 'schedule session', 'get quote', 'reserve table', 'curriculum', 'modules', 'donate'],
  reseller: ['book consultation', 'schedule demo', 'free trial', 'curriculum', 'reserve table'],
  restaurant: ['curriculum', 'modules', 'test drive', 'browse inventory', 'apply now', 'start trial', 'checkout cart'],
  local_service: ['add to cart', 'checkout', 'curriculum', 'modules', 'view menu', 'browse products'],
  saas: ['menu', 'reservations', 'view inventory', 'book table', 'donate', 'test drive'],
  course: ['book appointment', 'get estimate', 'order food', 'test drive', 'view menu', 'reserve table'],
  coaching: ['add to cart', 'order now', 'view menu', 'browse products', 'test drive', 'inventory'],
  event: ['curriculum', 'book appointment', 'order food', 'browse catalog', 'test drive'],
  real_estate: ['add to cart', 'order now', 'curriculum', 'modules', 'reserve table', 'view menu'],
  nonprofit: ['add to cart', 'checkout', 'book appointment', 'pricing tiers', 'buy now'],
  portfolio: ['add to cart', 'order now', 'donate', 'reserve table', 'curriculum'],
  community: ['order food', 'get estimate', 'view listings', 'test drive', 'browse inventory'],
  fitness: ['add to cart', 'order food', 'view listings', 'curriculum', 'checkout cart'],
};

// Required persona keywords per category
const REQUIRED_KEYWORDS: Record<NicheCategory, string[]> = {
  ecommerce: ['shop', 'product', 'cart', 'buy', 'price'],
  reseller: ['drop', 'cop', 'release', 'collection', 'authentic'],
  restaurant: ['menu', 'fresh', 'dining', 'taste', 'chef'],
  local_service: ['service', 'professional', 'quality', 'expert', 'trusted'],
  saas: ['platform', 'features', 'integrations', 'dashboard', 'automation'],
  course: ['learn', 'curriculum', 'module', 'lesson', 'skill'],
  coaching: ['transform', 'results', 'journey', 'coaching', 'growth'],
  event: ['attend', 'tickets', 'schedule', 'speakers', 'venue'],
  real_estate: ['property', 'listing', 'home', 'tour', 'neighborhood'],
  nonprofit: ['impact', 'mission', 'donate', 'support', 'community'],
  portfolio: ['work', 'project', 'creative', 'design', 'portfolio'],
  community: ['join', 'member', 'community', 'connect', 'belong'],
  fitness: ['gym', 'fitness', 'class', 'train', 'workout', 'member', 'strong'],
};

// Generic phrases that indicate low-quality generation
const GENERIC_PHRASES = [
  'feature 1',
  'feature 2',
  'feature 3',
  'quality service',
  'lorem ipsum',
  'your text here',
  'insert text',
  'placeholder',
  'coming soon',
  'tbd',
  'n/a',
  'example.com',
  'welcome to our website',
];

export function checkContent(content: string, category: NicheCategory): GuardrailResult {
  const lowerContent = content.toLowerCase();
  const issues: string[] = [];
  
  // Check for forbidden phrases
  const forbiddenPhrases = FORBIDDEN_BY_CATEGORY[category] || [];
  for (const phrase of forbiddenPhrases) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      issues.push(`Found forbidden phrase for ${category}: "${phrase}"`);
    }
  }
  
  // Check for generic phrases
  for (const phrase of GENERIC_PHRASES) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      issues.push(`Found generic placeholder phrase: "${phrase}"`);
    }
  }
  
  // Check for required persona keywords (at least 2 should be present)
  const requiredKeywords = REQUIRED_KEYWORDS[category] || [];
  const foundKeywords = requiredKeywords.filter(kw => lowerContent.includes(kw.toLowerCase()));
  if (foundKeywords.length < 2) {
    issues.push(`Missing niche-specific keywords for ${category}. Expected keywords like: ${requiredKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (issues.length >= 3) severity = 'high';
  else if (issues.length >= 1) severity = 'medium';
  
  return {
    valid: issues.length === 0,
    issues,
    severity,
  };
}

export function checkSiteSpec(siteSpec: any, category: NicheCategory): GuardrailResult {
  const allContent: string[] = [];
  
  // Collect all text content from the spec
  if (siteSpec.name) allContent.push(siteSpec.name);
  if (siteSpec.description) allContent.push(siteSpec.description);
  
  // Collect from pages
  for (const page of siteSpec.pages || []) {
    if (page.title) allContent.push(page.title);
    
    for (const section of page.sections || []) {
      if (section.label) allContent.push(section.label);
      if (section.description) allContent.push(section.description);
      
      const content = section.content || {};
      if (content.headline) allContent.push(content.headline);
      if (content.subheadline) allContent.push(content.subheadline);
      if (content.title) allContent.push(content.title);
      if (content.subtitle) allContent.push(content.subtitle);
      if (content.body) allContent.push(content.body);
      
      // Check items
      for (const item of content.items || []) {
        if (item.title) allContent.push(item.title);
        if (item.description) allContent.push(item.description);
        if (item.name) allContent.push(item.name);
        if (item.quote) allContent.push(item.quote);
        if (item.question) allContent.push(item.question);
        if (item.answer) allContent.push(item.answer);
      }
      
      // Check CTAs
      for (const cta of content.ctas || []) {
        if (cta.label) allContent.push(cta.label);
      }
    }
  }
  
  const combinedContent = allContent.join(' ');
  return checkContent(combinedContent, category);
}
