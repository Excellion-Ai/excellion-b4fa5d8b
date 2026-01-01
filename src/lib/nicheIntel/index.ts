// ============= Niche Intelligence Module =============
// Main entry point for the Pattern Pack system

export * from './types';
export * from './patternPacks/library';
export * from './imageFiller';
export * from './scoring';

// Re-export commonly used functions
import { 
  getPatternPack, 
  getAllPatternPacks, 
  getPacksByIntent,
  getTopPerformingPacks as getTopPacksByIntent,
  findPackById,
  industryToNicheCategory,
} from './patternPacks/library';

import { fillImages, fillImagesFromStock, fillImagesFromAI } from './imageFiller';
import { scorePatternPack, scoreAllPacks, getTopPerformingPacks, compareScores } from './scoring';

import type { 
  BusinessBrief, 
  PatternPack, 
  GetPatternPackRequest,
  BusinessIntent,
  NicheCategory,
  ImageFillOptions,
} from './types';

// ============= CONVENIENCE FUNCTIONS =============

/**
 * Get the best pattern pack for a business
 */
export function selectBestPack(request: GetPatternPackRequest): PatternPack {
  return getPatternPack({ ...request, preferHighPerformance: true });
}

/**
 * Get pack summary for display in UI
 */
export function getPackSummary(pack: PatternPack): {
  id: string;
  label: string;
  pageCount: number;
  sectionTypes: string[];
  primaryCTAs: string[];
  trustSignals: string[];
  score: number;
} {
  const allSectionTypes = new Set<string>();
  pack.pages.forEach(page => {
    page.sectionOrder.forEach(section => {
      allSectionTypes.add(section.type);
    });
  });
  
  return {
    id: pack.id,
    label: pack.label,
    pageCount: pack.pages.length,
    sectionTypes: Array.from(allSectionTypes),
    primaryCTAs: pack.ctaPatterns.primaryCtaTextHints.slice(0, 3),
    trustSignals: pack.trustSignals.slice(0, 4),
    score: pack.proxyScore || scorePatternPack(pack).totalScore,
  };
}

/**
 * Generate prompt injection for AI content generation
 */
export function generatePackPromptInjection(
  pack: PatternPack,
  brief: BusinessBrief
): string {
  const pages = pack.pages.map(p => `- ${p.title} (/${p.slug}): ${p.sectionOrder.map(s => s.type).join(', ')}`).join('\n');
  
  return `
====================================
PATTERN PACK: ${pack.label} (${pack.id})
====================================

**PAGE STRUCTURE (Follow this exactly):**
${pages}

**CTA TEXT PATTERNS:**
- Primary: ${pack.ctaPatterns.primaryCtaTextHints.slice(0, 3).join(' | ')}
- Secondary: ${pack.ctaPatterns.secondaryCtaTextHints.slice(0, 2).join(' | ')}

**TRUST SIGNALS TO INCLUDE:**
${pack.trustSignals.map(t => `- ${t}`).join('\n')}

**WARNINGS:**
${pack.warnings.map(w => `- ⚠️ ${w}`).join('\n')}

**BUSINESS CONTEXT:**
- Name: ${brief.businessName || '[Generate appropriate name]'}
- Industry: ${brief.industry}
- Intent: ${brief.intent}
- Primary Goal: ${brief.primaryGoal}
- Location: ${brief.location?.city || 'Not specified'}

====================================
RULES:
1. Follow the page structure above EXACTLY
2. Use CTA patterns appropriate for this business type
3. Include trust signals naturally in content
4. Every page hero must be UNIQUE (different headline/subheadline)
5. Reference actual offerings: ${brief.offerings.slice(0, 4).join(', ')}
====================================
`;
}

// Export utility functions
export {
  getPatternPack,
  getAllPatternPacks,
  getPacksByIntent,
  findPackById,
  industryToNicheCategory,
  fillImages,
  fillImagesFromStock,
  fillImagesFromAI,
  scorePatternPack,
  scoreAllPacks,
  getTopPerformingPacks,
  compareScores,
};
