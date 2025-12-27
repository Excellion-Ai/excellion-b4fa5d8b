// ============= Scaffold Types =============
// Types for the generation scaffold system

import type { SiteSpec, SiteSection } from './site-spec';
import type { LayoutSignature } from '@/lib/layoutSignature';
import type { IntegrationType } from '@/lib/nicheRouter';

// Section type alias for PageMap
export type SectionType = SiteSection['type'];

// Integration keys that map to actual components (subset of IntegrationType)
export type IntegrationKey = 
  | 'stripe' 
  | 'calendly' 
  | 'ordering' 
  | 'reservations' 
  | 'maps' 
  | 'email_capture';

export type ComponentTypeKey = 
  | 'checkout' 
  | 'booking_embed' 
  | 'order_links' 
  | 'reservation_embed' 
  | 'map_embed' 
  | 'newsletter_form';

export const INTEGRATION_TO_COMPONENT = {
  stripe: 'checkout',
  calendly: 'booking_embed',
  ordering: 'order_links',
  reservations: 'reservation_embed',
  maps: 'map_embed',
  email_capture: 'newsletter_form',
} as const satisfies Record<IntegrationKey, ComponentTypeKey>;

export type ScaffoldViolationType = 
  | 'missing_page' 
  | 'missing_section' 
  | 'forbidden_phrase' 
  | 'missing_integration';

export type ScaffoldViolation = {
  type: ScaffoldViolationType;
  details: string;
};

export type ScaffoldValidationResult = {
  valid: boolean;
  violations: ScaffoldViolation[];
};

export type RequiredPage = {
  path: string;
  title: string;
  requiredSections: string[];
};

export type CtaRules = {
  primary: string;
  secondary?: string;
  urgency?: string;
};

export type GenerationScaffold = {
  category: string;
  goal: string;
  archetypeId: string;
  requiredPages: RequiredPage[];
  ctaRules: CtaRules;
  forbiddenPhrases: string[];
  integrations: IntegrationType[];
  layoutSignature?: string;
};

export type PageMap = Record<string, SectionType[]>;

export type DebugInfo = {
  lastScaffold: GenerationScaffold | null;
  lastSpecPageMap: PageMap;
  lastGuardrailViolations: string[];
  lastLayoutSignature: LayoutSignature | null;
};

// Validate SiteSpec against scaffold requirements
export function validateSpecAgainstScaffold(
  siteSpec: SiteSpec | null, 
  scaffold: GenerationScaffold | null
): ScaffoldValidationResult {
  const violations: ScaffoldViolation[] = [];
  
  if (!siteSpec || !scaffold) {
    return { valid: true, violations: [] };
  }
  
  const specPages = siteSpec.pages || [];
  const specPagePaths = specPages.map(p => p.path);
  
  // 1. Check all required pages exist
  if (scaffold.requiredPages && Array.isArray(scaffold.requiredPages)) {
    for (const reqPage of scaffold.requiredPages) {
      if (!specPagePaths.includes(reqPage.path)) {
        violations.push({
          type: 'missing_page',
          details: `Missing required page: ${reqPage.path} (${reqPage.title})`,
        });
      } else {
        // 2. Check required sections for this page
        if (reqPage.requiredSections && Array.isArray(reqPage.requiredSections)) {
          const foundPage = specPages.find(p => p.path === reqPage.path);
          const pageSectionTypes = (foundPage?.sections || []).map(s => s.type);
          
          for (const reqSection of reqPage.requiredSections) {
            if (!pageSectionTypes.includes(reqSection as SiteSection['type'])) {
              violations.push({
                type: 'missing_section',
                details: `Page "${reqPage.path}" missing required section: ${reqSection}`,
              });
            }
          }
        }
      }
    }
  }
  
  // 3. Check forbidden phrases
  if (scaffold.forbiddenPhrases && Array.isArray(scaffold.forbiddenPhrases)) {
    const specString = JSON.stringify(siteSpec).toLowerCase();
    for (const phrase of scaffold.forbiddenPhrases) {
      if (phrase && specString.includes(phrase.toLowerCase())) {
        violations.push({
          type: 'forbidden_phrase',
          details: `Forbidden phrase found: "${phrase}"`,
        });
      }
    }
  }
  
  // 4. Check integrations have matching components (only for mapped integrations)
  if (scaffold.integrations && Array.isArray(scaffold.integrations)) {
    const allSections = specPages.flatMap(p => p.sections || []);
    const componentTypes = allSections
      .filter(s => {
        const content = s.content as { componentType?: string } | undefined;
        return content?.componentType;
      })
      .map(s => (s.content as { componentType: string }).componentType);
    
    for (const integration of scaffold.integrations) {
      // Only check integrations that have a component mapping
      if (integration in INTEGRATION_TO_COMPONENT) {
        const expectedComponent = INTEGRATION_TO_COMPONENT[integration as IntegrationKey];
        if (!componentTypes.includes(expectedComponent)) {
          violations.push({
            type: 'missing_integration',
            details: `Integration "${integration}" requires componentType "${expectedComponent}" but none found`,
          });
        }
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}
