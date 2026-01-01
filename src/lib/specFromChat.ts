import { SiteSpec, SiteSection, BusinessModel, SiteTheme, LayoutStructure, SitePage } from '@/types/site-spec';
import { routeNiche, type NicheRoute, type NicheCategory } from './nicheRouter';
import { selectArchetype, type ConversionArchetype, type PageDefinition } from './conversionArchetypes';
import { getPacksForIntegrations, type IntegrationPack } from './integrationPacks';

// Color palettes by niche category
const CATEGORY_PALETTES: Record<NicheCategory, Partial<SiteTheme>> = {
  ecommerce: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    accentColor: '#ec4899',
    darkMode: false,
  },
  reseller: {
    primaryColor: '#1f2937',
    secondaryColor: '#111827',
    accentColor: '#10b981',
    darkMode: true,
  },
  restaurant: {
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    accentColor: '#facc15',
    darkMode: true,
  },
  local_service: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    accentColor: '#f59e0b',
    darkMode: false,
  },
  saas: {
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#22d3ee',
    darkMode: true,
  },
  course: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    accentColor: '#fbbf24',
    darkMode: false,
  },
  coaching: {
    primaryColor: '#14b8a6',
    secondaryColor: '#0d9488',
    accentColor: '#f59e0b',
    darkMode: false,
  },
  event: {
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
    accentColor: '#a855f7',
    darkMode: true,
  },
  real_estate: {
    primaryColor: '#059669',
    secondaryColor: '#047857',
    accentColor: '#d4af37',
    darkMode: false,
  },
  nonprofit: {
    primaryColor: '#0891b2',
    secondaryColor: '#0e7490',
    accentColor: '#f97316',
    darkMode: false,
  },
  portfolio: {
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#d4af37',
    darkMode: true,
  },
  community: {
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    accentColor: '#34d399',
    darkMode: false,
  },
  fitness: {
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    accentColor: '#f59e0b',
    darkMode: true,
  },
};

// Map niche category to business model
const CATEGORY_TO_BUSINESS: Record<NicheCategory, BusinessModel> = {
  ecommerce: 'RETAIL_COMMERCE',
  reseller: 'RETAIL_COMMERCE',
  restaurant: 'HOSPITALITY',
  local_service: 'SERVICE_BASED',
  saas: 'SERVICE_BASED',
  course: 'SERVICE_BASED',
  coaching: 'SERVICE_BASED',
  event: 'HOSPITALITY',
  real_estate: 'SERVICE_BASED',
  nonprofit: 'SERVICE_BASED',
  portfolio: 'PORTFOLIO_IDENTITY',
  community: 'SERVICE_BASED',
  fitness: 'SERVICE_BASED',
};

// Layout by category - with more variety
const CATEGORY_LAYOUT: Record<NicheCategory, LayoutStructure> = {
  ecommerce: 'bento',
  reseller: 'layered',
  restaurant: 'standard',
  local_service: 'standard',
  saas: 'bento',
  course: 'layered',
  coaching: 'standard',
  event: 'layered',
  real_estate: 'horizontal',
  nonprofit: 'standard',
  portfolio: 'layered',
  community: 'bento',
  fitness: 'standard',
};

// Vibes to layout mapping for variety
const VIBE_LAYOUTS: Record<string, LayoutStructure> = {
  modern: 'bento',
  bold: 'layered',
  warm: 'standard',
  luxury: 'horizontal',
  playful: 'bento',
  sleek: 'layered',
};

// Extract a potential business name from input
function extractBusinessName(input: string): string {
  const patterns = [
    /(?:called|named|for)\s+["']?([A-Za-z0-9\s]+)["']?/i,
    /^([A-Za-z0-9\s]+?)(?:\s+website|\s+site|\s+app)/i,
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim().slice(0, 30);
    }
  }
  
  return 'My Business';
}

// Generate EMPTY content structures for sections - forces AI to fill or triggers SetupRequiredCard
// NO HARDCODED MARKETING COPY - all content must come from AI generation
function generateSectionContent(
  type: string, 
  businessName: string, 
  category: NicheCategory,
  archetype: ConversionArchetype
): any {
  // Return empty structures that trigger SetupRequiredCard in preview sections
  switch (type) {
    case 'hero':
      return {
        headline: '', // Empty - AI must populate or SetupRequiredCard shows
        subheadline: '',
        ctas: [
          { label: archetype.ctaRules.primary || '', href: '#contact', variant: 'primary' },
        ],
      };
    case 'features':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'services':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'pricing':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'testimonials':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'faq':
      return {
        title: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'contact':
      return {
        title: '',
        subtitle: '',
        email: '',
        phone: '',
        formFields: ['name', 'email', 'message'],
      };
    case 'cta':
      return {
        headline: '',
        subheadline: '',
        ctas: [
          { label: archetype.ctaRules.primary || '', href: '#contact', variant: 'primary' },
        ],
      };
    case 'stats':
      return {
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'gallery':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'portfolio':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'team':
      return {
        title: '',
        subtitle: '',
        items: [], // Empty - triggers SetupRequiredCard
      };
    case 'custom':
      return {
        title: '',
        body: '', // Empty - triggers SetupRequiredCard
      };
    default:
      return {
        title: '',
        body: '', // Empty - triggers SetupRequiredCard
      };
  }
}

// REMOVED: All hardcoded category-specific content generators
// Content MUST come from AI generation or show SetupRequiredCard
// These functions previously injected generic copy that leaked into generated sites

// Build pages from archetype definition
function buildPagesFromArchetype(
  archetype: ConversionArchetype,
  businessName: string,
  category: NicheCategory,
  integrationPacks: IntegrationPack[]
): SitePage[] {
  const pages: SitePage[] = [];
  
  // Build pages from archetype
  for (const pageDef of archetype.requiredPages) {
    const sections: SiteSection[] = [];
    
    for (const sectionType of pageDef.requiredSections) {
      sections.push({
        id: `${pageDef.path.replace(/\//g, '-')}-${sectionType}`,
        type: sectionType as any,
        label: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
        content: generateSectionContent(sectionType, businessName, category, archetype),
      });
    }
    
    pages.push({
      path: pageDef.path,
      title: pageDef.title,
      sections,
    });
  }
  
  // Add integration pack pages
  for (const pack of integrationPacks) {
    if (pack.pages) {
      for (const packPage of pack.pages) {
        const existingPage = pages.find(p => p.path === packPage.path);
        if (!existingPage && packPage.path) {
          pages.push({
            path: packPage.path,
            title: packPage.title || 'Page',
            sections: (packPage.sections || []) as SiteSection[],
          });
        }
      }
    }
  }
  
  return pages;
}

// Build navigation from pages
function buildNavigation(pages: SitePage[]): { label: string; href: string }[] {
  return pages
    .filter(p => p.path !== '/checkout' && p.path !== '/cart') // Hide utility pages
    .map(page => ({
      label: page.title,
      href: page.path,
    }));
}

/**
 * Convert a chat message/idea into a SiteSpec
 * Uses archetype-driven multi-page generation
 */
export function specFromChat(input: string): SiteSpec {
  // Route the input to detect category, goal, integrations
  const route = routeNiche(input);
  
  console.log('[specFromChat] Route detected:', route);
  
  // Select archetype deterministically
  const archetype = selectArchetype(route.category, route.goal);
  
  console.log('[specFromChat] Archetype selected:', archetype.id);
  
  // Get integration packs
  const integrationPacks = getPacksForIntegrations(route.integrationsNeeded);
  
  // Extract business name
  const businessName = extractBusinessName(input);
  
  // Get theme based on category
  const themePalette = CATEGORY_PALETTES[route.category] || CATEGORY_PALETTES.local_service;
  const layoutStructure = CATEGORY_LAYOUT[route.category] || 'standard';
  const businessModel = CATEGORY_TO_BUSINESS[route.category] || 'SERVICE_BASED';
  
  const theme: SiteTheme = {
    primaryColor: themePalette.primaryColor || '#3b82f6',
    secondaryColor: themePalette.secondaryColor || '#8b5cf6',
    accentColor: themePalette.accentColor || '#f59e0b',
    backgroundColor: themePalette.darkMode ? '#0a0a0a' : '#ffffff',
    textColor: themePalette.darkMode ? '#f3f4f6' : '#1f2937',
    darkMode: themePalette.darkMode || false,
    fontHeading: 'Inter, sans-serif',
    fontBody: 'Inter, sans-serif',
  };
  
  // Build pages from archetype
  const pages = buildPagesFromArchetype(archetype, businessName, route.category, integrationPacks);
  
  console.log('[specFromChat] Generated pages:', pages.length, pages.map(p => p.path));
  
  // Build navigation
  const navigation = buildNavigation(pages);

  return {
    name: businessName,
    description: `Website for ${businessName}`,
    businessModel,
    layoutStructure,
    theme,
    navigation,
    pages,
    footer: {
      copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
    },
  };
}
