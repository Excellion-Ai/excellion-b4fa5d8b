// Layout Signature - Compute hash from pages + section types
import type { SiteSpec, SitePage } from '@/types/site-spec';

export type LayoutSignature = {
  hash: string;
  pageCount: number;
  sectionPattern: string;
  uniqueSectionTypes: string[];
};

// Compute signature from a SiteSpec
export function computeSignature(spec: SiteSpec): LayoutSignature {
  const pages = spec.pages || [];
  const pageCount = pages.length;
  
  // Build section pattern: "home:hero,features,cta|about:hero,team"
  const pagePatterns = pages.map(page => {
    const path = page.path.replace('/', '') || 'home';
    const sections = (page.sections || []).map(s => s.type).join(',');
    return `${path}:${sections}`;
  });
  const sectionPattern = pagePatterns.join('|');
  
  // Get unique section types across all pages
  const allSectionTypes = new Set<string>();
  for (const page of pages) {
    for (const section of page.sections || []) {
      allSectionTypes.add(section.type);
    }
  }
  const uniqueSectionTypes = Array.from(allSectionTypes).sort();
  
  // Compute hash
  const hash = simpleHash(sectionPattern);
  
  return {
    hash,
    pageCount,
    sectionPattern,
    uniqueSectionTypes,
  };
}

// Simple hash function for signature
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Check if signature matches generic pattern
export function isGenericSignature(signature: LayoutSignature): boolean {
  // Generic pattern: single page with hero, features, testimonials, cta
  if (signature.pageCount === 1) {
    const genericPatterns = [
      'hero,features,testimonials,cta',
      'hero,features,cta',
      'hero,features,testimonials,faq,cta',
      'hero,features,pricing,cta',
    ];
    
    for (const pattern of genericPatterns) {
      if (signature.sectionPattern.includes(pattern)) {
        // Only generic if no other meaningful sections
        if (signature.uniqueSectionTypes.length <= 5) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Compare two signatures for similarity
export function signatureSimilarity(a: LayoutSignature, b: LayoutSignature): number {
  if (a.hash === b.hash) return 1.0;
  if (a.pageCount !== b.pageCount) return 0.3;
  
  // Compare section types overlap
  const aSet = new Set(a.uniqueSectionTypes);
  const bSet = new Set(b.uniqueSectionTypes);
  const intersection = a.uniqueSectionTypes.filter(t => bSet.has(t));
  const union = new Set([...a.uniqueSectionTypes, ...b.uniqueSectionTypes]);
  
  const jaccardSimilarity = intersection.length / union.size;
  
  // If patterns are exact match, high similarity
  if (a.sectionPattern === b.sectionPattern) return 0.95;
  
  return jaccardSimilarity;
}

// Storage key for recent signatures
const RECENT_SIGNATURES_KEY = 'excellion_recent_signatures';
const MAX_STORED_SIGNATURES = 10;

export function storeSignature(signature: LayoutSignature): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(RECENT_SIGNATURES_KEY);
    const signatures: string[] = stored ? JSON.parse(stored) : [];
    
    // Add new signature hash
    signatures.unshift(signature.hash);
    
    // Keep only last N
    const trimmed = signatures.slice(0, MAX_STORED_SIGNATURES);
    localStorage.setItem(RECENT_SIGNATURES_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

export function getRecentSignatures(): string[] {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENT_SIGNATURES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearSignatures(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.removeItem(RECENT_SIGNATURES_KEY);
  } catch {
    // Ignore
  }
}
