// === App Spec Types (Planner Output) ===
export type BusinessModel = 'SERVICE_BASED' | 'RETAIL_COMMERCE' | 'HOSPITALITY' | 'PORTFOLIO_IDENTITY';

export type AppSpec = {
  businessModel?: BusinessModel;
  summary: string[];
  appType: string;
  targetStack: string;
  pages: { name: string; description: string }[];
  coreFeatures: string[];
  dataModel: { entity: string; fields: string[] }[];
  integrations: string[];
  buildPrompt: string;
  criticalQuestions: string[];
  buildPlan: string[];
  siteDefinition?: SiteDefinition;
};

export type BuilderTarget = 'lovable' | 'v0' | 'bolt' | 'dyad' | 'nextjs';
export type Complexity = 'simple' | 'standard' | 'advanced';

export type BuilderConfig = {
  target: BuilderTarget;
  complexity: Complexity;
};

export type AgentStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
};

// === Site Definition Types (Code Generator Output) ===
export type SectionType = 
  | 'hero' 
  | 'feature-grid'
  | 'features' 
  | 'pricing' 
  | 'testimonials' 
  | 'faq' 
  | 'contact' 
  | 'cta' 
  | 'stats' 
  | 'team' 
  | 'gallery'
  | 'menu'
  | 'services'
  | 'portfolio'
  | 'custom';

// Content types for each section
export type HeroContent = {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
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
  avatar?: string;
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
  ctaText: string;
  ctaLink?: string;
};

export type SectionContent = 
  | HeroContent 
  | FeaturesContent 
  | TestimonialsContent 
  | PricingContent 
  | FAQContent 
  | ContactContent
  | CTAContent
  | Record<string, unknown>;

export type SiteSection = {
  id: string;
  type: SectionType;
  label: string;
  description?: string;
  content?: SectionContent;
  props?: Record<string, unknown>;
};

export type SiteTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundStyle?: 'dark' | 'light';
  fontHeading?: string;
  fontBody?: string;
  darkMode?: boolean;
};

export type NavigationItem = {
  label: string;
  href: string;
};

export type SiteDefinition = {
  name: string;
  description?: string;
  sections: SiteSection[];
  theme: SiteTheme;
  navigation: NavigationItem[];
};

export type GeneratedCode = {
  siteDefinition: SiteDefinition;
  reactCode: string;
  cssCode?: string;
  error?: string;
};

export type CodeGenerationStatus = 'idle' | 'generating' | 'success' | 'error' | 'healing';

// === Presets & Constants ===
export const PRESETS = [
  { id: 'local-service', label: 'Local service website', icon: 'Building2' },
  { id: 'course', label: 'Course + checkout', icon: 'GraduationCap' },
  { id: 'saas', label: 'SaaS dashboard', icon: 'LayoutDashboard' },
  { id: 'portal', label: 'Client portal', icon: 'Users' },
  { id: 'booking', label: 'Booking + calendar', icon: 'Calendar' },
  { id: 'ecommerce', label: 'E-commerce', icon: 'ShoppingCart' },
] as const;

export const TARGETS: { value: BuilderTarget; label: string }[] = [
  { value: 'lovable', label: 'Lovable' },
  { value: 'v0', label: 'v0.dev' },
  { value: 'bolt', label: 'Bolt.new' },
  { value: 'dyad', label: 'Dyad' },
  { value: 'nextjs', label: 'Generic Next.js' },
];

export const COMPLEXITIES: { value: Complexity; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'advanced', label: 'Advanced' },
];

// === Icon mapping for dynamic rendering ===
export const ICON_MAP: Record<string, string> = {
  Wrench: 'Wrench',
  Clock: 'Clock',
  Shield: 'Shield',
  Star: 'Star',
  Zap: 'Zap',
  Heart: 'Heart',
  Phone: 'Phone',
  Mail: 'Mail',
  MapPin: 'MapPin',
  Calendar: 'Calendar',
  Users: 'Users',
  Check: 'Check',
  Award: 'Award',
  Target: 'Target',
  Truck: 'Truck',
  CreditCard: 'CreditCard',
  ShoppingCart: 'ShoppingCart',
  Coffee: 'Coffee',
  Utensils: 'Utensils',
  Home: 'Home',
  Building: 'Building',
  Briefcase: 'Briefcase',
  Camera: 'Camera',
  Palette: 'Palette',
  Code: 'Code',
  Globe: 'Globe',
  Headphones: 'Headphones',
  MessageCircle: 'MessageCircle',
  Settings: 'Settings',
  Sparkles: 'Sparkles',
};