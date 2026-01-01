// ============= Content Pipeline - Main Export =============
// End-to-end content generation pipeline

export * from './types';
export { extractBusinessBrief } from './businessBriefExtractor';
export { generateSitePlan } from './sitePlanGenerator';
export { 
  validateContent, 
  validateSiteSpec, 
  hasBannedContent,
  getBannedPhrasesForPrompt 
} from './contentValidator';

import { extractBusinessBrief } from './businessBriefExtractor';
import { generateSitePlan } from './sitePlanGenerator';
import { validateContent } from './contentValidator';
import type { BusinessBrief, SitePlan, ContentValidationResult } from './types';

/**
 * Complete content pipeline: prompt → brief → plan → validation
 */
export function processPrompt(prompt: string): {
  brief: BusinessBrief;
  plan: SitePlan;
  promptEnhancement: string;
} {
  // Step 1: Extract business brief from prompt
  const brief = extractBusinessBrief(prompt);

  // Step 2: Generate site plan from brief
  const plan = generateSitePlan(brief);

  // Step 3: Create enhanced prompt for AI
  const promptEnhancement = generatePromptEnhancement(brief, plan);

  return { brief, plan, promptEnhancement };
}

/**
 * Generates a structured prompt enhancement for the AI
 */
function generatePromptEnhancement(brief: BusinessBrief, plan: SitePlan): string {
  return `
====================================
## BUSINESS BRIEF (Extracted from User Prompt)
====================================

**BUSINESS IDENTITY:**
- Name: ${brief.businessName || '[User should specify]'}
- Industry: ${brief.industry.replace(/_/g, ' ').toUpperCase()}
- Location: ${brief.location ? `${brief.location.city || ''} ${brief.location.state || ''} ${brief.location.country || ''}`.trim() : 'Not specified'}

**OFFERINGS (Use these in features/services):**
${brief.offerings.map((o) => `- ${o}`).join('\n')}

**DIFFERENTIATORS (Use in headlines/features):**
${brief.differentiators.map((d) => `- ${d}`).join('\n')}

**TONE/STYLE:** ${brief.tone.join(', ')}

**CONVERSION STRATEGY:**
- Primary Goal: ${brief.primaryGoal.toUpperCase()}
- Primary CTA: "${brief.primaryCTA}"
- Secondary CTA: "${brief.secondaryCTA || 'N/A'}"

**FEATURES TO INCLUDE:**
- E-commerce/Cart: ${brief.needsEcommerce ? 'YES - Include shop page and cart icon' : 'NO - Do not include cart/shop'}
- Booking System: ${brief.needsBooking ? 'YES - Include booking/scheduling' : 'NO'}
- Compliance: ${brief.complianceNotes.length > 0 ? brief.complianceNotes.join(', ') : 'None'}

====================================
## SITE PLAN (Follow this structure)
====================================

**PAGES TO CREATE:**
${plan.pages.map((p) => `
### ${p.title} (${p.path})
- Sections: ${p.sections.join(', ')}
- Hero Headline: "${p.heroContent.headline}"
- Hero Subheadline: "${p.heroContent.subheadline}"
- Hero CTA: "${p.heroContent.cta || 'No CTA (form below)'}"
`).join('\n')}

**NAVIGATION (4-5 items max):**
${plan.navigation.map((n) => `- ${n.label} → ${n.href}`).join('\n')}

**CART ICON:** ${plan.hasCart ? 'YES - Include cart icon in header corner' : 'NO - No cart'}

**FOOTER LINKS:**
${plan.footerLinks.map((l) => `- ${l.label}`).join('\n')}

====================================
## SEO KEYWORDS (Incorporate naturally)
====================================
Primary: ${brief.seo.primaryKeywords.join(', ')}
${brief.seo.serviceAreaKeywords.length > 0 ? `Local: ${brief.seo.serviceAreaKeywords.join(', ')}` : ''}

====================================
## ABSOLUTE REQUIREMENTS
====================================
1. Every page MUST have a UNIQUE hero section with different headline/subheadline
2. CTAs must match the business type (use "${brief.primaryCTA}" as primary CTA)
3. Features must describe actual offerings: ${brief.offerings.slice(0, 3).join(', ')}
4. NO generic phrases: "Welcome to our website", "Get Started", "Learn More"
5. NO SaaS terminology for non-SaaS: ${brief.industry !== 'saas' ? 'NO "Fast & Reliable", NO "Secure", NO subscription pricing' : 'SaaS terms OK'}
6. Include location in copy where natural: ${brief.location?.city || 'Not specified'}
====================================
`;
}
