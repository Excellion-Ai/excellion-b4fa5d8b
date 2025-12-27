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
};

// Layout by category - with more variety
const CATEGORY_LAYOUT: Record<NicheCategory, LayoutStructure> = {
  ecommerce: 'bento',
  reseller: 'layered',
  restaurant: 'standard', // Restaurants typically use standard layouts
  local_service: 'standard',
  saas: 'bento',
  course: 'layered',
  coaching: 'standard',
  event: 'layered',
  real_estate: 'horizontal',
  nonprofit: 'standard',
  portfolio: 'layered',
  community: 'bento',
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

// Generate content for a section based on type and context
function generateSectionContent(
  type: string, 
  businessName: string, 
  category: NicheCategory,
  archetype: ConversionArchetype
): any {
  switch (type) {
    case 'hero':
      return {
        headline: `Welcome to ${businessName}`,
        subheadline: getSubheadlineForCategory(category),
        ctas: [
          { label: archetype.ctaRules.primary, href: '#contact', variant: 'primary' },
          ...(archetype.ctaRules.secondary 
            ? [{ label: archetype.ctaRules.secondary, href: '#features', variant: 'secondary' }]
            : []),
        ],
      };
    case 'features':
      return {
        title: 'Why Choose Us',
        subtitle: 'What makes us different',
        items: getFeaturesForCategory(category),
      };
    case 'services':
      return {
        title: 'Our Services',
        subtitle: 'What we offer',
        items: getServicesForCategory(category),
      };
    case 'pricing':
      return {
        title: 'Pricing',
        subtitle: 'Choose your plan',
        items: getPricingForCategory(category),
      };
    case 'testimonials':
      return {
        title: 'What Our Customers Say',
        subtitle: 'Hear from people who love us',
        items: getTestimonialsForCategory(category),
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        items: getFAQsForCategory(category),
      };
    case 'contact':
      return {
        title: 'Get in Touch',
        subtitle: 'We\'d love to hear from you',
        email: 'hello@example.com',
        phone: '(555) 123-4567',
        formFields: ['name', 'email', 'message'],
      };
    case 'cta':
      return {
        headline: 'Ready to Get Started?',
        subheadline: 'Take the next step today',
        ctas: [
          { label: archetype.ctaRules.primary, href: '#contact', variant: 'primary' },
        ],
      };
    case 'stats':
      return {
        items: getStatsForCategory(category),
      };
    case 'gallery':
      return {
        title: 'Gallery',
        subtitle: 'See our work',
        items: [
          { image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', caption: 'Project 1' },
          { image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', caption: 'Project 2' },
          { image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', caption: 'Project 3' },
        ],
      };
    case 'portfolio':
      return {
        title: 'Our Work',
        subtitle: 'Featured projects',
        items: [
          { title: 'Project Alpha', description: 'A stunning showcase', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400' },
          { title: 'Project Beta', description: 'Creative excellence', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400' },
        ],
      };
    case 'team':
      return {
        title: 'Meet Our Team',
        subtitle: 'The people behind our success',
        items: [
          { name: 'John Smith', role: 'Founder & CEO', bio: 'Industry veteran with 15+ years experience' },
          { name: 'Jane Doe', role: 'Operations Director', bio: 'Expert in scaling businesses' },
        ],
      };
    case 'custom':
      return {
        title: 'Custom Section',
        body: 'This section can be customized for your needs.',
      };
    default:
      return {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        body: 'Section content',
      };
  }
}

function getSubheadlineForCategory(category: NicheCategory): string {
  const subheadlines: Record<NicheCategory, string> = {
    ecommerce: 'Shop our collection of premium products',
    reseller: 'Exclusive drops. Authentic pieces. Limited quantities.',
    restaurant: 'Fresh ingredients. Bold flavors. Unforgettable dining.',
    local_service: 'Your trusted local professionals. Quality guaranteed.',
    saas: 'Powerful tools to transform your workflow',
    course: 'Master new skills with expert-led training',
    coaching: 'Transform your life with personalized guidance',
    event: 'Join us for an unforgettable experience',
    real_estate: 'Find your dream home today',
    nonprofit: 'Together, we can make a difference',
    portfolio: 'Creative work that speaks for itself',
    community: 'Connect with like-minded people',
  };
  return subheadlines[category];
}

function getFeaturesForCategory(category: NicheCategory): any[] {
  const features: Record<NicheCategory, any[]> = {
    ecommerce: [
      { title: 'Free Shipping', description: 'On orders over $50', icon: 'Truck' },
      { title: 'Easy Returns', description: '30-day money back guarantee', icon: 'Shield' },
      { title: 'Secure Checkout', description: 'Your data is protected', icon: 'Lock' },
    ],
    reseller: [
      { title: 'Authenticated', description: 'Every piece verified genuine', icon: 'Shield' },
      { title: 'Weekly Drops', description: 'Fresh inventory every week', icon: 'Zap' },
      { title: 'Fast Shipping', description: 'Orders ship within 24hrs', icon: 'Truck' },
    ],
    restaurant: [
      { title: 'Fresh Ingredients', description: 'Locally sourced daily', icon: 'Leaf' },
      { title: 'Fast Service', description: 'Ready in 20 minutes or less', icon: 'Clock' },
      { title: 'Family Recipes', description: 'Authentic flavors passed down', icon: 'Heart' },
    ],
    local_service: [
      { title: 'Licensed & Insured', description: 'Fully certified professionals', icon: 'Shield' },
      { title: 'Same-Day Service', description: 'Available when you need us', icon: 'Clock' },
      { title: 'Satisfaction Guaranteed', description: '100% money-back promise', icon: 'Star' },
    ],
    saas: [
      { title: 'Easy Integration', description: 'Connect in minutes', icon: 'Zap' },
      { title: 'Real-time Analytics', description: 'Insights at your fingertips', icon: 'BarChart3' },
      { title: 'Enterprise Security', description: 'SOC2 compliant', icon: 'Shield' },
    ],
    course: [
      { title: 'Expert Instructors', description: 'Learn from the best', icon: 'GraduationCap' },
      { title: 'Lifetime Access', description: 'Learn at your own pace', icon: 'Clock' },
      { title: 'Certificates', description: 'Prove your skills', icon: 'Award' },
    ],
    coaching: [
      { title: 'Personalized Plans', description: 'Tailored to your goals', icon: 'Target' },
      { title: 'Proven Results', description: '500+ clients transformed', icon: 'Trophy' },
      { title: 'Ongoing Support', description: '24/7 access to resources', icon: 'HeartHandshake' },
    ],
    event: [
      { title: 'World-Class Speakers', description: 'Industry leaders share insights', icon: 'Mic' },
      { title: 'Networking', description: 'Connect with peers', icon: 'Users' },
      { title: 'Interactive Sessions', description: 'Hands-on workshops', icon: 'Sparkles' },
    ],
    real_estate: [
      { title: 'Expert Agents', description: 'Local market knowledge', icon: 'Users' },
      { title: 'Virtual Tours', description: 'Explore from anywhere', icon: 'Camera' },
      { title: 'Fast Closings', description: 'Streamlined process', icon: 'Zap' },
    ],
    nonprofit: [
      { title: 'Transparent Impact', description: '90% goes to programs', icon: 'Target' },
      { title: 'Community Focused', description: 'Local initiatives', icon: 'Heart' },
      { title: 'Volunteer Network', description: 'Join 1000+ helpers', icon: 'Users' },
    ],
    portfolio: [
      { title: 'Award Winning', description: 'Recognized excellence', icon: 'Award' },
      { title: 'Creative Vision', description: 'Unique perspectives', icon: 'Palette' },
      { title: 'Client Focused', description: 'Your story, our craft', icon: 'Heart' },
    ],
    community: [
      { title: 'Active Members', description: '10,000+ engaged users', icon: 'Users' },
      { title: 'Exclusive Events', description: 'Members-only access', icon: 'Star' },
      { title: 'Resource Library', description: 'Curated content', icon: 'BookOpen' },
    ],
  };
  return features[category] || features.local_service;
}

function getServicesForCategory(category: NicheCategory): any[] {
  const defaults = [
    { title: 'Service One', description: 'Premium quality service', icon: 'Star' },
    { title: 'Service Two', description: 'Expert solutions', icon: 'Zap' },
    { title: 'Service Three', description: 'Tailored approach', icon: 'Target' },
  ];
  return defaults;
}

function getPricingForCategory(category: NicheCategory): any[] {
  return [
    { name: 'Starter', price: '$29', features: ['Basic features', 'Email support'], ctaText: 'Get Started' },
    { name: 'Professional', price: '$79', features: ['All Starter features', 'Priority support', 'Advanced tools'], highlighted: true, ctaText: 'Most Popular' },
    { name: 'Enterprise', price: '$199', features: ['All Pro features', 'Dedicated manager', 'Custom solutions'], ctaText: 'Contact Sales' },
  ];
}

function getTestimonialsForCategory(category: NicheCategory): any[] {
  return [
    { name: 'Alex Johnson', role: 'Happy Customer', quote: 'Absolutely fantastic experience. Highly recommend!', rating: 5 },
    { name: 'Maria Garcia', role: 'Loyal Client', quote: 'Best in the business. Will definitely return.', rating: 5 },
  ];
}

function getFAQsForCategory(category: NicheCategory): any[] {
  return [
    { question: 'How do I get started?', answer: 'Simply contact us through the form or give us a call.' },
    { question: 'What are your hours?', answer: 'We\'re available Monday through Friday, 9am to 5pm.' },
    { question: 'Do you offer refunds?', answer: 'Yes, we offer a 30-day satisfaction guarantee.' },
  ];
}

function getStatsForCategory(category: NicheCategory): any[] {
  return [
    { value: '500+', label: 'Happy Customers' },
    { value: '10+', label: 'Years Experience' },
    { value: '99%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' },
  ];
}

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
