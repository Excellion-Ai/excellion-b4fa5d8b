// Intent-aware fallback content for Pricing and CTA sections
// Ensures complete first-draft rendering based on business intent

import { PrimaryGoal } from './contentPipeline/types';
import { PricingTier, CTAContent, FeatureItem, HeroVariant, FeaturesVariant } from '@/types/app-spec';
import { NicheCategory, ConversionGoal } from './nicheRouter';

export type BusinessIntent = 'booking_business' | 'service_business' | 'product_store' | 'saas' | 'nonprofit' | 'portfolio';

// ====================================
// NICHE-SPECIFIC CONTENT SCHEMAS
// ====================================

export type NicheContentSchema = {
  heroHeadline: string;
  heroSubheadline: string;
  heroVariant: HeroVariant;
  featuresTitle: string;
  featuresVariant: FeaturesVariant;
  features: FeatureItem[];
  primaryCta: string;
  secondaryCta: string;
};

// Dentist niche
export const DENTIST_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Gentle Care, Healthy Smiles',
  heroSubheadline: 'Family and cosmetic dentistry with evening and weekend appointments',
  heroVariant: 'simple-centered',
  featuresTitle: 'Our Services',
  featuresVariant: 'grid-3',
  features: [
    { icon: 'Smile', title: 'Teeth Whitening', description: 'Professional whitening that removes years of stains in one visit' },
    { icon: 'Shield', title: 'Preventive Care', description: 'Cleanings, X-rays, and exams to catch problems early' },
    { icon: 'Heart', title: 'Emergency Dental', description: 'Same-day appointments for urgent pain or injuries' },
    { icon: 'Sparkles', title: 'Cosmetic Dentistry', description: 'Veneers, bonding, and smile makeovers' },
    { icon: 'Users', title: 'Family Friendly', description: 'Pediatric care in a welcoming environment' },
    { icon: 'Clock', title: 'Flexible Hours', description: 'Early morning, evening, and Saturday availability' },
  ],
  primaryCta: 'Book Appointment',
  secondaryCta: 'Call Our Office',
};

// Restaurant niche
export const RESTAURANT_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Fresh Flavors, Made Daily',
  heroSubheadline: 'Farm-to-table ingredients prepared with passion. Dine in or order online.',
  heroVariant: 'split-image-right',
  featuresTitle: 'What We Offer',
  featuresVariant: 'bento-box',
  features: [
    { icon: 'UtensilsCrossed', title: 'Signature Dishes', description: 'Chef-crafted recipes you won\'t find anywhere else' },
    { icon: 'Calendar', title: 'Table Reservations', description: 'Book online for guaranteed seating' },
    { icon: 'Truck', title: 'Delivery & Takeout', description: 'Hot food delivered to your door in 30 minutes' },
    { icon: 'Users', title: 'Private Events', description: 'Host your next celebration with us' },
    { icon: 'Wine', title: 'Full Bar', description: 'Craft cocktails and curated wine list' },
    { icon: 'Gift', title: 'Gift Cards', description: 'The perfect gift for food lovers' },
  ],
  primaryCta: 'View Menu',
  secondaryCta: 'Reserve Table',
};

// Real Estate niche
export const REAL_ESTATE_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Find Your Dream Home',
  heroSubheadline: 'Local expertise and personalized service to guide you home',
  heroVariant: 'split-image-right',
  featuresTitle: 'How I Help',
  featuresVariant: 'zigzag-large',
  features: [
    { icon: 'Home', title: 'Buyer Representation', description: 'Full support from first showing to closing day' },
    { icon: 'TrendingUp', title: 'Seller Services', description: 'Strategic pricing and marketing to sell fast' },
    { icon: 'MapPin', title: 'Local Market Expert', description: '15+ years of neighborhood knowledge' },
    { icon: 'Calculator', title: 'Free Home Valuation', description: 'Know what your property is worth today' },
    { icon: 'FileText', title: 'Negotiation Support', description: 'Skilled representation to get the best deal' },
    { icon: 'Phone', title: 'Always Available', description: 'Direct line for questions anytime' },
  ],
  primaryCta: 'View Listings',
  secondaryCta: 'Get Free Valuation',
};

// SaaS niche
export const SAAS_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Work Smarter, Not Harder',
  heroSubheadline: 'The all-in-one platform that replaces 5 tools. Start free, scale when ready.',
  heroVariant: 'simple-centered',
  featuresTitle: 'Everything You Need',
  featuresVariant: 'bento-box',
  features: [
    { icon: 'Zap', title: 'Lightning Fast', description: 'Built on modern infrastructure for instant response' },
    { icon: 'Users', title: 'Team Collaboration', description: 'Real-time editing and comments' },
    { icon: 'Lock', title: 'Enterprise Security', description: 'SOC 2 compliant with SSO support' },
    { icon: 'RefreshCw', title: 'Auto-Sync', description: 'Changes sync across all devices instantly' },
    { icon: 'PieChart', title: 'Built-in Analytics', description: 'Track performance without extra tools' },
    { icon: 'Plug', title: 'Integrations', description: 'Connect to 100+ apps you already use' },
  ],
  primaryCta: 'Start Free Trial',
  secondaryCta: 'Watch Demo',
};

// Contractor niche
export const CONTRACTOR_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Quality Craftsmanship, Guaranteed',
  heroSubheadline: 'Licensed and insured. Free estimates within 24 hours.',
  heroVariant: 'split-image-right',
  featuresTitle: 'Our Services',
  featuresVariant: 'grid-3',
  features: [
    { icon: 'Home', title: 'Home Renovations', description: 'Kitchen, bath, and whole-home remodels' },
    { icon: 'Hammer', title: 'New Construction', description: 'Custom builds from foundation to finish' },
    { icon: 'PaintBucket', title: 'Interior Finishing', description: 'Drywall, painting, and trim work' },
    { icon: 'Wrench', title: 'Repairs & Maintenance', description: 'Fast fixes for any issue' },
    { icon: 'FileText', title: 'Free Estimates', description: 'Detailed quotes with no obligation' },
    { icon: 'Shield', title: 'Licensed & Insured', description: 'Full coverage for your peace of mind' },
  ],
  primaryCta: 'Get Free Estimate',
  secondaryCta: 'View Our Work',
};

// Ecommerce niche
export const ECOMMERCE_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Shop the Latest Trends',
  heroSubheadline: 'Discover curated products handpicked for you. Free shipping on orders over $50.',
  heroVariant: 'split-image-right',
  featuresTitle: 'Why Shop With Us',
  featuresVariant: 'bento-box',
  features: [
    { icon: 'Package', title: 'Fast Shipping', description: 'Free delivery on orders over $50' },
    { icon: 'RefreshCw', title: 'Easy Returns', description: '30-day hassle-free returns' },
    { icon: 'Shield', title: 'Secure Checkout', description: 'Your payment info is always protected' },
    { icon: 'Star', title: 'Top Quality', description: 'Every item inspected before shipping' },
    { icon: 'Gift', title: 'Gift Wrapping', description: 'Beautiful packaging available' },
    { icon: 'Headphones', title: 'Customer Support', description: 'Real humans ready to help' },
  ],
  primaryCta: 'Shop Now',
  secondaryCta: 'View Collections',
};

// Fitness / Gym niche
export const FITNESS_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Train Hard. Get Results.',
  heroSubheadline: 'State-of-the-art equipment, expert trainers, and classes for every fitness level',
  heroVariant: 'split-image-right',
  featuresTitle: 'What We Offer',
  featuresVariant: 'bento-box',
  features: [
    { icon: 'Dumbbell', title: 'Modern Equipment', description: 'Top-of-the-line machines and free weights' },
    { icon: 'Users', title: 'Group Classes', description: 'Yoga, HIIT, spin, and more—included with membership' },
    { icon: 'Target', title: 'Personal Training', description: 'One-on-one coaching to reach your goals faster' },
    { icon: 'Clock', title: 'Open Early & Late', description: 'Workout on your schedule, 5am to 11pm' },
    { icon: 'Shower', title: 'Locker Rooms', description: 'Clean facilities with showers and towel service' },
    { icon: 'Zap', title: 'Free Trial', description: 'Try us free for a week—no commitment' },
  ],
  primaryCta: 'Start Free Trial',
  secondaryCta: 'View Class Schedule',
};

// Salon / Spa niche
export const SALON_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Look Good. Feel Amazing.',
  heroSubheadline: 'Expert stylists, relaxing atmosphere, and personalized service',
  heroVariant: 'split-image-right',
  featuresTitle: 'Our Services',
  featuresVariant: 'grid-3',
  features: [
    { icon: 'Scissors', title: 'Haircuts & Styling', description: 'Precision cuts and on-trend styling' },
    { icon: 'Sparkles', title: 'Color Services', description: 'Highlights, balayage, and custom color' },
    { icon: 'Heart', title: 'Spa Treatments', description: 'Facials, massages, and relaxation' },
    { icon: 'Star', title: 'Nail Services', description: 'Manicures, pedicures, and nail art' },
    { icon: 'Gift', title: 'Gift Cards', description: 'The perfect gift for someone special' },
    { icon: 'Calendar', title: 'Online Booking', description: 'Book your appointment 24/7' },
  ],
  primaryCta: 'Book Appointment',
  secondaryCta: 'View Services',
};

// Plumber / Home Services niche
export const PLUMBER_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Fast Fixes. Fair Prices.',
  heroSubheadline: 'Licensed plumbers available 24/7 for emergencies and repairs',
  heroVariant: 'simple-centered',
  featuresTitle: 'Our Services',
  featuresVariant: 'grid-3',
  features: [
    { icon: 'Wrench', title: 'Repairs', description: 'Leaks, clogs, and broken fixtures—fixed fast' },
    { icon: 'Droplet', title: 'Water Heaters', description: 'Installation and repair, same-day service' },
    { icon: 'Home', title: 'Remodeling', description: 'Bathroom and kitchen plumbing upgrades' },
    { icon: 'AlertTriangle', title: '24/7 Emergency', description: 'Call anytime—we respond in under an hour' },
    { icon: 'Shield', title: 'Licensed & Insured', description: 'Full coverage for your peace of mind' },
    { icon: 'FileText', title: 'Free Estimates', description: 'Upfront pricing, no surprises' },
  ],
  primaryCta: 'Get Free Quote',
  secondaryCta: 'Call Now',
};

// Generic fallback for unknown niches - COMPLETELY NEUTRAL (NO SAAS/TECH TERMS)
export const GENERIC_SCHEMA: NicheContentSchema = {
  heroHeadline: 'Quality Solutions for Your Business',
  heroSubheadline: 'Professional service you can count on',
  heroVariant: 'simple-centered',
  featuresTitle: 'Why Choose Us',
  featuresVariant: 'grid-3',
  features: [
    { icon: 'Users', title: 'Professional Team', description: 'Experienced professionals ready to help' },
    { icon: 'Shield', title: 'Reliable Service', description: 'Count on us when you need us most' },
    { icon: 'Heart', title: 'Customer Focus', description: 'Your satisfaction is our priority' },
    { icon: 'Clock', title: 'Timely Results', description: 'Respect for your schedule and deadlines' },
  ],
  primaryCta: 'Contact Us',
  secondaryCta: 'Learn More',
};

// Map niche keywords to schemas
export const NICHE_SCHEMAS: Record<string, NicheContentSchema> = {
  // Dental
  dentist: DENTIST_SCHEMA,
  dental: DENTIST_SCHEMA,
  orthodontist: DENTIST_SCHEMA,
  
  // Restaurant
  restaurant: RESTAURANT_SCHEMA,
  cafe: RESTAURANT_SCHEMA,
  bistro: RESTAURANT_SCHEMA,
  pizzeria: RESTAURANT_SCHEMA,
  bakery: RESTAURANT_SCHEMA,
  bar: RESTAURANT_SCHEMA,
  
  // Real Estate
  'real estate': REAL_ESTATE_SCHEMA,
  realtor: REAL_ESTATE_SCHEMA,
  'real-estate': REAL_ESTATE_SCHEMA,
  realty: REAL_ESTATE_SCHEMA,
  broker: REAL_ESTATE_SCHEMA,
  
  // Fitness / Gym
  gym: FITNESS_SCHEMA,
  fitness: FITNESS_SCHEMA,
  'fitness gym': FITNESS_SCHEMA,
  workout: FITNESS_SCHEMA,
  crossfit: FITNESS_SCHEMA,
  yoga: FITNESS_SCHEMA,
  pilates: FITNESS_SCHEMA,
  'personal training': FITNESS_SCHEMA,
  
  // Salon / Spa
  salon: SALON_SCHEMA,
  spa: SALON_SCHEMA,
  'hair salon': SALON_SCHEMA,
  barbershop: SALON_SCHEMA,
  barber: SALON_SCHEMA,
  nails: SALON_SCHEMA,
  beauty: SALON_SCHEMA,
  
  // Plumber / Home Services
  plumber: PLUMBER_SCHEMA,
  plumbing: PLUMBER_SCHEMA,
  electrician: PLUMBER_SCHEMA,
  hvac: PLUMBER_SCHEMA,
  'home repair': PLUMBER_SCHEMA,
  
  // SaaS - ONLY for actual software businesses
  saas: SAAS_SCHEMA,
  software: SAAS_SCHEMA,
  app: SAAS_SCHEMA,
  platform: SAAS_SCHEMA,
  
  // Contractor
  contractor: CONTRACTOR_SCHEMA,
  construction: CONTRACTOR_SCHEMA,
  builder: CONTRACTOR_SCHEMA,
  remodeling: CONTRACTOR_SCHEMA,
  renovation: CONTRACTOR_SCHEMA,
  handyman: CONTRACTOR_SCHEMA,
  
  // Ecommerce
  shop: ECOMMERCE_SCHEMA,
  store: ECOMMERCE_SCHEMA,
  fashion: ECOMMERCE_SCHEMA,
  buy: ECOMMERCE_SCHEMA,
  ecommerce: ECOMMERCE_SCHEMA,
  'e-commerce': ECOMMERCE_SCHEMA,
  boutique: ECOMMERCE_SCHEMA,
  retail: ECOMMERCE_SCHEMA,
};

// Get niche schema from input text - returns GENERIC_SCHEMA as fallback, never null
export function getNicheSchema(input: string): NicheContentSchema {
  const lowerInput = input.toLowerCase();
  
  for (const [keyword, schema] of Object.entries(NICHE_SCHEMAS)) {
    if (lowerInput.includes(keyword)) {
      return schema;
    }
  }
  
  // Return generic fallback instead of contractor-specific text
  return GENERIC_SCHEMA;
}

// Map primary goal to business intent
export function goalToIntent(goal: PrimaryGoal): BusinessIntent {
  switch (goal) {
    case 'bookings':
      return 'booking_business';
    case 'leads':
    case 'calls':
      return 'service_business';
    case 'sales':
    case 'visits':
      return 'product_store';
    case 'signups':
      return 'saas';
    case 'donations':
      return 'nonprofit';
    case 'downloads':
      return 'portfolio';
    default:
      return 'service_business';
  }
}

// Map NicheCategory to BusinessIntent
export function nicheCategoryToIntent(category: NicheCategory): BusinessIntent {
  switch (category) {
    case 'ecommerce':
    case 'reseller':
      return 'product_store';
    case 'restaurant':
    case 'fitness':
    case 'coaching':
    case 'event':
      return 'booking_business';
    case 'local_service':
    case 'real_estate':
      return 'service_business';
    case 'saas':
    case 'course':
    case 'community':
      return 'saas';
    case 'nonprofit':
      return 'nonprofit';
    case 'portfolio':
      return 'portfolio';
    default:
      return 'service_business';
  }
}

// Map ConversionGoal to BusinessIntent
export function conversionGoalToIntent(goal: ConversionGoal): BusinessIntent {
  switch (goal) {
    case 'buy_now':
      return 'product_store';
    case 'book':
      return 'booking_business';
    case 'request_quote':
    case 'visit':
      return 'service_business';
    case 'apply':
    case 'register':
    case 'subscribe':
      return 'saas';
    case 'donate':
      return 'nonprofit';
    default:
      return 'service_business';
  }
}

// Intent-aware pricing section titles
export const PRICING_TITLES: Record<BusinessIntent, { title: string; subtitle: string }> = {
  booking_business: {
    title: 'Membership Options',
    subtitle: 'Choose the plan that fits your lifestyle',
  },
  service_business: {
    title: 'Service Packages',
    subtitle: 'Transparent pricing for every project',
  },
  product_store: {
    title: 'Featured Collections',
    subtitle: 'Curated selections for every need',
  },
  saas: {
    title: 'Plans & Pricing',
    subtitle: 'Start free, scale as you grow',
  },
  nonprofit: {
    title: 'Ways to Give',
    subtitle: 'Every contribution makes a difference',
  },
  portfolio: {
    title: 'Packages',
    subtitle: 'Services tailored to your vision',
  },
};

// Intent-aware pricing plans
export const PRICING_PLANS: Record<BusinessIntent, PricingTier[]> = {
  booking_business: [
    {
      name: 'Drop-In',
      price: '$__',
      period: '/visit',
      features: ['Single class access', 'All equipment included', 'Flexible scheduling', 'No commitment'],
      highlighted: false,
      ctaText: 'Book a Class',
    },
    {
      name: 'Monthly',
      price: '$__',
      period: '/month',
      features: ['Unlimited classes', 'Priority booking', 'Guest passes included', 'Cancel anytime'],
      highlighted: true,
      ctaText: 'Start Membership',
    },
    {
      name: 'Annual',
      price: '$__',
      period: '/year',
      features: ['All Monthly benefits', '2 months free', 'Free merchandise', 'VIP perks'],
      highlighted: false,
      ctaText: 'Best Value',
    },
  ],
  service_business: [
    {
      name: 'Basic',
      price: 'From $__',
      period: '',
      features: ['Standard service scope', 'Quality materials', 'Satisfaction guarantee', 'Email support'],
      highlighted: false,
      ctaText: 'Get Estimate',
    },
    {
      name: 'Standard',
      price: 'From $__',
      period: '',
      features: ['Extended service scope', 'Premium materials', 'Priority scheduling', 'Phone support'],
      highlighted: true,
      ctaText: 'Most Popular',
    },
    {
      name: 'Premium',
      price: 'Custom',
      period: '',
      features: ['Full-service package', 'Top-tier materials', 'Dedicated support', 'Warranty included'],
      highlighted: false,
      ctaText: 'Contact Us',
    },
  ],
  product_store: [
    {
      name: 'Essentials',
      price: '$__',
      period: '+',
      features: ['Core product selection', 'Free shipping over $50', 'Easy returns', 'Member rewards'],
      highlighted: false,
      ctaText: 'Shop Now',
    },
    {
      name: 'Bundles',
      price: 'Save 20%',
      period: '',
      features: ['Curated collections', 'Exclusive discounts', 'Gift-ready packaging', 'Priority shipping'],
      highlighted: true,
      ctaText: 'View Bundles',
    },
    {
      name: 'Premium',
      price: '$__',
      period: '+',
      features: ['Limited editions', 'Collector items', 'White-glove service', 'Lifetime warranty'],
      highlighted: false,
      ctaText: 'Explore',
    },
  ],
  saas: [
    {
      name: 'Starter',
      price: '$__',
      period: '/month',
      features: ['Core features', 'Up to 3 users', 'Email support', '1GB storage'],
      highlighted: false,
      ctaText: 'Start Free',
    },
    {
      name: 'Pro',
      price: '$__',
      period: '/month',
      features: ['All Starter features', 'Unlimited users', 'Priority support', '10GB storage'],
      highlighted: true,
      ctaText: 'Go Pro',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['All Pro features', 'Dedicated manager', 'Custom integrations', 'SLA guarantee'],
      highlighted: false,
      ctaText: 'Contact Sales',
    },
  ],
  nonprofit: [
    {
      name: 'Supporter',
      price: '$__',
      period: '/month',
      features: ['Monthly newsletter', 'Impact reports', 'Donor recognition', 'Tax-deductible'],
      highlighted: false,
      ctaText: 'Give Monthly',
    },
    {
      name: 'Champion',
      price: '$__',
      period: '/month',
      features: ['All Supporter benefits', 'Exclusive updates', 'Event invitations', 'Named recognition'],
      highlighted: true,
      ctaText: 'Become a Champion',
    },
    {
      name: 'Partner',
      price: 'Custom',
      period: '',
      features: ['Corporate partnership', 'Brand visibility', 'Custom programs', 'Direct impact'],
      highlighted: false,
      ctaText: 'Partner With Us',
    },
  ],
  portfolio: [
    {
      name: 'Basic',
      price: '$__',
      period: '',
      features: ['Single session', 'Digital delivery', 'Standard editing', 'Quick turnaround'],
      highlighted: false,
      ctaText: 'Book Session',
    },
    {
      name: 'Standard',
      price: '$__',
      period: '',
      features: ['Extended session', 'Premium editing', 'Multiple looks', 'Print-ready files'],
      highlighted: true,
      ctaText: 'Most Popular',
    },
    {
      name: 'Premium',
      price: '$__',
      period: '',
      features: ['Full-day coverage', 'Rush delivery', 'All files included', 'Album design'],
      highlighted: false,
      ctaText: 'Get Quote',
    },
  ],
};

// Intent-aware CTA content
export const CTA_CONTENT: Record<BusinessIntent, CTAContent> = {
  booking_business: {
    headline: 'Ready to Get Started?',
    subheadline: 'Book your first session and experience the difference',
    ctaText: 'Book a Free Trial',
    ctaLink: '#contact',
  },
  service_business: {
    headline: 'Get Your Free Estimate',
    subheadline: 'No obligation, no hassle—just transparent pricing',
    ctaText: 'Request Quote',
    ctaLink: '#contact',
  },
  product_store: {
    headline: 'Shop Our Collection',
    subheadline: 'Find exactly what you need with free shipping on orders over $50',
    ctaText: 'Browse Products',
    ctaLink: '#products',
  },
  saas: {
    headline: 'Start Building Today',
    subheadline: 'No credit card required. Get started in minutes.',
    ctaText: 'Start Free Trial',
    ctaLink: '#signup',
  },
  nonprofit: {
    headline: 'Join Our Mission',
    subheadline: 'Your support creates lasting change in our community',
    ctaText: 'Donate Now',
    ctaLink: '#donate',
  },
  portfolio: {
    headline: 'Let\'s Create Together',
    subheadline: 'Book a consultation and bring your vision to life',
    ctaText: 'Schedule Consultation',
    ctaLink: '#contact',
  },
};

// Secondary CTA buttons by intent
export const SECONDARY_CTA: Record<BusinessIntent, { text: string; link: string }> = {
  booking_business: { text: 'View Schedule', link: '#schedule' },
  service_business: { text: 'See Our Work', link: '#portfolio' },
  product_store: { text: 'View Collections', link: '#collections' },
  saas: { text: 'Watch Demo', link: '#demo' },
  nonprofit: { text: 'Learn More', link: '#about' },
  portfolio: { text: 'View Portfolio', link: '#gallery' },
};

// Fine print by intent
export const PRICING_FINE_PRINT: Record<BusinessIntent, string> = {
  booking_business: 'No long-term contracts. Cancel or pause anytime.',
  service_business: 'Free estimates. Licensed and insured.',
  product_store: 'Free returns within 30 days. Satisfaction guaranteed.',
  saas: 'Cancel anytime. No hidden fees.',
  nonprofit: 'All donations are tax-deductible.',
  portfolio: 'Deposits secure your date. Flexible payment plans available.',
};

// Industry-specific pricing tier names
export const INDUSTRY_PRICING_TIERS: Record<string, { names: string[]; period?: string }> = {
  gym: { names: ['Drop-In', 'Monthly', 'Annual'], period: '/visit' },
  fitness: { names: ['Drop-In', 'Monthly', 'Annual'], period: '/visit' },
  yoga: { names: ['Single Class', 'Monthly Unlimited', 'Yearly'], period: '/class' },
  salon: { names: ['Express', 'Signature', 'Luxe'] },
  spa: { names: ['Escape', 'Revive', 'Ultimate'] },
  contractor: { names: ['Basic', 'Standard', 'Full-Service'] },
  plumber: { names: ['Service Call', 'Standard Repair', 'Complete Job'] },
  electrician: { names: ['Diagnostic', 'Standard', 'Premium'] },
  restaurant: { names: ['Lunch Special', 'Dinner', 'Private Dining'] },
  bakery: { names: ['Single Item', 'Dozen', 'Custom Order'] },
  photography: { names: ['Mini Session', 'Full Session', 'All-Day Coverage'] },
  wedding_planner: { names: ['Day-Of Coordination', 'Partial Planning', 'Full Service'] },
  veterinary: { names: ['Wellness Visit', 'Comprehensive Care', 'Premium Plan'] },
  insurance: { names: ['Basic Coverage', 'Standard Protection', 'Premium Shield'] },
  event_planner: { names: ['Consultation', 'Partial Planning', 'Full Production'] },
};

// Extended CTA variations by industry
export const INDUSTRY_CTA_VARIATIONS: Record<string, { primary: string[]; secondary: string[] }> = {
  plumber: {
    primary: ['Get Free Quote', 'Call Now', 'Request Service', 'Emergency? Call Now'],
    secondary: ['View Services', 'Service Areas', 'About Us'],
  },
  electrician: {
    primary: ['Get Free Estimate', 'Call Now', 'Request Service', '24/7 Emergency'],
    secondary: ['Our Services', 'See Our Work', 'Why Choose Us'],
  },
  hvac: {
    primary: ['Schedule Service', 'Get Free Quote', 'Call Now'],
    secondary: ['Maintenance Plans', 'Financing Options', 'Service Areas'],
  },
  restaurant: {
    primary: ['View Menu', 'Reserve Table', 'Order Online', 'Call to Order'],
    secondary: ['Private Events', 'Catering', 'Gift Cards'],
  },
  gym: {
    primary: ['Join Now', 'Start Free Trial', 'Book a Tour'],
    secondary: ['View Classes', 'Meet Trainers', 'See Pricing'],
  },
  salon: {
    primary: ['Book Appointment', 'Schedule Now', 'Book Online'],
    secondary: ['View Services', 'Meet Our Team', 'Gallery'],
  },
  wedding_planner: {
    primary: ['Book Consultation', 'View Packages', 'Start Planning'],
    secondary: ['Portfolio', 'About', 'Testimonials'],
  },
  general_contractor: {
    primary: ['Get Free Estimate', 'Request Bid', 'Call Now'],
    secondary: ['View Projects', 'Our Process', 'About Us'],
  },
  veterinary: {
    primary: ['Book Appointment', 'Emergency? Call Now', 'New Patient Form'],
    secondary: ['Our Services', 'Meet Our Team', 'Pet Resources'],
  },
  insurance: {
    primary: ['Get Free Quote', 'Compare Plans', 'Call Agent'],
    secondary: ['Coverage Options', 'About Us', 'File Claim'],
  },
  event_planner: {
    primary: ['Plan Your Event', 'Get Quote', 'Schedule Consultation'],
    secondary: ['Past Events', 'Services', 'About'],
  },
};
