// Conversion Archetype Registry - 24+ proven high-converting structures
import type { NicheCategory, ConversionGoal, IntegrationType } from './nicheRouter';
import type { SectionType } from '@/types/site-spec';

export type PageDefinition = {
  path: string;
  title: string;
  requiredSections: SectionType[];
};

export type ConversionArchetype = {
  id: string;
  category: NicheCategory;
  goal: ConversionGoal;
  requiredPages: PageDefinition[];
  requiredIntegrations: IntegrationType[];
  ctaRules: { primary: string; secondary?: string };
  forbiddenPhrases: string[];
  layoutSignature: string;
};

export const CONVERSION_ARCHETYPES: ConversionArchetype[] = [
  // ============= ECOMMERCE / RESELLING (4) =============
  {
    id: 'ecom_catalog_checkout',
    category: 'ecommerce',
    goal: 'buy_now',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/shop', title: 'Shop', requiredSections: ['hero', 'gallery', 'cta'] },
      { path: '/product', title: 'Product', requiredSections: ['hero', 'features', 'faq', 'cta'] },
      { path: '/cart', title: 'Cart', requiredSections: ['custom'] },
      { path: '/checkout', title: 'Checkout', requiredSections: ['custom'] },
      { path: '/policies', title: 'Policies', requiredSections: ['faq', 'contact'] },
    ],
    requiredIntegrations: ['stripe', 'analytics'],
    ctaRules: { primary: 'Add to Cart', secondary: 'View Details' },
    forbiddenPhrases: ['book appointment', 'get quote', 'schedule session', 'curriculum', 'modules'],
    layoutSignature: 'ecom-catalog-6page',
  },
  {
    id: 'ecom_single_product_longform',
    category: 'ecommerce',
    goal: 'buy_now',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta'] },
      { path: '/faq', title: 'FAQ', requiredSections: ['faq', 'cta'] },
      { path: '/checkout', title: 'Checkout', requiredSections: ['custom'] },
    ],
    requiredIntegrations: ['stripe', 'analytics'],
    ctaRules: { primary: 'Buy Now', secondary: 'Learn More' },
    forbiddenPhrases: ['book appointment', 'browse catalog', 'view inventory'],
    layoutSignature: 'ecom-single-3page',
  },
  {
    id: 'reseller_drops_weekly',
    category: 'reseller',
    goal: 'buy_now',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'gallery', 'cta'] },
      { path: '/drops', title: 'Drops', requiredSections: ['hero', 'gallery', 'cta'] },
      { path: '/product', title: 'Product', requiredSections: ['hero', 'features', 'cta'] },
      { path: '/size-guide', title: 'Size Guide', requiredSections: ['custom', 'faq'] },
      { path: '/shipping', title: 'Shipping & Returns', requiredSections: ['faq', 'contact'] },
      { path: '/checkout', title: 'Checkout', requiredSections: ['custom'] },
    ],
    requiredIntegrations: ['stripe', 'analytics', 'email_capture'],
    ctaRules: { primary: 'Cop Now', secondary: 'Get Notified' },
    forbiddenPhrases: ['book consultation', 'schedule demo', 'free trial'],
    layoutSignature: 'reseller-drops-6page',
  },
  {
    id: 'reseller_marketplace_listings',
    category: 'reseller',
    goal: 'buy_now',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/listings', title: 'Listings', requiredSections: ['hero', 'gallery'] },
      { path: '/listing', title: 'Listing Detail', requiredSections: ['hero', 'features', 'cta'] },
      { path: '/sell', title: 'Sell With Us', requiredSections: ['hero', 'features', 'faq', 'contact'] },
      { path: '/policies', title: 'Policies', requiredSections: ['faq'] },
    ],
    requiredIntegrations: ['stripe', 'email_capture'],
    ctaRules: { primary: 'Buy Now', secondary: 'Sell Yours' },
    forbiddenPhrases: ['schedule appointment', 'free consultation'],
    layoutSignature: 'reseller-marketplace-5page',
  },

  // ============= RESTAURANT (4) =============
  // NOTE: Restaurants should NEVER have cart/checkout/shop pages - they use ordering integrations
  {
    id: 'restaurant_menu_ordering',
    category: 'restaurant',
    goal: 'buy_now', // Online ordering counts as buy_now for restaurants
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/menu', title: 'Menu', requiredSections: ['hero', 'services', 'cta'] },
      { path: '/order', title: 'Order Online', requiredSections: ['custom', 'cta'] },
      { path: '/location', title: 'Hours & Location', requiredSections: ['contact', 'custom'] },
      { path: '/about', title: 'About', requiredSections: ['hero', 'features', 'cta'] },
    ],
    requiredIntegrations: ['ordering', 'maps'],
    ctaRules: { primary: 'Order Now', secondary: 'View Menu' },
    forbiddenPhrases: ['add to cart', 'checkout', 'shop', 'cart', 'curriculum', 'modules', 'test drive', 'browse inventory', 'apply now'],
    layoutSignature: 'restaurant-ordering-5page',
  },
  {
    id: 'restaurant_menu_reservations',
    category: 'restaurant',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'gallery', 'testimonials', 'cta'] },
      { path: '/menu', title: 'Menu', requiredSections: ['hero', 'services'] },
      { path: '/reservations', title: 'Reservations', requiredSections: ['custom', 'contact'] },
      { path: '/location', title: 'Hours & Location', requiredSections: ['contact', 'custom'] },
      { path: '/about', title: 'About', requiredSections: ['hero', 'features'] },
    ],
    requiredIntegrations: ['reservations', 'maps'],
    ctaRules: { primary: 'Reserve a Table', secondary: 'View Menu' },
    forbiddenPhrases: ['add to cart', 'checkout', 'shop', 'cart', 'curriculum', 'modules', 'subscribe now', 'pricing tiers'],
    layoutSignature: 'restaurant-reservations-5page',
  },
  {
    id: 'restaurant_multi_location',
    category: 'restaurant',
    goal: 'visit',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'cta'] },
      { path: '/locations', title: 'Locations', requiredSections: ['hero', 'custom'] },
      { path: '/menu', title: 'Menu', requiredSections: ['hero', 'services'] },
      { path: '/catering', title: 'Catering', requiredSections: ['hero', 'services', 'faq', 'contact'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact'] },
    ],
    requiredIntegrations: ['maps', 'email_capture'],
    ctaRules: { primary: 'Find a Location', secondary: 'View Menu' },
    forbiddenPhrases: ['add to cart', 'checkout', 'shop', 'cart', 'schedule demo', 'free trial', 'apply today'],
    layoutSignature: 'restaurant-multi-5page',
  },
  {
    id: 'restaurant_simple',
    category: 'restaurant',
    goal: 'request_quote', // For catering requests
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/menu', title: 'Menu', requiredSections: ['hero', 'services'] },
      { path: '/about', title: 'About', requiredSections: ['hero', 'features', 'team'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact', 'custom'] },
    ],
    requiredIntegrations: ['maps', 'email_capture'],
    ctaRules: { primary: 'Contact Us', secondary: 'View Menu' },
    forbiddenPhrases: ['add to cart', 'checkout', 'shop', 'cart', 'subscribe', 'apply now'],
    layoutSignature: 'restaurant-simple-4page',
  },

  // ============= LOCAL SERVICE (3) =============
  {
    id: 'service_quote_funnel',
    category: 'local_service',
    goal: 'request_quote',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'services', 'testimonials', 'cta'] },
      { path: '/services', title: 'Services', requiredSections: ['hero', 'services', 'pricing', 'cta'] },
      { path: '/estimate', title: 'Free Estimate', requiredSections: ['hero', 'custom', 'contact'] },
      { path: '/areas', title: 'Service Areas', requiredSections: ['hero', 'custom', 'cta'] },
      { path: '/reviews', title: 'Reviews', requiredSections: ['hero', 'testimonials', 'cta'] },
    ],
    requiredIntegrations: ['maps', 'email_capture'],
    ctaRules: { primary: 'Get Free Estimate', secondary: 'View Services' },
    forbiddenPhrases: ['add to cart', 'checkout', 'curriculum', 'modules'],
    layoutSignature: 'service-quote-5page',
  },
  {
    id: 'service_booking_first',
    category: 'local_service',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'services', 'testimonials', 'cta'] },
      { path: '/booking', title: 'Book Now', requiredSections: ['hero', 'custom'] },
      { path: '/services', title: 'Services', requiredSections: ['hero', 'services', 'pricing'] },
      { path: '/about', title: 'About', requiredSections: ['hero', 'team', 'cta'] },
      { path: '/reviews', title: 'Reviews', requiredSections: ['testimonials', 'cta'] },
      { path: '/faq', title: 'FAQ', requiredSections: ['faq', 'cta'] },
    ],
    requiredIntegrations: ['calendly', 'maps'],
    ctaRules: { primary: 'Book Now', secondary: 'View Services' },
    forbiddenPhrases: ['buy now', 'add to cart', 'order online'],
    layoutSignature: 'service-booking-6page',
  },
  {
    id: 'service_emergency',
    category: 'local_service',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'services', 'stats', 'testimonials', 'cta'] },
      { path: '/coverage', title: 'Service Areas', requiredSections: ['hero', 'custom'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact', 'custom'] },
      { path: '/reviews', title: 'Reviews', requiredSections: ['testimonials', 'cta'] },
    ],
    requiredIntegrations: ['maps'],
    ctaRules: { primary: 'Call Now', secondary: 'Request Callback' },
    forbiddenPhrases: ['browse products', 'view menu', 'curriculum'],
    layoutSignature: 'service-emergency-4page',
  },

  // ============= SAAS (3) =============
  {
    id: 'saas_trial_pricing',
    category: 'saas',
    goal: 'buy_now',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'testimonials', 'cta'] },
      { path: '/features', title: 'Features', requiredSections: ['hero', 'features', 'cta'] },
      { path: '/integrations', title: 'Integrations', requiredSections: ['hero', 'gallery', 'cta'] },
      { path: '/pricing', title: 'Pricing', requiredSections: ['hero', 'pricing', 'faq', 'cta'] },
      { path: '/docs', title: 'Documentation', requiredSections: ['hero', 'faq'] },
    ],
    requiredIntegrations: ['stripe', 'analytics', 'email_capture'],
    ctaRules: { primary: 'Start Free Trial', secondary: 'See Pricing' },
    forbiddenPhrases: ['menu', 'reservations', 'view inventory', 'book appointment'],
    layoutSignature: 'saas-trial-5page',
  },
  {
    id: 'saas_waitlist_launch',
    category: 'saas',
    goal: 'subscribe',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'cta'] },
      { path: '/thank-you', title: 'Thank You', requiredSections: ['hero', 'cta'] },
      { path: '/roadmap', title: 'Roadmap', requiredSections: ['hero', 'features'] },
    ],
    requiredIntegrations: ['email_capture', 'analytics'],
    ctaRules: { primary: 'Join Waitlist', secondary: 'Learn More' },
    forbiddenPhrases: ['add to cart', 'book now', 'order online'],
    layoutSignature: 'saas-waitlist-3page',
  },
  {
    id: 'saas_enterprise_sales',
    category: 'saas',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'testimonials', 'cta'] },
      { path: '/product', title: 'Product', requiredSections: ['hero', 'features', 'cta'] },
      { path: '/security', title: 'Security', requiredSections: ['hero', 'features', 'faq'] },
      { path: '/case-studies', title: 'Case Studies', requiredSections: ['hero', 'testimonials', 'cta'] },
      { path: '/contact', title: 'Contact Sales', requiredSections: ['hero', 'contact'] },
    ],
    requiredIntegrations: ['calendly', 'analytics'],
    ctaRules: { primary: 'Contact Sales', secondary: 'See Product' },
    forbiddenPhrases: ['order now', 'view menu', 'get estimate'],
    layoutSignature: 'saas-enterprise-5page',
  },

  // ============= COURSE / COACHING (4) =============
  {
    id: 'course_evergreen_salespage',
    category: 'course',
    goal: 'buy_now',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta'] },
      { path: '/curriculum', title: 'Curriculum', requiredSections: ['hero', 'services', 'faq'] },
      { path: '/resources', title: 'Resources', requiredSections: ['hero', 'features'] },
      { path: '/faq', title: 'FAQ', requiredSections: ['faq', 'cta'] },
    ],
    requiredIntegrations: ['stripe', 'email_capture'],
    ctaRules: { primary: 'Enroll Now', secondary: 'View Curriculum' },
    forbiddenPhrases: ['book appointment', 'get estimate', 'order food', 'test drive'],
    layoutSignature: 'course-evergreen-4page',
  },
  {
    id: 'course_webinar_funnel',
    category: 'course',
    goal: 'register',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/register', title: 'Register', requiredSections: ['hero', 'custom'] },
      { path: '/thank-you', title: 'Thank You', requiredSections: ['hero', 'cta'] },
      { path: '/watch', title: 'Watch', requiredSections: ['hero', 'custom'] },
      { path: '/offer', title: 'Special Offer', requiredSections: ['hero', 'pricing', 'faq', 'cta'] },
    ],
    requiredIntegrations: ['email_capture', 'stripe'],
    ctaRules: { primary: 'Register Free', secondary: 'Watch Now' },
    forbiddenPhrases: ['add to cart', 'view inventory', 'book table'],
    layoutSignature: 'course-webinar-5page',
  },
  {
    id: 'coaching_apply_high_ticket',
    category: 'coaching',
    goal: 'apply',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'testimonials', 'cta'] },
      { path: '/results', title: 'Results', requiredSections: ['hero', 'testimonials', 'stats'] },
      { path: '/process', title: 'Process', requiredSections: ['hero', 'services', 'faq'] },
      { path: '/apply', title: 'Apply', requiredSections: ['hero', 'custom', 'faq'] },
    ],
    requiredIntegrations: ['calendly', 'email_capture'],
    ctaRules: { primary: 'Apply Now', secondary: 'See Results' },
    forbiddenPhrases: ['add to cart', 'order now', 'view menu', 'browse products'],
    layoutSignature: 'coaching-apply-4page',
  },
  {
    id: 'coaching_book_call',
    category: 'coaching',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/services', title: 'Services', requiredSections: ['hero', 'services', 'pricing'] },
      { path: '/booking', title: 'Book a Call', requiredSections: ['hero', 'custom'] },
      { path: '/testimonials', title: 'Success Stories', requiredSections: ['testimonials', 'cta'] },
      { path: '/faq', title: 'FAQ', requiredSections: ['faq', 'cta'] },
    ],
    requiredIntegrations: ['calendly', 'email_capture'],
    ctaRules: { primary: 'Book a Call', secondary: 'View Services' },
    forbiddenPhrases: ['checkout', 'add to cart', 'order food'],
    layoutSignature: 'coaching-call-5page',
  },

  // ============= EVENT / REAL ESTATE / NONPROFIT (4) =============
  {
    id: 'event_ticketing',
    category: 'event',
    goal: 'register',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'stats', 'cta'] },
      { path: '/schedule', title: 'Schedule', requiredSections: ['hero', 'services'] },
      { path: '/speakers', title: 'Speakers', requiredSections: ['hero', 'team'] },
      { path: '/tickets', title: 'Tickets', requiredSections: ['hero', 'pricing', 'cta'] },
      { path: '/venue', title: 'Venue', requiredSections: ['hero', 'custom', 'contact'] },
    ],
    requiredIntegrations: ['stripe', 'maps'],
    ctaRules: { primary: 'Get Tickets', secondary: 'View Schedule' },
    forbiddenPhrases: ['curriculum', 'book appointment', 'order food'],
    layoutSignature: 'event-ticketing-5page',
  },
  {
    id: 'real_estate_listings',
    category: 'real_estate',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/listings', title: 'Listings', requiredSections: ['hero', 'gallery'] },
      { path: '/listing', title: 'Property Detail', requiredSections: ['hero', 'features', 'gallery', 'contact'] },
      { path: '/calculator', title: 'Mortgage Calculator', requiredSections: ['hero', 'custom'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact', 'cta'] },
    ],
    requiredIntegrations: ['calendly', 'maps', 'email_capture'],
    ctaRules: { primary: 'Schedule Showing', secondary: 'View Listings' },
    forbiddenPhrases: ['add to cart', 'order now', 'curriculum', 'modules'],
    layoutSignature: 'real-estate-5page',
  },
  {
    id: 'nonprofit_donate',
    category: 'nonprofit',
    goal: 'donate',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'stats', 'features', 'testimonials', 'cta'] },
      { path: '/donate', title: 'Donate', requiredSections: ['hero', 'pricing', 'custom'] },
      { path: '/impact', title: 'Our Impact', requiredSections: ['hero', 'stats', 'testimonials'] },
      { path: '/programs', title: 'Programs', requiredSections: ['hero', 'services'] },
      { path: '/volunteer', title: 'Volunteer', requiredSections: ['hero', 'custom', 'contact'] },
    ],
    requiredIntegrations: ['stripe', 'email_capture'],
    ctaRules: { primary: 'Donate Now', secondary: 'Learn More' },
    forbiddenPhrases: ['add to cart', 'checkout', 'book appointment', 'pricing tiers'],
    layoutSignature: 'nonprofit-donate-5page',
  },

  // ============= PORTFOLIO / COMMUNITY (3) =============
  {
    id: 'portfolio_showcase',
    category: 'portfolio',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'portfolio', 'testimonials', 'cta'] },
      { path: '/work', title: 'Work', requiredSections: ['hero', 'portfolio'] },
      { path: '/about', title: 'About', requiredSections: ['hero', 'features'] },
      { path: '/services', title: 'Services', requiredSections: ['services', 'pricing', 'cta'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact'] },
    ],
    requiredIntegrations: ['email_capture'],
    ctaRules: { primary: 'Get in Touch', secondary: 'View Work' },
    forbiddenPhrases: ['add to cart', 'order now', 'donate'],
    layoutSignature: 'portfolio-5page',
  },
  {
    id: 'community_membership',
    category: 'community',
    goal: 'subscribe',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'features', 'testimonials', 'cta'] },
      { path: '/join', title: 'Join', requiredSections: ['hero', 'pricing', 'faq'] },
      { path: '/benefits', title: 'Benefits', requiredSections: ['hero', 'features', 'cta'] },
    ],
    requiredIntegrations: ['stripe'],
    ctaRules: { primary: 'Join Now', secondary: 'See Benefits' },
    forbiddenPhrases: ['order food', 'get estimate', 'view listings'],
    layoutSignature: 'community-membership-3page',
  },
  // ============= FITNESS / GYM =============
  {
    id: 'fitness_gym_membership',
    category: 'fitness',
    goal: 'subscribe',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'services', 'pricing', 'testimonials', 'cta'] },
      { path: '/classes', title: 'Classes', requiredSections: ['hero', 'services'] },
      { path: '/memberships', title: 'Memberships', requiredSections: ['hero', 'pricing', 'faq'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact'] },
    ],
    requiredIntegrations: ['stripe'],
    ctaRules: { primary: 'Join Now', secondary: 'Book Class' },
    forbiddenPhrases: ['add to cart', 'order food', 'view listings', 'curriculum'],
    layoutSignature: 'fitness-gym-4page',
  },
  {
    id: 'fitness_yoga_studio',
    category: 'fitness',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'services', 'testimonials', 'cta'] },
      { path: '/schedule', title: 'Schedule', requiredSections: ['hero', 'services'] },
      { path: '/pricing', title: 'Pricing', requiredSections: ['hero', 'pricing', 'faq'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact'] },
    ],
    requiredIntegrations: ['calendly'],
    ctaRules: { primary: 'Book Class', secondary: 'View Schedule' },
    forbiddenPhrases: ['add to cart', 'order food', 'checkout'],
    layoutSignature: 'fitness-yoga-4page',
  },
  {
    id: 'creative_agency',
    category: 'portfolio',
    goal: 'request_quote',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'portfolio', 'services', 'testimonials', 'cta'] },
      { path: '/work', title: 'Work', requiredSections: ['hero', 'portfolio'] },
      { path: '/services', title: 'Services', requiredSections: ['hero', 'services', 'pricing'] },
      { path: '/team', title: 'Team', requiredSections: ['hero', 'team'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact', 'cta'] },
    ],
    requiredIntegrations: ['email_capture', 'calendly'],
    ctaRules: { primary: 'Get a Quote', secondary: 'View Work' },
    forbiddenPhrases: ['add to cart', 'donate now', 'order food'],
    layoutSignature: 'agency-5page',
  },
  {
    id: 'freelancer_services',
    category: 'portfolio',
    goal: 'book',
    requiredPages: [
      { path: '/', title: 'Home', requiredSections: ['hero', 'services', 'portfolio', 'testimonials', 'cta'] },
      { path: '/services', title: 'Services', requiredSections: ['hero', 'services', 'pricing'] },
      { path: '/portfolio', title: 'Portfolio', requiredSections: ['hero', 'portfolio'] },
      { path: '/process', title: 'Process', requiredSections: ['hero', 'features', 'faq'] },
      { path: '/contact', title: 'Contact', requiredSections: ['contact', 'cta'] },
    ],
    requiredIntegrations: ['calendly', 'email_capture'],
    ctaRules: { primary: 'Book a Call', secondary: 'View Portfolio' },
    forbiddenPhrases: ['add to cart', 'donate', 'order online'],
    layoutSignature: 'freelancer-5page',
  },
];

export function selectArchetype(category: NicheCategory, goal: ConversionGoal): ConversionArchetype {
  // Find exact match first
  const exactMatch = CONVERSION_ARCHETYPES.find(a => a.category === category && a.goal === goal);
  if (exactMatch) return exactMatch;
  
  // Find category match
  const categoryMatch = CONVERSION_ARCHETYPES.find(a => a.category === category);
  if (categoryMatch) return categoryMatch;
  
  // Default fallback
  return CONVERSION_ARCHETYPES.find(a => a.id === 'service_quote_funnel')!;
}

export function getArchetypeById(id: string): ConversionArchetype | undefined {
  return CONVERSION_ARCHETYPES.find(a => a.id === id);
}

export function getArchetypesByCategory(category: NicheCategory): ConversionArchetype[] {
  return CONVERSION_ARCHETYPES.filter(a => a.category === category);
}
