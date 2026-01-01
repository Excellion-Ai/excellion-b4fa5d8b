// ============= Niche Intelligence Types =============
// Core data models for Pattern Pack system

export type BusinessIntent = 
  | 'product_store' 
  | 'service_business' 
  | 'booking_business' 
  | 'saas' 
  | 'portfolio'
  | 'nonprofit';

export type NicheCategory = 
  | 'jewelry_store'
  | 'clothing_boutique'
  | 'home_goods'
  | 'electronics'
  | 'fitness_gym'
  | 'yoga_studio'
  | 'salon'
  | 'spa'
  | 'restaurant'
  | 'bakery'
  | 'cafe'
  | 'plumber'
  | 'electrician'
  | 'hvac'
  | 'roofing'
  | 'landscaping'
  | 'cleaning'
  | 'auto_detailing'
  | 'pressure_washing'
  | 'law_firm'
  | 'accounting'
  | 'dental'
  | 'medical'
  | 'real_estate'
  | 'photography'
  | 'design_agency'
  | 'freelancer'
  | 'consultant'
  | 'saas_tool'
  | 'nonprofit_org'
  | 'dispensary'
  | 'pet_services'
  | 'general';

// Business Brief - extracted from user prompt
export interface BusinessBrief {
  businessName: string | null;
  intent: BusinessIntent;
  industry: string;
  nicheCategory: NicheCategory;
  location: {
    city?: string;
    state?: string;
    country?: string;
    serviceArea?: string;
  } | null;
  offerings: string[];
  differentiators: string[];
  tone: string[];
  primaryGoal: 'calls' | 'bookings' | 'visits' | 'leads' | 'sales' | 'signups' | 'donations' | 'downloads';
  primaryCTA: string;
  secondaryCTA: string | null;
  needsEcommerce: boolean;
  needsBooking: boolean;
  needsPoliciesPage: boolean;
  seo: {
    primaryKeywords: string[];
    serviceAreaKeywords: string[];
  };
}

// Section Blueprint - structure template for a section
export interface SectionBlueprint {
  type: 'hero' | 'features' | 'services' | 'pricing' | 'testimonials' | 'faq' | 'contact' | 'cta' | 'stats' | 'gallery' | 'team' | 'portfolio' | 'custom';
  variant?: string; // e.g., 'split', 'centered', 'minimal'
  required: boolean;
  contentHints: {
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    itemCount?: number;
    style?: string;
  };
  imageSlots?: ImageSlotBlueprint[];
}

// Page Blueprint - structure template for a page
export interface PageBlueprint {
  slug: string;
  title: string;
  sectionOrder: SectionBlueprint[];
  heroVariant?: 'full' | 'split' | 'minimal' | 'video';
}

// Image Slot Blueprint - defines image requirements
export interface ImageSlotBlueprint {
  id: string;
  role: 'hero_background' | 'feature_icon' | 'product_image' | 'team_photo' | 'portfolio_item' | 'gallery_item' | 'logo' | 'testimonial_avatar' | 'service_image';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | 'auto';
  keywords: string[];
  styleHints: string[];
  required: boolean;
}

// CTA Patterns - text hints for primary/secondary CTAs
export interface CTAPatterns {
  primaryCtaTextHints: string[];
  secondaryCtaTextHints: string[];
}

// Pattern Pack - complete template for a business type
export interface PatternPack {
  id: string;
  label: string;
  intent: BusinessIntent;
  nicheCategory?: NicheCategory;
  industry?: string;
  pages: PageBlueprint[];
  ctaPatterns: CTAPatterns;
  trustSignals: string[];
  imageSlots: ImageSlotBlueprint[];
  warnings: string[];
  proxyScore?: number; // 0-100 based on scoring proxies
  tags?: string[];
}

// Extracted Site - data from analyzing a competitor (Stage 2)
export interface ExtractedSite {
  url: string;
  pages: Array<{
    path: string;
    title: string;
    sections: SectionBlueprint[];
  }>;
  ctas: string[];
  trustSignals: string[];
  imageSlots: ImageSlotBlueprint[];
  metrics: {
    heroClarity: number;
    ctaPlacement: number;
    trustNearCTA: boolean;
    navComplexity: number;
    imageCount: number;
    estimatedLoadTime: number;
  };
  brandKit?: {
    primaryColor?: string;
    secondaryColor?: string;
    fonts?: string[];
  };
}

// Image Fill Options
export interface ImageFillOptions {
  mode: 'static' | 'stock' | 'ai';
  fallbackToStatic?: boolean;
  preferGradients?: boolean;
  aspectRatioStrict?: boolean;
}

// Filled Image Result
export interface FilledImage {
  slotId: string;
  url: string;
  source: 'static' | 'stock' | 'ai' | 'gradient';
  alt: string;
}

// Scoring Result
export interface PatternPackScore {
  packId: string;
  totalScore: number;
  breakdown: {
    heroClarity: number;
    ctaAboveFold: number;
    trustNearCTA: number;
    lowFriction: number;
    performanceProxy: number;
    accessibilityProxy: number;
  };
  tier: 'high-performance' | 'standard' | 'needs-improvement';
}

// Pattern Pack Request
export interface GetPatternPackRequest {
  intent: BusinessIntent;
  category?: NicheCategory;
  industry?: string;
  preferHighPerformance?: boolean;
}
