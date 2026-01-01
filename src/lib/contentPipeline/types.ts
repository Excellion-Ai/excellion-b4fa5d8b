// ============= Content Pipeline Types =============
// Types for the end-to-end content generation pipeline

export type PrimaryGoal = 
  | 'calls'
  | 'bookings'
  | 'visits'
  | 'leads'
  | 'sales'
  | 'signups'
  | 'donations'
  | 'downloads';

export type BusinessBrief = {
  businessName: string | null;
  industry: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
  } | null;
  offerings: string[];
  targetCustomers: string | null;
  differentiators: string[];
  tone: string[];
  primaryGoal: PrimaryGoal;
  primaryCTA: string;
  secondaryCTA: string | null;
  needsEcommerce: boolean;
  needsBooking: boolean;
  complianceNotes: string[];
  seo: {
    primaryKeywords: string[];
    serviceAreaKeywords: string[];
  };
};

export type PageRequirement = {
  path: string;
  title: string;
  sections: string[];
  heroContent: {
    headline: string;
    subheadline: string;
    cta?: string;
  };
};

export type SitePlan = {
  businessBrief: BusinessBrief;
  pages: PageRequirement[];
  navigation: Array<{ label: string; href: string }>;
  hasCart: boolean;
  footerLinks: Array<{ label: string; href: string }>;
};

export type ContentValidationIssue = {
  type: 'banned_phrase' | 'placeholder' | 'generic_content' | 'wrong_cta' | 'missing_specifics';
  location: string;
  details: string;
  severity: 'error' | 'warning';
};

export type ContentValidationResult = {
  valid: boolean;
  issues: ContentValidationIssue[];
  score: number;
};

// Industry detection patterns
export const INDUSTRY_PATTERNS: Record<string, { patterns: RegExp[]; baseOfferings: string[] }> = {
  'pressure_washing': {
    patterns: [/pressure\s*wash/i, /power\s*wash/i, /exterior\s*clean/i],
    baseOfferings: ['Driveway Cleaning', 'House Washing', 'Deck Restoration', 'Fence Cleaning'],
  },
  'plumbing': {
    patterns: [/plumb/i, /pipe/i, /drain/i, /water\s*heater/i],
    baseOfferings: ['Drain Cleaning', 'Pipe Repair', 'Water Heater Installation', 'Emergency Service'],
  },
  'auto_detailing': {
    patterns: [/detail/i, /car\s*wash/i, /auto\s*(care|clean)/i, /ceramic\s*coat/i],
    baseOfferings: ['Interior Detailing', 'Exterior Polish', 'Ceramic Coating', 'Paint Correction'],
  },
  'restaurant': {
    patterns: [/restaurant/i, /pizz/i, /cafe/i, /diner/i, /bistro/i, /grill/i, /eatery/i],
    baseOfferings: ['Dine-In', 'Takeout', 'Catering', 'Private Events'],
  },
  'bakery': {
    patterns: [/bak(e|ery)/i, /pastry/i, /bread/i, /cake/i, /donut/i],
    baseOfferings: ['Fresh Bread', 'Custom Cakes', 'Pastries', 'Catering'],
  },
  'law_firm': {
    patterns: [/law\s*(firm|office)/i, /attorney/i, /lawyer/i, /legal/i],
    baseOfferings: ['Free Consultation', 'Case Review', 'Legal Representation', 'Contract Review'],
  },
  'dental': {
    patterns: [/dent(al|ist)/i, /orthodont/i, /oral/i],
    baseOfferings: ['General Dentistry', 'Cosmetic Dentistry', 'Emergency Care', 'Teeth Whitening'],
  },
  'salon': {
    patterns: [/salon/i, /hair/i, /barber/i, /beauty/i, /spa/i, /nail/i],
    baseOfferings: ['Haircuts', 'Coloring', 'Styling', 'Treatments'],
  },
  'yoga_fitness': {
    patterns: [/yoga/i, /pilates/i, /fitness/i, /gym/i, /workout/i, /crossfit/i],
    baseOfferings: ['Group Classes', 'Personal Training', 'Yoga Sessions', 'Fitness Programs'],
  },
  'retail_general': {
    patterns: [/shop/i, /store/i, /boutique/i, /retail/i],
    baseOfferings: ['In-Store Shopping', 'Online Orders', 'Gift Cards', 'Special Orders'],
  },
  'lighter_shop': {
    patterns: [/lighter/i, /zippo/i, /cigar/i, /tobacco/i, /smoke\s*shop/i],
    baseOfferings: ['Premium Lighters', 'Rare Collectibles', 'Accessories', 'Repairs'],
  },
  'dispensary': {
    patterns: [/dispensary/i, /cannabis/i, /weed/i, /marijuana/i],
    baseOfferings: ['Flower', 'Edibles', 'Concentrates', 'Accessories'],
  },
  'saas': {
    patterns: [/saas/i, /software/i, /app/i, /platform/i, /tech\s*startup/i, /ai\s+/i],
    baseOfferings: ['Free Trial', 'Pro Plan', 'Enterprise', 'API Access'],
  },
  'photography': {
    patterns: [/photograph/i, /photo\s*studio/i, /portrait/i, /wedding\s*photo/i],
    baseOfferings: ['Portrait Sessions', 'Event Coverage', 'Product Photography', 'Photo Editing'],
  },
  'landscaping': {
    patterns: [/landscap/i, /lawn\s*care/i, /garden/i, /tree\s*service/i],
    baseOfferings: ['Lawn Maintenance', 'Landscape Design', 'Tree Trimming', 'Seasonal Cleanup'],
  },
  'hvac': {
    patterns: [/hvac/i, /air\s*condition/i, /heating/i, /cooling/i, /furnace/i],
    baseOfferings: ['AC Repair', 'Heating Service', 'Installation', '24/7 Emergency'],
  },
  'roofing': {
    patterns: [/roof/i, /shingle/i, /gutter/i],
    baseOfferings: ['Roof Repair', 'New Installation', 'Inspections', 'Gutter Service'],
  },
  'real_estate': {
    patterns: [/real\s*estate/i, /realtor/i, /property/i, /home\s*(sale|buy)/i],
    baseOfferings: ['Home Buying', 'Selling', 'Property Valuation', 'Investment'],
  },
  'insurance': {
    patterns: [/insurance/i, /coverage/i, /policy/i],
    baseOfferings: ['Free Quote', 'Policy Review', 'Claims Assistance', 'Coverage Options'],
  },
  'pet_services': {
    patterns: [/pet/i, /dog/i, /cat/i, /groom/i, /vet/i, /animal/i],
    baseOfferings: ['Grooming', 'Boarding', 'Training', 'Veterinary Care'],
  },
  'cleaning': {
    patterns: [/clean(ing|er)/i, /maid/i, /janitorial/i, /housekeep/i],
    baseOfferings: ['Residential Cleaning', 'Commercial Cleaning', 'Deep Clean', 'Move-In/Out'],
  },
  'moving': {
    patterns: [/mov(ing|er)/i, /relocation/i, /pack(ing)?/i],
    baseOfferings: ['Local Moving', 'Long Distance', 'Packing Services', 'Storage'],
  },
  'tutoring': {
    patterns: [/tutor/i, /education/i, /learning/i, /test\s*prep/i, /lesson/i],
    baseOfferings: ['One-on-One Sessions', 'Group Classes', 'Test Prep', 'Homework Help'],
  },
  'nonprofit': {
    patterns: [/nonprofit/i, /non-profit/i, /charity/i, /foundation/i, /ministry/i, /church/i],
    baseOfferings: ['Donate', 'Volunteer', 'Programs', 'Events'],
  },
};

// Goal detection patterns
export const GOAL_PATTERNS: Record<PrimaryGoal, RegExp[]> = {
  calls: [/call\s*(us|now|today)/i, /phone/i, /emergency/i, /24.?7/i],
  bookings: [/book/i, /appoint/i, /reserv/i, /schedule/i, /session/i],
  visits: [/visit/i, /come\s*(by|in)/i, /stop\s*by/i, /walk-?in/i, /store/i, /location/i],
  leads: [/quote/i, /estimate/i, /consult/i, /inquiry/i, /contact\s*form/i],
  sales: [/buy/i, /purchase/i, /order/i, /shop/i, /cart/i, /checkout/i, /e-?commerce/i],
  signups: [/sign\s*up/i, /register/i, /trial/i, /subscribe/i, /membership/i],
  donations: [/donat/i, /give/i, /support/i, /contribut/i],
  downloads: [/download/i, /get\s*(the\s*)?app/i, /install/i],
};

// CTA mappings by goal
export const GOAL_TO_CTA: Record<PrimaryGoal, string[]> = {
  calls: ['Call Now', 'Call Us Today', 'Speak With Us'],
  bookings: ['Book Now', 'Schedule Appointment', 'Reserve Your Spot'],
  visits: ['Visit Us', 'Get Directions', 'Find Our Location'],
  leads: ['Get Free Quote', 'Request Estimate', 'Free Consultation'],
  sales: ['Shop Now', 'Browse Collection', 'View Products'],
  signups: ['Start Free Trial', 'Sign Up Free', 'Get Started'],
  donations: ['Donate Now', 'Give Today', 'Support Our Mission'],
  downloads: ['Download Free', 'Get the App', 'Download Now'],
};
