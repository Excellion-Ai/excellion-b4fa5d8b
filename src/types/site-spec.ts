// ============= SiteSpec Types =============
// The source of truth for rendering any generated website in the preview frame

export type BusinessModel = 'SERVICE_BASED' | 'RETAIL_COMMERCE' | 'HOSPITALITY' | 'PORTFOLIO_IDENTITY';

// Layout structure paradigms - controls overall page composition
export type LayoutStructure = 
  | 'standard'      // Traditional vertical stack (backwards compatible)
  | 'bento'         // CSS Grid asymmetric tiles (SaaS/Tech)
  | 'split-screen'  // 50/50 or 40/60 vertical splits (Portfolio/Luxury)
  | 'layered'       // Z-index overlapping elements (Creative/Agency)
  | 'horizontal';   // Horizontal scroll sections (Showcases)

// Grid configuration for bento/tile-based layouts
export type GridConfig = {
  colSpan?: number;   // How many columns this tile spans (1-12)
  rowSpan?: number;   // How many rows this tile spans
  order?: number;     // Display order in grid
};

export type SectionType = 
  | 'hero' 
  | 'features'
  | 'pricing' 
  | 'testimonials' 
  | 'faq' 
  | 'contact' 
  | 'cta' 
  | 'stats' 
  | 'team' 
  | 'gallery'
  | 'services'
  | 'portfolio'
  | 'custom';

// Theme configuration
export type SiteTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor: string;
  textColor: string;
  darkMode: boolean;
  fontHeading: string;
  fontBody: string;
};

// Navigation item
export type NavItem = {
  label: string;
  href: string;
};

// CTA Button
export type CTAButton = {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
};

// Section content types
export type HeroContent = {
  headline: string;
  subheadline: string;
  ctas: CTAButton[];
  backgroundImage?: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon?: string;
};

export type FeaturesContent = {
  title: string;
  subtitle?: string;
  items: FeatureItem[];
};

export type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
  rating?: number;
};

export type TestimonialsContent = {
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
};

export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
};

export type PricingContent = {
  title: string;
  subtitle?: string;
  items: PricingTier[];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQContent = {
  title: string;
  subtitle?: string;
  items: FAQItem[];
};

export type ContactContent = {
  title: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  formFields?: string[];
};

export type CTAContent = {
  headline: string;
  subheadline?: string;
  ctas: CTAButton[];
};

export type StatsItem = {
  value: string;
  label: string;
};

export type StatsContent = {
  title?: string;
  items: StatsItem[];
};

export type CustomContent = {
  title: string;
  body?: string;
};

// Union of all content types
export type SectionContent = 
  | HeroContent 
  | FeaturesContent 
  | TestimonialsContent 
  | PricingContent 
  | FAQContent 
  | ContactContent
  | CTAContent
  | StatsContent
  | CustomContent;

// Animation configuration for sections
export type AnimationType = 
  | 'none'
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'scale-up'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'bounce'
  | 'pulse'
  | 'float'
  | 'blur-in';

export type AnimationConfig = {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  trigger: 'load' | 'scroll' | 'hover';
};

// A single section in the site
export type SiteSection = {
  id: string;
  type: SectionType;
  label: string;
  content: SectionContent;
  animation?: AnimationConfig;
  gridConfig?: GridConfig;  // For bento/tile layouts
};

// Page definition
export type SitePage = {
  path: string;
  title: string;
  sections: SiteSection[];
};

// The complete SiteSpec - source of truth for preview rendering
export type SiteSpec = {
  name: string;
  description?: string;
  businessModel: BusinessModel;
  layoutStructure?: LayoutStructure;  // Layout paradigm for the site
  theme: SiteTheme;
  navigation: NavItem[];
  pages: SitePage[];
  footer?: {
    copyright: string;
    links?: NavItem[];
  };
};

// Default empty spec for initial state
export const EMPTY_SITE_SPEC: SiteSpec = {
  name: 'New Site',
  businessModel: 'SERVICE_BASED',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    darkMode: false,
    fontHeading: 'Inter, sans-serif',
    fontBody: 'Inter, sans-serif',
  },
  navigation: [],
  pages: [],
};
