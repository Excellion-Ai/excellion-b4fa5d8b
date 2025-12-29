import type { SiteSpec, SiteSection } from '@/types/site-spec';
import type { ScaffoldViolation, GenerationScaffold, ScaffoldValidationResult } from '@/types/scaffold';
import { validateSpecAgainstScaffold } from '@/types/scaffold';

export type VerbosityMode = 'concise' | 'normal' | 'detailed';

export type ActionChip = {
  label: string;
  action: 'theme' | 'add_section' | 'edit_headline' | 'reorder' | 'open_issues' | 'add_proof' | 'fix_booking';
  sectionType?: string;
};

export type FormattedResponse = {
  built: string;
  nextStep: string;
  actions: ActionChip[];
  blockerCount: number;
  fullMessage: string;
};

export type BuilderIssue = {
  id: string;
  type: 'missing_section' | 'missing_page' | 'missing_integration' | 'forbidden_phrase' | 'empty_cta' | 'broken_link';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  fixAction?: {
    label: string;
    type: 'add_section' | 'add_page' | 'add_integration' | 'edit_content';
    payload?: Record<string, unknown>;
  };
};

function countSections(spec: SiteSpec): number {
  return spec.pages?.reduce((acc, page) => acc + (page.sections?.length || 0), 0) || 0;
}

function getPageCount(spec: SiteSpec): number {
  return spec.pages?.length || 0;
}

function getPrimaryGoal(spec: SiteSpec): string {
  const heroSection = spec.pages?.[0]?.sections?.find(s => s.type === 'hero');
  const heroContent = heroSection?.content as { ctas?: Array<{ label?: string }> } | undefined;
  const primaryCta = heroContent?.ctas?.[0]?.label;
  
  if (primaryCta) {
    if (primaryCta.toLowerCase().includes('book') || primaryCta.toLowerCase().includes('schedule')) {
      return 'booking conversions';
    }
    if (primaryCta.toLowerCase().includes('quote') || primaryCta.toLowerCase().includes('estimate')) {
      return 'lead generation';
    }
    if (primaryCta.toLowerCase().includes('shop') || primaryCta.toLowerCase().includes('buy')) {
      return 'product sales';
    }
    if (primaryCta.toLowerCase().includes('order')) {
      return 'online orders';
    }
  }
  return 'engagement';
}

function suggestNextStep(spec: SiteSpec, violations: ScaffoldViolation[]): string {
  if (violations.length > 0) {
    const missingSection = violations.find(v => v.type === 'missing_section');
    if (missingSection) {
      return `Add missing ${missingSection.details.split(':')[1]?.trim() || 'section'} to complete your site structure.`;
    }
    return 'Fix blocking issues to unlock full conversion potential.';
  }
  
  const hasTestimonials = spec.pages?.some(p => p.sections?.some(s => s.type === 'testimonials'));
  if (!hasTestimonials) {
    return 'Add testimonials to build trust and increase conversions.';
  }
  
  const hasStats = spec.pages?.some(p => p.sections?.some(s => s.type === 'stats'));
  if (!hasStats) {
    return 'Add stats section to showcase credibility.';
  }
  
  return 'Customize your theme colors to match your brand.';
}

function getActionChips(spec: SiteSpec, violations: ScaffoldViolation[]): ActionChip[] {
  const chips: ActionChip[] = [];
  
  if (violations.length > 0) {
    chips.push({ label: 'Fix Issues', action: 'open_issues' });
  }
  
  const hasTestimonials = spec.pages?.some(p => p.sections?.some(s => s.type === 'testimonials'));
  if (!hasTestimonials) {
    chips.push({ label: 'Add Proof Section', action: 'add_proof', sectionType: 'testimonials' });
  }
  
  chips.push({ label: 'Change Theme', action: 'theme' });
  
  if (chips.length < 3) {
    chips.push({ label: 'Improve Headline', action: 'edit_headline' });
  }
  
  if (chips.length < 3) {
    chips.push({ label: 'Reorder Sections', action: 'reorder' });
  }
  
  return chips.slice(0, 3);
}

export function convertViolationsToIssues(violations: ScaffoldViolation[]): BuilderIssue[] {
  return violations.map((v, index) => {
    const baseIssue = {
      id: `issue-${index}`,
      description: v.details,
    };
    
    switch (v.type) {
      case 'missing_section':
        const sectionMatch = v.details.match(/missing required section: (\w+)/i);
        const sectionType = sectionMatch?.[1] || 'section';
        return {
          ...baseIssue,
          type: 'missing_section' as const,
          severity: 'error' as const,
          title: `Missing ${sectionType} Section`,
          fixAction: {
            label: `Add ${sectionType}`,
            type: 'add_section' as const,
            payload: { sectionType },
          },
        };
        
      case 'missing_page':
        const pageMatch = v.details.match(/Missing required page: ([/\w-]+)/i);
        const pagePath = pageMatch?.[1] || '/page';
        return {
          ...baseIssue,
          type: 'missing_page' as const,
          severity: 'error' as const,
          title: `Missing ${pagePath} Page`,
          fixAction: {
            label: `Add ${pagePath} Page`,
            type: 'add_page' as const,
            payload: { path: pagePath },
          },
        };
        
      case 'missing_integration':
        const intMatch = v.details.match(/Integration "(\w+)"/i);
        const integration = intMatch?.[1] || 'integration';
        return {
          ...baseIssue,
          type: 'missing_integration' as const,
          severity: 'warning' as const,
          title: `${integration} Integration Missing`,
          fixAction: {
            label: `Add ${integration}`,
            type: 'add_integration' as const,
            payload: { integration },
          },
        };
        
      case 'forbidden_phrase':
        return {
          ...baseIssue,
          type: 'forbidden_phrase' as const,
          severity: 'warning' as const,
          title: 'Generic Text Detected',
          fixAction: {
            label: 'Edit Content',
            type: 'edit_content' as const,
          },
        };
        
      default:
        return {
          ...baseIssue,
          type: 'missing_section' as const,
          severity: 'info' as const,
          title: 'Issue Detected',
        };
    }
  });
}

export function formatBuiltSummary(spec: SiteSpec, verbosity: VerbosityMode): string {
  const pageCount = getPageCount(spec);
  const sectionCount = countSections(spec);
  const goal = getPrimaryGoal(spec);
  
  if (verbosity === 'concise') {
    return `${pageCount}-page site with ${sectionCount} sections, optimized for ${goal}.`;
  }
  
  const pageNames = spec.pages?.map(p => p.title || p.path).join(', ') || '';
  return `Created ${pageCount} pages (${pageNames}) with ${sectionCount} total sections. Primary conversion goal: ${goal}.`;
}

export function formatChatResponse(
  spec: SiteSpec | null,
  scaffold: GenerationScaffold | null,
  rawAiMessage: string,
  verbosity: VerbosityMode = 'concise'
): FormattedResponse {
  if (!spec) {
    return {
      built: '',
      nextStep: '',
      actions: [],
      blockerCount: 0,
      fullMessage: rawAiMessage,
    };
  }
  
  const validationResult = validateSpecAgainstScaffold(spec, scaffold);
  const violations = validationResult.violations || [];
  
  const built = formatBuiltSummary(spec, verbosity);
  const nextStep = suggestNextStep(spec, violations);
  const actions = getActionChips(spec, violations);
  
  let fullMessage = `**Built:** ${built}\n\n**Next:** ${nextStep}`;
  
  if (violations.length > 0) {
    fullMessage += `\n\n⚠️ Blocking issues detected: ${violations.length}`;
  }
  
  if (verbosity === 'concise') {
    const words = fullMessage.split(/\s+/);
    if (words.length > 120) {
      fullMessage = words.slice(0, 120).join(' ') + '...';
    }
  }
  
  return {
    built,
    nextStep,
    actions,
    blockerCount: violations.length,
    fullMessage,
  };
}

export function parseStructuredMessage(content: string): {
  isStructured: boolean;
  built?: string;
  nextStep?: string;
  hasBlockers?: boolean;
  blockerCount?: number;
} {
  const builtMatch = content.match(/\*\*Built:\*\*\s*(.+?)(?=\n\n|\*\*Next)/s);
  const nextMatch = content.match(/\*\*Next(?:\s*best\s*step)?:\*\*\s*(.+?)(?=\n\n|⚠️|$)/s);
  const blockerMatch = content.match(/⚠️\s*Blocking issues detected:\s*(\d+)/);
  
  if (builtMatch || nextMatch) {
    return {
      isStructured: true,
      built: builtMatch?.[1]?.trim(),
      nextStep: nextMatch?.[1]?.trim(),
      hasBlockers: !!blockerMatch,
      blockerCount: blockerMatch ? parseInt(blockerMatch[1], 10) : 0,
    };
  }
  
  return { isStructured: false };
}
