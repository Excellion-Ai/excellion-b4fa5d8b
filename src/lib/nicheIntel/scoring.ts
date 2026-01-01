// ============= Pattern Pack Scoring =============
// Scores packs using observable proxies (NOT claims about conversion rates)

import { PatternPack, PatternPackScore, SectionBlueprint } from './types';

// ============= SCORING WEIGHTS =============
const WEIGHTS = {
  heroClarity: 20,      // Clear value prop + target audience
  ctaAboveFold: 20,     // Primary CTA visible immediately
  trustNearCTA: 15,     // Trust signals near conversion points
  lowFriction: 20,      // Simple navigation, few steps
  performanceProxy: 15, // Estimated load speed
  accessibilityProxy: 10, // Basic a11y signals
};

// ============= SCORING FUNCTIONS =============

function scoreHeroClarity(pack: PatternPack): number {
  const homePage = pack.pages.find(p => p.slug === 'home');
  if (!homePage) return 0;
  
  const heroSection = homePage.sectionOrder.find(s => s.type === 'hero');
  if (!heroSection) return 0;
  
  let score = 0;
  
  // Has headline hint
  if (heroSection.contentHints?.headline) score += 40;
  
  // Has subheadline hint
  if (heroSection.contentHints?.subheadline) score += 30;
  
  // Has CTA text
  if (heroSection.contentHints?.ctaText) score += 30;
  
  return score;
}

function scoreCtaAboveFold(pack: PatternPack): number {
  const homePage = pack.pages.find(p => p.slug === 'home');
  if (!homePage) return 0;
  
  // Hero should be first and have CTA
  const firstSection = homePage.sectionOrder[0];
  if (!firstSection || firstSection.type !== 'hero') return 30;
  
  let score = 50; // Hero is first
  
  // Hero has CTA
  if (firstSection.contentHints?.ctaText) score += 50;
  
  return score;
}

function scoreTrustNearCTA(pack: PatternPack): number {
  let score = 0;
  
  // Has trust signals defined
  if (pack.trustSignals.length > 0) score += 40;
  if (pack.trustSignals.length >= 3) score += 20;
  
  // Check if testimonials appear early (in first 4 sections of home)
  const homePage = pack.pages.find(p => p.slug === 'home');
  if (homePage) {
    const first4 = homePage.sectionOrder.slice(0, 4);
    if (first4.some(s => s.type === 'testimonials')) score += 20;
    if (first4.some(s => s.type === 'stats')) score += 20;
  }
  
  return Math.min(score, 100);
}

function scoreLowFriction(pack: PatternPack): number {
  let score = 100;
  
  // Penalize too many pages (complex nav)
  if (pack.pages.length > 7) score -= 20;
  if (pack.pages.length > 10) score -= 20;
  
  // Penalize too many sections per page (long scroll)
  const homePage = pack.pages.find(p => p.slug === 'home');
  if (homePage && homePage.sectionOrder.length > 8) score -= 15;
  
  // Bonus for having contact easily accessible
  if (pack.pages.some(p => p.slug === 'contact')) score += 0; // Expected
  else score -= 20;
  
  // Bonus for clear CTA patterns
  if (pack.ctaPatterns.primaryCtaTextHints.length >= 2) score += 0; // Expected
  
  return Math.max(score, 0);
}

function scorePerformanceProxy(pack: PatternPack): number {
  let score = 80; // Base score
  
  // Count total image slots
  const totalImageSlots = pack.imageSlots.length + 
    pack.pages.reduce((acc, page) => 
      acc + page.sectionOrder.reduce((sAcc, section) => 
        sAcc + (section.imageSlots?.length || 0), 0
      ), 0
    );
  
  // Penalize heavy image requirements
  if (totalImageSlots > 15) score -= 10;
  if (totalImageSlots > 25) score -= 10;
  if (totalImageSlots > 40) score -= 10;
  
  // Penalize complex sections
  const galleryCount = pack.pages.reduce((acc, page) =>
    acc + page.sectionOrder.filter(s => s.type === 'gallery').length, 0
  );
  if (galleryCount > 2) score -= 10;
  
  return Math.max(score, 0);
}

function scoreAccessibilityProxy(pack: PatternPack): number {
  let score = 70; // Base score
  
  // Check for good section variety (semantic structure)
  const allSectionTypes = new Set<string>();
  pack.pages.forEach(page => {
    page.sectionOrder.forEach(section => {
      allSectionTypes.add(section.type);
    });
  });
  
  // Good variety suggests semantic HTML
  if (allSectionTypes.size >= 5) score += 15;
  if (allSectionTypes.size >= 7) score += 15;
  
  return Math.min(score, 100);
}

// ============= MAIN SCORING FUNCTION =============

export function scorePatternPack(pack: PatternPack): PatternPackScore {
  const breakdown = {
    heroClarity: scoreHeroClarity(pack),
    ctaAboveFold: scoreCtaAboveFold(pack),
    trustNearCTA: scoreTrustNearCTA(pack),
    lowFriction: scoreLowFriction(pack),
    performanceProxy: scorePerformanceProxy(pack),
    accessibilityProxy: scoreAccessibilityProxy(pack),
  };
  
  const totalScore = Math.round(
    (breakdown.heroClarity * WEIGHTS.heroClarity +
     breakdown.ctaAboveFold * WEIGHTS.ctaAboveFold +
     breakdown.trustNearCTA * WEIGHTS.trustNearCTA +
     breakdown.lowFriction * WEIGHTS.lowFriction +
     breakdown.performanceProxy * WEIGHTS.performanceProxy +
     breakdown.accessibilityProxy * WEIGHTS.accessibilityProxy) / 100
  );
  
  let tier: PatternPackScore['tier'];
  if (totalScore >= 80) tier = 'high-performance';
  else if (totalScore >= 60) tier = 'standard';
  else tier = 'needs-improvement';
  
  return {
    packId: pack.id,
    totalScore,
    breakdown,
    tier,
  };
}

// ============= BATCH SCORING =============

export function scoreAllPacks(packs: PatternPack[]): PatternPackScore[] {
  return packs.map(pack => scorePatternPack(pack));
}

export function getTopPerformingPacks(
  packs: PatternPack[],
  limit = 3
): Array<{ pack: PatternPack; score: PatternPackScore }> {
  const scored = packs.map(pack => ({
    pack,
    score: scorePatternPack(pack),
  }));
  
  return scored
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .slice(0, limit);
}

// ============= SCORE COMPARISON =============

export function compareScores(
  scoreA: PatternPackScore,
  scoreB: PatternPackScore
): { winner: string; advantage: string[] } {
  const advantages: string[] = [];
  
  if (scoreA.breakdown.heroClarity > scoreB.breakdown.heroClarity + 10) {
    advantages.push('Clearer hero messaging');
  }
  if (scoreA.breakdown.ctaAboveFold > scoreB.breakdown.ctaAboveFold + 10) {
    advantages.push('Better CTA placement');
  }
  if (scoreA.breakdown.trustNearCTA > scoreB.breakdown.trustNearCTA + 10) {
    advantages.push('Stronger trust signals');
  }
  if (scoreA.breakdown.lowFriction > scoreB.breakdown.lowFriction + 10) {
    advantages.push('Lower friction navigation');
  }
  if (scoreA.breakdown.performanceProxy > scoreB.breakdown.performanceProxy + 10) {
    advantages.push('Better performance');
  }
  
  return {
    winner: scoreA.totalScore >= scoreB.totalScore ? scoreA.packId : scoreB.packId,
    advantage: advantages,
  };
}
