import { SiteSpec, SiteSection, BusinessModel, SiteTheme, LayoutStructure } from '@/types/site-spec';

// Keyword mappings for business model detection
const BUSINESS_KEYWORDS: Record<BusinessModel, string[]> = {
  SERVICE_BASED: ['plumber', 'lawyer', 'consultant', 'cleaning', 'repair', 'agency', 'service', 'coaching', 'dental', 'doctor', 'therapy'],
  RETAIL_COMMERCE: ['shop', 'store', 'clothing', 'product', 'ecommerce', 'sell', 'merchandise', 'apparel', 'jewelry', 'electronics'],
  HOSPITALITY: ['restaurant', 'cafe', 'bar', 'hotel', 'food', 'pizza', 'booking', 'reservation', 'menu', 'dining'],
  PORTFOLIO_IDENTITY: ['portfolio', 'designer', 'artist', 'photographer', 'personal', 'freelance', 'creative', 'brand'],
};

// Technology keywords for special layout handling
const TECH_KEYWORDS = ['saas', 'software', 'app', 'tech', 'ai', 'startup', 'platform', 'dashboard', 'analytics', 'cloud', 'api'];

// Layout mapping based on business model (Architectural Variety Protocol)
const LAYOUT_MAP: Record<BusinessModel, LayoutStructure> = {
  SERVICE_BASED: 'standard',
  RETAIL_COMMERCE: 'standard',
  HOSPITALITY: 'standard',
  PORTFOLIO_IDENTITY: 'layered',
};

// Color palettes by business type
const THEME_PALETTES: Record<BusinessModel, Partial<SiteTheme>> = {
  SERVICE_BASED: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    accentColor: '#f59e0b',
    darkMode: false,
  },
  RETAIL_COMMERCE: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    accentColor: '#ec4899',
    darkMode: false,
  },
  HOSPITALITY: {
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    accentColor: '#facc15',
    darkMode: true,
  },
  PORTFOLIO_IDENTITY: {
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#d4af37',
    darkMode: true,
  },
};

// Detect business model from user input
function detectBusinessModel(input: string): BusinessModel {
  const lowerInput = input.toLowerCase();
  
  for (const [model, keywords] of Object.entries(BUSINESS_KEYWORDS)) {
    if (keywords.some(kw => lowerInput.includes(kw))) {
      return model as BusinessModel;
    }
  }
  
  return 'SERVICE_BASED';
}

// Detect if input is tech-focused for bento layout
function isTechFocused(input: string): boolean {
  const lowerInput = input.toLowerCase();
  return TECH_KEYWORDS.some(kw => lowerInput.includes(kw));
}

// Get layout based on business model and context
function getLayoutStructure(input: string, businessModel: BusinessModel): LayoutStructure {
  // Tech-focused businesses get bento layout
  if (isTechFocused(input)) {
    return 'bento';
  }
  
  // Portfolio/creative businesses get layered layout
  if (businessModel === 'PORTFOLIO_IDENTITY') {
    return 'layered';
  }
  
  // Default based on business model
  return LAYOUT_MAP[businessModel];
}

// Extract a potential business name from input
function extractBusinessName(input: string): string {
  // Look for patterns like "called X", "named X", "for X"
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



// Generate default sections based on business model
function generateSections(businessModel: BusinessModel, businessName: string): SiteSection[] {
  const heroSection: SiteSection = {
    id: 'hero',
    type: 'hero',
    label: 'Hero',
    content: {
      headline: `Welcome to ${businessName}`,
      subheadline: 'Your trusted partner for exceptional service',
      ctas: [
        { label: 'Get Started', href: '#contact', variant: 'primary' },
        { label: 'Learn More', href: '#features', variant: 'secondary' },
      ],
    },
  };

  const featuresSection: SiteSection = {
    id: 'features',
    type: 'features',
    label: 'Features',
    content: {
      title: 'Why Choose Us',
      subtitle: 'What makes us different',
      items: [
        { title: 'Quality Service', description: 'We deliver excellence in everything we do', icon: 'Star' },
        { title: 'Fast Delivery', description: 'Quick turnaround without compromising quality', icon: 'Zap' },
        { title: 'Expert Team', description: 'Skilled professionals at your service', icon: 'Users' },
        { title: '24/7 Support', description: 'Always here when you need us', icon: 'Clock' },
      ],
    },
  };

  const ctaSection: SiteSection = {
    id: 'cta',
    type: 'cta',
    label: 'Call to Action',
    content: {
      headline: 'Ready to Get Started?',
      subheadline: 'Contact us today and let\'s make it happen',
      ctas: [
        { label: 'Contact Us', href: '#contact', variant: 'primary' },
      ],
    },
  };

  const contactSection: SiteSection = {
    id: 'contact',
    type: 'contact',
    label: 'Contact',
    content: {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you',
      email: 'hello@example.com',
      phone: '(555) 123-4567',
      formFields: ['name', 'email', 'message'],
    },
  };

  // Add business-specific sections
  const sections: SiteSection[] = [heroSection, featuresSection];

  if (businessModel === 'RETAIL_COMMERCE') {
    sections.push({
      id: 'pricing',
      type: 'pricing' as const,
      label: 'Pricing',
      content: {
        title: 'Our Products',
        subtitle: 'Find what you need',
        items: [
          { name: 'Basic', price: '$29', features: ['Feature 1', 'Feature 2'], ctaText: 'Buy Now' },
          { name: 'Pro', price: '$59', features: ['Everything in Basic', 'Feature 3', 'Feature 4'], highlighted: true, ctaText: 'Buy Now' },
          { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Feature 5', 'Feature 6'], ctaText: 'Contact Sales' },
        ],
      },
    });
  }

  if (businessModel === 'HOSPITALITY') {
    sections.push({
      id: 'testimonials',
      type: 'testimonials' as const,
      label: 'Reviews',
      content: {
        title: 'What Our Customers Say',
        items: [
          { name: 'John D.', role: 'Regular Customer', quote: 'Amazing experience every time!', rating: 5 },
          { name: 'Sarah M.', role: 'Food Enthusiast', quote: 'Best in town, hands down.', rating: 5 },
        ],
      },
    });
  }

  sections.push(ctaSection, contactSection);

  // Add FAQ
  sections.push({
    id: 'faq',
    type: 'faq' as const,
    label: 'FAQ',
    content: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'How do I get started?', answer: 'Simply contact us through the form above or give us a call.' },
        { question: 'What are your hours?', answer: 'We\'re available Monday through Friday, 9am to 5pm.' },
        { question: 'Do you offer refunds?', answer: 'Yes, we offer a 30-day money-back guarantee.' },
      ],
    },
  });

  return sections;
}

/**
 * Convert a chat message/idea into a SiteSpec
 * This is a simple rule-based implementation - can be enhanced with AI later
 */
export function specFromChat(input: string): SiteSpec {
  const businessModel = detectBusinessModel(input);
  const businessName = extractBusinessName(input);
  const themePalette = THEME_PALETTES[businessModel];
  const layoutStructure = getLayoutStructure(input, businessModel);

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

  const sections = generateSections(businessModel, businessName);

  const navigation: { label: string; href: string }[] = [];

  return {
    name: businessName,
    description: `Website for ${businessName}`,
    businessModel,
    layoutStructure,
    theme,
    navigation,
    pages: [
      {
        path: '/',
        title: 'Home',
        sections,
      },
    ],
    footer: {
      copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
    },
  };
}
