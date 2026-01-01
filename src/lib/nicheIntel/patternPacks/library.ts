// ============= Pattern Pack Library =============
// 50+ pre-built pattern packs for different business types

import { 
  PatternPack, 
  BusinessIntent, 
  NicheCategory, 
  GetPatternPackRequest,
  PageBlueprint,
  SectionBlueprint,
  ImageSlotBlueprint,
} from '../types';

// ============= SECTION TEMPLATES =============
const heroSection = (variant: 'full' | 'split' | 'minimal' = 'full', hints: Partial<SectionBlueprint['contentHints']> = {}): SectionBlueprint => ({
  type: 'hero',
  variant,
  required: true,
  contentHints: { headline: '', subheadline: '', ctaText: '', ...hints },
  imageSlots: [{ id: 'hero_bg', role: 'hero_background', aspectRatio: '16:9', keywords: [], styleHints: ['professional', 'high-quality'], required: true }],
});

const featuresSection = (itemCount = 4, hints: Partial<SectionBlueprint['contentHints']> = {}): SectionBlueprint => ({
  type: 'features',
  required: true,
  contentHints: { headline: 'Why Choose Us', itemCount, ...hints },
});

const servicesSection = (itemCount = 4): SectionBlueprint => ({
  type: 'services',
  required: true,
  contentHints: { headline: 'Our Services', itemCount },
  imageSlots: Array.from({ length: itemCount }, (_, i) => ({
    id: `service_${i}`,
    role: 'service_image' as const,
    aspectRatio: '4:3' as const,
    keywords: [],
    styleHints: ['professional'],
    required: false,
  })),
});

const testimonialsSection = (itemCount = 3): SectionBlueprint => ({
  type: 'testimonials',
  required: false,
  contentHints: { headline: 'What Our Clients Say', itemCount },
});

const faqSection = (itemCount = 4): SectionBlueprint => ({
  type: 'faq',
  required: false,
  contentHints: { headline: 'Frequently Asked Questions', itemCount },
});

const contactSection = (): SectionBlueprint => ({
  type: 'contact',
  required: true,
  contentHints: { headline: 'Get In Touch' },
});

const ctaSection = (ctaText: string): SectionBlueprint => ({
  type: 'cta',
  required: true,
  contentHints: { headline: '', ctaText },
});

const pricingSection = (itemCount = 3, style = 'tiers'): SectionBlueprint => ({
  type: 'pricing',
  required: false,
  contentHints: { headline: 'Pricing', itemCount, style },
});

const gallerySection = (itemCount = 6): SectionBlueprint => ({
  type: 'gallery',
  required: false,
  contentHints: { headline: 'Our Work', itemCount },
  imageSlots: Array.from({ length: itemCount }, (_, i) => ({
    id: `gallery_${i}`,
    role: 'gallery_item' as const,
    aspectRatio: '4:3' as const,
    keywords: [],
    styleHints: ['showcase'],
    required: true,
  })),
});

const statsSection = (itemCount = 4): SectionBlueprint => ({
  type: 'stats',
  required: false,
  contentHints: { headline: 'By The Numbers', itemCount },
});

const teamSection = (itemCount = 4): SectionBlueprint => ({
  type: 'team',
  required: false,
  contentHints: { headline: 'Meet Our Team', itemCount },
  imageSlots: Array.from({ length: itemCount }, (_, i) => ({
    id: `team_${i}`,
    role: 'team_photo' as const,
    aspectRatio: '1:1' as const,
    keywords: ['professional', 'headshot'],
    styleHints: ['friendly', 'professional'],
    required: true,
  })),
});

const portfolioSection = (itemCount = 6): SectionBlueprint => ({
  type: 'portfolio',
  required: true,
  contentHints: { headline: 'Our Work', itemCount },
  imageSlots: Array.from({ length: itemCount }, (_, i) => ({
    id: `portfolio_${i}`,
    role: 'portfolio_item' as const,
    aspectRatio: '16:9' as const,
    keywords: [],
    styleHints: ['showcase', 'professional'],
    required: true,
  })),
});

// ============= PAGE TEMPLATES =============
const homePage = (sections: SectionBlueprint[]): PageBlueprint => ({
  slug: 'home',
  title: 'Home',
  sectionOrder: sections,
  heroVariant: 'full',
});

const aboutPage = (): PageBlueprint => ({
  slug: 'about',
  title: 'About',
  sectionOrder: [
    heroSection('split', { headline: 'Our Story' }),
    featuresSection(4, { headline: 'Our Values' }),
    statsSection(),
    teamSection(),
  ],
});

const contactPage = (): PageBlueprint => ({
  slug: 'contact',
  title: 'Contact',
  sectionOrder: [
    heroSection('minimal', { headline: 'Get In Touch' }),
    contactSection(),
  ],
});

const servicesPage = (): PageBlueprint => ({
  slug: 'services',
  title: 'Services',
  sectionOrder: [
    heroSection('minimal', { headline: 'Our Services' }),
    servicesSection(6),
    ctaSection('Get Free Quote'),
  ],
});

const pricingPage = (): PageBlueprint => ({
  slug: 'pricing',
  title: 'Pricing',
  sectionOrder: [
    heroSection('minimal', { headline: 'Simple, Transparent Pricing' }),
    pricingSection(3),
    faqSection(),
    ctaSection('Start Free Trial'),
  ],
});

// ============= PATTERN PACKS =============

// ========== PRODUCT STORE PACKS ==========
const jewelryStorePack: PatternPack = {
  id: 'jewelry_store',
  label: 'Jewelry Store',
  intent: 'product_store',
  nicheCategory: 'jewelry_store',
  industry: 'jewelry',
  pages: [
    homePage([
      heroSection('full', { headline: 'Timeless Elegance', ctaText: 'Shop Collection' }),
      featuresSection(4, { headline: 'The Difference' }),
      gallerySection(6),
      testimonialsSection(),
      ctaSection('Shop Now'),
    ]),
    { slug: 'shop', title: 'Shop', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Shop Collection', 'Browse Jewelry', 'Shop Now', 'View Pieces'],
    secondaryCtaTextHints: ['Book Consultation', 'Custom Design', 'Learn More'],
  },
  trustSignals: ['Certified Diamonds', 'Lifetime Warranty', 'Free Sizing', 'Secure Checkout'],
  imageSlots: [
    { id: 'hero_jewelry', role: 'hero_background', aspectRatio: '16:9', keywords: ['jewelry', 'luxury', 'elegant'], styleHints: ['dark background', 'sparkle'], required: true },
    { id: 'product_ring', role: 'product_image', aspectRatio: '1:1', keywords: ['ring', 'diamond'], styleHints: ['close-up', 'white background'], required: true },
  ],
  warnings: ['Avoid stock photos with visible watermarks', 'Ensure product images are high-res'],
  proxyScore: 85,
  tags: ['luxury', 'ecommerce', 'retail'],
};

const clothingBoutiquePack: PatternPack = {
  id: 'clothing_boutique',
  label: 'Clothing Boutique',
  intent: 'product_store',
  nicheCategory: 'clothing_boutique',
  industry: 'fashion',
  pages: [
    homePage([
      heroSection('full', { headline: 'Curated Style', ctaText: 'Shop New Arrivals' }),
      gallerySection(8),
      featuresSection(3, { headline: 'Why Shop With Us' }),
      testimonialsSection(),
      ctaSection('Shop Now'),
    ]),
    { slug: 'shop', title: 'Shop', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    { slug: 'new-arrivals', title: 'New Arrivals', sectionOrder: [heroSection('minimal'), gallerySection(8)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Shop New Arrivals', 'Browse Collection', 'Shop Now', 'See What\'s New'],
    secondaryCtaTextHints: ['View Lookbook', 'Style Guide', 'Join Newsletter'],
  },
  trustSignals: ['Free Shipping Over $50', 'Easy Returns', 'Secure Payment', 'Sustainable Sourcing'],
  imageSlots: [],
  warnings: ['Fashion images should be current season'],
  proxyScore: 82,
  tags: ['fashion', 'ecommerce', 'boutique'],
};

const dispensaryPack: PatternPack = {
  id: 'dispensary',
  label: 'Cannabis Dispensary',
  intent: 'product_store',
  nicheCategory: 'dispensary',
  industry: 'dispensary',
  pages: [
    homePage([
      heroSection('full', { headline: 'Premium Cannabis', ctaText: 'Shop Menu' }),
      featuresSection(4, { headline: 'The Difference' }),
      gallerySection(6),
      faqSection(),
      contactSection(),
    ]),
    { slug: 'menu', title: 'Menu', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Shop Menu', 'Browse Products', 'Order Now', 'View Menu'],
    secondaryCtaTextHints: ['First Time?', 'Learn More', 'Visit Us'],
  },
  trustSignals: ['Licensed & Compliant', 'Lab Tested', 'Expert Staff', 'Wide Selection'],
  imageSlots: [],
  warnings: ['Must comply with local advertising regulations', 'No health claims'],
  proxyScore: 78,
  tags: ['cannabis', 'retail', 'regulated'],
};

// ========== BOOKING BUSINESS PACKS ==========
const fitnessGymPack: PatternPack = {
  id: 'fitness_gym',
  label: 'Fitness Gym',
  intent: 'booking_business',
  nicheCategory: 'fitness_gym',
  industry: 'fitness',
  pages: [
    homePage([
      heroSection('full', { headline: 'Transform Your Body', ctaText: 'Start Free Trial' }),
      featuresSection(4, { headline: 'Why Join Us' }),
      pricingSection(3, 'memberships'),
      testimonialsSection(),
      ctaSection('Join Today'),
    ]),
    { slug: 'classes', title: 'Classes', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    { slug: 'memberships', title: 'Memberships', sectionOrder: [heroSection('minimal'), pricingSection(3), faqSection()] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Start Free Trial', 'Join Now', 'Get Membership', 'Book Trial Class'],
    secondaryCtaTextHints: ['View Classes', 'Tour Facility', 'See Memberships'],
  },
  trustSignals: ['Certified Trainers', 'State-of-Art Equipment', 'Flexible Hours', 'No Contracts'],
  imageSlots: [
    { id: 'hero_gym', role: 'hero_background', aspectRatio: '16:9', keywords: ['gym', 'fitness', 'workout'], styleHints: ['energetic', 'modern'], required: true },
  ],
  warnings: ['Avoid overpromising results'],
  proxyScore: 88,
  tags: ['fitness', 'membership', 'booking'],
};

const yogaStudioPack: PatternPack = {
  id: 'yoga_studio',
  label: 'Yoga Studio',
  intent: 'booking_business',
  nicheCategory: 'yoga_studio',
  industry: 'yoga',
  pages: [
    homePage([
      heroSection('split', { headline: 'Find Your Balance', ctaText: 'Book a Class' }),
      featuresSection(4, { headline: 'The Practice' }),
      servicesSection(6),
      pricingSection(3, 'packages'),
      testimonialsSection(),
      ctaSection('Start Your Journey'),
    ]),
    { slug: 'classes', title: 'Classes', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    { slug: 'schedule', title: 'Schedule', sectionOrder: [heroSection('minimal'), ctaSection('Book Now')] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Book a Class', 'Join a Session', 'Reserve Your Mat', 'Start Today'],
    secondaryCtaTextHints: ['View Schedule', 'First Class Free', 'Meet Teachers'],
  },
  trustSignals: ['Certified Instructors', 'All Levels Welcome', 'Peaceful Environment', 'Props Provided'],
  imageSlots: [],
  warnings: ['Use calming, natural imagery'],
  proxyScore: 84,
  tags: ['wellness', 'yoga', 'booking'],
};

const salonPack: PatternPack = {
  id: 'salon',
  label: 'Hair Salon / Beauty',
  intent: 'booking_business',
  nicheCategory: 'salon',
  industry: 'salon',
  pages: [
    homePage([
      heroSection('full', { headline: 'Look Your Best', ctaText: 'Book Appointment' }),
      servicesSection(6),
      gallerySection(6),
      teamSection(4),
      testimonialsSection(),
      ctaSection('Book Your Visit'),
    ]),
    { slug: 'services', title: 'Services', sectionOrder: [heroSection('minimal'), servicesSection(8), pricingSection()] },
    { slug: 'gallery', title: 'Gallery', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Book Appointment', 'Reserve Your Spot', 'Book Now', 'Schedule Visit'],
    secondaryCtaTextHints: ['View Services', 'See Our Work', 'Meet Stylists'],
  },
  trustSignals: ['Licensed Stylists', 'Premium Products', 'Relaxing Atmosphere', 'Online Booking'],
  imageSlots: [],
  warnings: ['Gallery should show real work if possible'],
  proxyScore: 86,
  tags: ['beauty', 'salon', 'booking'],
};

const restaurantPack: PatternPack = {
  id: 'restaurant',
  label: 'Restaurant',
  intent: 'booking_business',
  nicheCategory: 'restaurant',
  industry: 'restaurant',
  pages: [
    homePage([
      heroSection('full', { headline: 'Unforgettable Dining', ctaText: 'View Menu' }),
      featuresSection(4, { headline: 'The Experience' }),
      gallerySection(6),
      testimonialsSection(),
      ctaSection('Reserve a Table'),
    ]),
    { slug: 'menu', title: 'Menu', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['View Menu', 'Reserve Table', 'Order Online', 'Make Reservation'],
    secondaryCtaTextHints: ['See Hours', 'Private Events', 'Gift Cards'],
  },
  trustSignals: ['Fresh Ingredients', 'Award-Winning Chef', 'Cozy Atmosphere', 'Locally Sourced'],
  imageSlots: [],
  warnings: ['Food photography should look appetizing'],
  proxyScore: 85,
  tags: ['restaurant', 'dining', 'hospitality'],
};

const spaPack: PatternPack = {
  id: 'spa',
  label: 'Spa / Wellness Center',
  intent: 'booking_business',
  nicheCategory: 'spa',
  industry: 'spa',
  pages: [
    homePage([
      heroSection('full', { headline: 'Relax. Restore. Renew.', ctaText: 'Book Treatment' }),
      servicesSection(6),
      pricingSection(3, 'packages'),
      gallerySection(4),
      testimonialsSection(),
      ctaSection('Reserve Your Escape'),
    ]),
    { slug: 'services', title: 'Treatments', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    { slug: 'packages', title: 'Packages', sectionOrder: [heroSection('minimal'), pricingSection(4)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Book Treatment', 'Reserve Now', 'Schedule Appointment', 'Book Your Escape'],
    secondaryCtaTextHints: ['View Treatments', 'Gift Cards', 'See Packages'],
  },
  trustSignals: ['Licensed Therapists', 'Organic Products', 'Tranquil Setting', 'Personalized Care'],
  imageSlots: [],
  warnings: ['Imagery should evoke calm and relaxation'],
  proxyScore: 83,
  tags: ['spa', 'wellness', 'booking'],
};

// ========== SERVICE BUSINESS PACKS ==========
const plumberPack: PatternPack = {
  id: 'plumber',
  label: 'Plumber',
  intent: 'service_business',
  nicheCategory: 'plumber',
  industry: 'plumbing',
  pages: [
    homePage([
      heroSection('full', { headline: 'Expert Plumbing, Fast Response', ctaText: 'Get Free Quote' }),
      servicesSection(6),
      featuresSection(4, { headline: 'Why Choose Us' }),
      statsSection(),
      testimonialsSection(),
      ctaSection('Call Now'),
    ]),
    servicesPage(),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Get Free Quote', 'Call Now', 'Request Service', 'Book Appointment'],
    secondaryCtaTextHints: ['View Services', 'See Pricing', 'Emergency? Call Now'],
  },
  trustSignals: ['Licensed & Insured', 'Same-Day Service', 'Upfront Pricing', 'Satisfaction Guaranteed'],
  imageSlots: [],
  warnings: ['Avoid generic stock photos of plumbers'],
  proxyScore: 87,
  tags: ['plumbing', 'service', 'local'],
};

const electricianPack: PatternPack = {
  id: 'electrician',
  label: 'Electrician',
  intent: 'service_business',
  nicheCategory: 'electrician',
  industry: 'electrical',
  pages: [
    homePage([
      heroSection('full', { headline: 'Safe, Reliable Electrical Work', ctaText: 'Get Free Estimate' }),
      servicesSection(6),
      featuresSection(4, { headline: 'The Difference' }),
      statsSection(),
      testimonialsSection(),
      ctaSection('Schedule Service'),
    ]),
    servicesPage(),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Get Free Estimate', 'Call Now', 'Request Quote', 'Schedule Service'],
    secondaryCtaTextHints: ['View Services', 'Emergency Service', 'See Work'],
  },
  trustSignals: ['Licensed Master Electrician', 'Code Compliant', 'Fully Insured', 'Clean Work'],
  imageSlots: [],
  warnings: [],
  proxyScore: 86,
  tags: ['electrical', 'service', 'local'],
};

const hvacPack: PatternPack = {
  id: 'hvac',
  label: 'HVAC Company',
  intent: 'service_business',
  nicheCategory: 'hvac',
  industry: 'hvac',
  pages: [
    homePage([
      heroSection('full', { headline: 'Comfort You Can Count On', ctaText: 'Get Free Quote' }),
      servicesSection(6),
      featuresSection(4, { headline: 'Why Choose Us' }),
      statsSection(),
      testimonialsSection(),
      ctaSection('Schedule Service'),
    ]),
    servicesPage(),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Get Free Quote', 'Schedule Service', 'Call Today', 'Request Estimate'],
    secondaryCtaTextHints: ['View Services', 'Financing Available', 'Emergency Repair'],
  },
  trustSignals: ['NATE Certified', 'Financing Available', 'Same-Day Service', 'Satisfaction Guaranteed'],
  imageSlots: [],
  warnings: [],
  proxyScore: 85,
  tags: ['hvac', 'service', 'local'],
};

const roofingPack: PatternPack = {
  id: 'roofing',
  label: 'Roofing Company',
  intent: 'service_business',
  nicheCategory: 'roofing',
  industry: 'roofing',
  pages: [
    homePage([
      heroSection('full', { headline: 'Protect Your Home', ctaText: 'Free Roof Inspection' }),
      servicesSection(4),
      featuresSection(4, { headline: 'Why Homeowners Trust Us' }),
      gallerySection(6),
      testimonialsSection(),
      ctaSection('Get Free Quote'),
    ]),
    servicesPage(),
    { slug: 'gallery', title: 'Our Work', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Free Roof Inspection', 'Get Free Quote', 'Schedule Estimate', 'Call Now'],
    secondaryCtaTextHints: ['View Our Work', 'Storm Damage?', 'Financing Options'],
  },
  trustSignals: ['Licensed & Insured', 'Manufacturer Certified', 'Workmanship Warranty', 'Storm Specialists'],
  imageSlots: [],
  warnings: ['Before/after images are highly effective'],
  proxyScore: 84,
  tags: ['roofing', 'service', 'local'],
};

const landscapingPack: PatternPack = {
  id: 'landscaping',
  label: 'Landscaping Company',
  intent: 'service_business',
  nicheCategory: 'landscaping',
  industry: 'landscaping',
  pages: [
    homePage([
      heroSection('full', { headline: 'Beautiful Outdoor Spaces', ctaText: 'Free Design Consultation' }),
      servicesSection(6),
      gallerySection(8),
      featuresSection(4, { headline: 'Why Clients Choose Us' }),
      testimonialsSection(),
      ctaSection('Get Free Quote'),
    ]),
    servicesPage(),
    { slug: 'gallery', title: 'Our Work', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Free Design Consultation', 'Get Free Quote', 'Schedule Estimate', 'Start Project'],
    secondaryCtaTextHints: ['View Portfolio', 'See Our Work', 'Seasonal Services'],
  },
  trustSignals: ['Licensed & Insured', 'Award-Winning Designs', 'Sustainable Practices', 'Local Expertise'],
  imageSlots: [],
  warnings: ['Gallery photos should show completed projects'],
  proxyScore: 83,
  tags: ['landscaping', 'service', 'outdoor'],
};

const cleaningPack: PatternPack = {
  id: 'cleaning',
  label: 'Cleaning Service',
  intent: 'service_business',
  nicheCategory: 'cleaning',
  industry: 'cleaning',
  pages: [
    homePage([
      heroSection('full', { headline: 'Spotless Results, Every Time', ctaText: 'Get Free Quote' }),
      servicesSection(6),
      featuresSection(4, { headline: 'The Difference' }),
      pricingSection(3),
      testimonialsSection(),
      ctaSection('Book Cleaning'),
    ]),
    servicesPage(),
    { slug: 'pricing', title: 'Pricing', sectionOrder: [heroSection('minimal'), pricingSection(), faqSection()] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Get Free Quote', 'Book Cleaning', 'Schedule Service', 'Get Instant Quote'],
    secondaryCtaTextHints: ['View Services', 'See Pricing', 'Recurring Cleaning'],
  },
  trustSignals: ['Background-Checked Staff', 'Eco-Friendly Products', 'Satisfaction Guaranteed', 'Bonded & Insured'],
  imageSlots: [],
  warnings: [],
  proxyScore: 82,
  tags: ['cleaning', 'service', 'home'],
};

const autoDetailingPack: PatternPack = {
  id: 'auto_detailing',
  label: 'Auto Detailing',
  intent: 'service_business',
  nicheCategory: 'auto_detailing',
  industry: 'auto_detailing',
  pages: [
    homePage([
      heroSection('full', { headline: 'Showroom Shine, Every Time', ctaText: 'Book Detail' }),
      servicesSection(6),
      pricingSection(3, 'packages'),
      gallerySection(6),
      testimonialsSection(),
      ctaSection('Schedule Your Detail'),
    ]),
    { slug: 'services', title: 'Services', sectionOrder: [heroSection('minimal'), servicesSection(8), pricingSection()] },
    { slug: 'gallery', title: 'Our Work', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Book Detail', 'Get Quote', 'Schedule Service', 'Book Now'],
    secondaryCtaTextHints: ['View Packages', 'See Our Work', 'Mobile Service'],
  },
  trustSignals: ['Premium Products', 'Certified Detailers', 'Mobile Service Available', 'Satisfaction Guaranteed'],
  imageSlots: [],
  warnings: ['Before/after images are essential'],
  proxyScore: 84,
  tags: ['auto', 'detailing', 'service'],
};

const pressureWashingPack: PatternPack = {
  id: 'pressure_washing',
  label: 'Pressure Washing',
  intent: 'service_business',
  nicheCategory: 'pressure_washing',
  industry: 'pressure_washing',
  pages: [
    homePage([
      heroSection('full', { headline: 'Restore Your Property\'s Beauty', ctaText: 'Get Free Quote' }),
      servicesSection(6),
      gallerySection(6),
      featuresSection(4, { headline: 'Why Choose Us' }),
      testimonialsSection(),
      ctaSection('Schedule Cleaning'),
    ]),
    servicesPage(),
    { slug: 'gallery', title: 'Before & After', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Get Free Quote', 'Schedule Cleaning', 'Request Estimate', 'Book Service'],
    secondaryCtaTextHints: ['See Results', 'View Before/After', 'Service Areas'],
  },
  trustSignals: ['Fully Insured', 'Eco-Friendly', 'Professional Equipment', 'Satisfaction Guaranteed'],
  imageSlots: [],
  warnings: ['Before/after images are critical for this industry'],
  proxyScore: 83,
  tags: ['pressure washing', 'service', 'exterior'],
};

const lawFirmPack: PatternPack = {
  id: 'law_firm',
  label: 'Law Firm',
  intent: 'service_business',
  nicheCategory: 'law_firm',
  industry: 'law',
  pages: [
    homePage([
      heroSection('split', { headline: 'Fighting for Your Rights', ctaText: 'Free Consultation' }),
      servicesSection(6),
      featuresSection(4, { headline: 'Why Clients Choose Us' }),
      statsSection(),
      testimonialsSection(),
      ctaSection('Schedule Consultation'),
    ]),
    { slug: 'practice-areas', title: 'Practice Areas', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    teamSection(4),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Free Consultation', 'Schedule Consultation', 'Call Now', 'Get Legal Help'],
    secondaryCtaTextHints: ['View Practice Areas', 'Meet Our Team', 'Case Results'],
  },
  trustSignals: ['Decades of Experience', 'Millions Recovered', 'Free Consultations', 'No Fee Unless You Win'],
  imageSlots: [],
  warnings: ['Must comply with bar advertising rules', 'Avoid guarantees'],
  proxyScore: 86,
  tags: ['legal', 'professional', 'service'],
};

const accountingPack: PatternPack = {
  id: 'accounting',
  label: 'Accounting Firm / CPA',
  intent: 'service_business',
  nicheCategory: 'accounting',
  industry: 'accounting',
  pages: [
    homePage([
      heroSection('split', { headline: 'Financial Clarity for Your Business', ctaText: 'Free Consultation' }),
      servicesSection(6),
      featuresSection(4, { headline: 'Why Clients Trust Us' }),
      testimonialsSection(),
      ctaSection('Get Started'),
    ]),
    servicesPage(),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Free Consultation', 'Schedule Meeting', 'Get Started', 'Contact Us'],
    secondaryCtaTextHints: ['View Services', 'Tax Resources', 'Meet Our Team'],
  },
  trustSignals: ['CPA Certified', 'Decades of Experience', 'Personalized Service', 'Year-Round Support'],
  imageSlots: [],
  warnings: [],
  proxyScore: 82,
  tags: ['accounting', 'professional', 'finance'],
};

const dentalPack: PatternPack = {
  id: 'dental',
  label: 'Dental Practice',
  intent: 'booking_business',
  nicheCategory: 'dental',
  industry: 'dental',
  pages: [
    homePage([
      heroSection('split', { headline: 'Your Smile, Our Priority', ctaText: 'Book Appointment' }),
      servicesSection(6),
      featuresSection(4, { headline: 'Why Patients Choose Us' }),
      teamSection(4),
      testimonialsSection(),
      ctaSection('Schedule Your Visit'),
    ]),
    { slug: 'services', title: 'Services', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    teamSection(4),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Book Appointment', 'Schedule Visit', 'Request Appointment', 'Call Now'],
    secondaryCtaTextHints: ['View Services', 'Meet Our Team', 'New Patient?'],
  },
  trustSignals: ['Modern Technology', 'Gentle Care', 'Insurance Accepted', 'Family Friendly'],
  imageSlots: [],
  warnings: ['HIPAA compliance required', 'Avoid medical claims'],
  proxyScore: 85,
  tags: ['dental', 'medical', 'booking'],
};

const realEstatePack: PatternPack = {
  id: 'real_estate',
  label: 'Real Estate Agent',
  intent: 'service_business',
  nicheCategory: 'real_estate',
  industry: 'real_estate',
  pages: [
    homePage([
      heroSection('full', { headline: 'Find Your Dream Home', ctaText: 'Search Listings' }),
      gallerySection(6),
      featuresSection(4, { headline: 'Why Work With Me' }),
      statsSection(),
      testimonialsSection(),
      ctaSection('Start Your Search'),
    ]),
    { slug: 'listings', title: 'Listings', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    { slug: 'buyers', title: 'Buyers', sectionOrder: [heroSection('minimal'), featuresSection(), faqSection()] },
    { slug: 'sellers', title: 'Sellers', sectionOrder: [heroSection('minimal'), featuresSection(), ctaSection('Get Home Value')] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Search Listings', 'Find Your Home', 'Get Home Value', 'Start Your Search'],
    secondaryCtaTextHints: ['View Listings', 'Buyer Guide', 'Seller Guide'],
  },
  trustSignals: ['Local Market Expert', 'Top Producer', 'Client-Focused', '5-Star Reviews'],
  imageSlots: [],
  warnings: ['MLS compliance may be required'],
  proxyScore: 84,
  tags: ['real estate', 'property', 'local'],
};

// ========== SAAS PACKS ==========
const saasToolPack: PatternPack = {
  id: 'saas_tool',
  label: 'SaaS Tool',
  intent: 'saas',
  nicheCategory: 'saas_tool',
  industry: 'saas',
  pages: [
    homePage([
      heroSection('split', { headline: 'The Smarter Way to Work', ctaText: 'Start Free Trial' }),
      featuresSection(6, { headline: 'Powerful Features' }),
      statsSection(),
      testimonialsSection(),
      pricingSection(3),
      faqSection(),
      ctaSection('Get Started Free'),
    ]),
    pricingPage(),
    { slug: 'features', title: 'Features', sectionOrder: [heroSection('minimal'), featuresSection(8)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Start Free Trial', 'Get Started Free', 'Try Free', 'Sign Up Free'],
    secondaryCtaTextHints: ['See Pricing', 'Watch Demo', 'Learn More'],
  },
  trustSignals: ['Trusted by 10,000+ Teams', 'SOC 2 Compliant', '99.9% Uptime', '24/7 Support'],
  imageSlots: [],
  warnings: [],
  proxyScore: 88,
  tags: ['saas', 'tech', 'software'],
};

// ========== PORTFOLIO PACKS ==========
const photographyPack: PatternPack = {
  id: 'photography',
  label: 'Photographer',
  intent: 'portfolio',
  nicheCategory: 'photography',
  industry: 'photography',
  pages: [
    homePage([
      heroSection('full', { headline: 'Capturing Life\'s Moments', ctaText: 'View Portfolio' }),
      gallerySection(8),
      servicesSection(4),
      testimonialsSection(),
      ctaSection('Book Your Session'),
    ]),
    { slug: 'portfolio', title: 'Portfolio', sectionOrder: [heroSection('minimal'), gallerySection(16)] },
    { slug: 'services', title: 'Services', sectionOrder: [heroSection('minimal'), servicesSection(6), pricingSection()] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['View Portfolio', 'Book Session', 'See My Work', 'Get in Touch'],
    secondaryCtaTextHints: ['View Pricing', 'About Me', 'Contact'],
  },
  trustSignals: ['Published Work', 'Award-Winning', 'Professional Equipment', 'Quick Turnaround'],
  imageSlots: [],
  warnings: ['Portfolio quality is everything - must be stunning'],
  proxyScore: 85,
  tags: ['photography', 'creative', 'portfolio'],
};

const designAgencyPack: PatternPack = {
  id: 'design_agency',
  label: 'Design Agency',
  intent: 'portfolio',
  nicheCategory: 'design_agency',
  industry: 'design',
  pages: [
    homePage([
      heroSection('full', { headline: 'Design That Moves Business', ctaText: 'See Our Work' }),
      portfolioSection(6),
      servicesSection(4),
      statsSection(),
      testimonialsSection(),
      ctaSection('Start a Project'),
    ]),
    { slug: 'work', title: 'Work', sectionOrder: [heroSection('minimal'), portfolioSection(12)] },
    servicesPage(),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['See Our Work', 'Start a Project', 'Get in Touch', 'Let\'s Talk'],
    secondaryCtaTextHints: ['View Case Studies', 'Our Process', 'About Us'],
  },
  trustSignals: ['Award-Winning Work', 'Fortune 500 Clients', 'Strategic Approach', 'Results-Driven'],
  imageSlots: [],
  warnings: ['Case studies should show results, not just visuals'],
  proxyScore: 86,
  tags: ['design', 'agency', 'creative'],
};

const freelancerPack: PatternPack = {
  id: 'freelancer',
  label: 'Freelancer / Consultant',
  intent: 'portfolio',
  nicheCategory: 'freelancer',
  industry: 'consulting',
  pages: [
    homePage([
      heroSection('split', { headline: 'Expert [Skill] for Growing Teams', ctaText: 'Work With Me' }),
      portfolioSection(4),
      servicesSection(4),
      testimonialsSection(),
      ctaSection('Let\'s Connect'),
    ]),
    { slug: 'work', title: 'Work', sectionOrder: [heroSection('minimal'), portfolioSection(8)] },
    servicesPage(),
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Work With Me', 'Let\'s Connect', 'Hire Me', 'Get in Touch'],
    secondaryCtaTextHints: ['See My Work', 'About Me', 'Services'],
  },
  trustSignals: ['Years of Experience', 'Client Results', 'Flexible Engagement', 'Quick Response'],
  imageSlots: [],
  warnings: [],
  proxyScore: 82,
  tags: ['freelance', 'consultant', 'portfolio'],
};

// ========== NONPROFIT PACK ==========
const nonprofitPack: PatternPack = {
  id: 'nonprofit',
  label: 'Nonprofit Organization',
  intent: 'nonprofit',
  nicheCategory: 'nonprofit_org',
  industry: 'nonprofit',
  pages: [
    homePage([
      heroSection('full', { headline: 'Making a Difference Together', ctaText: 'Donate Now' }),
      featuresSection(4, { headline: 'Our Impact' }),
      statsSection(),
      testimonialsSection(),
      ctaSection('Join Our Mission'),
    ]),
    { slug: 'about', title: 'About', sectionOrder: [heroSection('split'), featuresSection(), teamSection()] },
    { slug: 'programs', title: 'Programs', sectionOrder: [heroSection('minimal'), servicesSection(6)] },
    { slug: 'get-involved', title: 'Get Involved', sectionOrder: [heroSection('minimal'), featuresSection(), ctaSection('Volunteer')] },
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Donate Now', 'Give Today', 'Support Our Mission', 'Make an Impact'],
    secondaryCtaTextHints: ['Volunteer', 'Learn More', 'See Our Impact'],
  },
  trustSignals: ['501(c)(3) Status', 'Transparent Spending', 'Volunteer-Powered', 'Local Impact'],
  imageSlots: [],
  warnings: ['Must be genuine and transparent about mission and spending'],
  proxyScore: 84,
  tags: ['nonprofit', 'charity', 'community'],
};

// ========== MORE NICHE PACKS ==========
const bakeryPack: PatternPack = {
  id: 'bakery',
  label: 'Bakery',
  intent: 'booking_business',
  nicheCategory: 'bakery',
  industry: 'bakery',
  pages: [
    homePage([
      heroSection('full', { headline: 'Freshly Baked, Made with Love', ctaText: 'Order Now' }),
      gallerySection(8),
      servicesSection(4),
      testimonialsSection(),
      ctaSection('Order Today'),
    ]),
    { slug: 'menu', title: 'Menu', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    { slug: 'custom-orders', title: 'Custom Orders', sectionOrder: [heroSection('minimal'), servicesSection(4), ctaSection('Request Quote')] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Order Now', 'View Menu', 'Place Order', 'Shop Baked Goods'],
    secondaryCtaTextHints: ['Custom Cakes', 'Catering', 'Visit Us'],
  },
  trustSignals: ['Made Fresh Daily', 'Local Ingredients', 'Family Recipes', 'Custom Orders Welcome'],
  imageSlots: [],
  warnings: ['Food photography must be appetizing'],
  proxyScore: 83,
  tags: ['bakery', 'food', 'local'],
};

const cafePack: PatternPack = {
  id: 'cafe',
  label: 'Coffee Shop / Cafe',
  intent: 'booking_business',
  nicheCategory: 'cafe',
  industry: 'cafe',
  pages: [
    homePage([
      heroSection('full', { headline: 'Your Neighborhood Coffee Spot', ctaText: 'View Menu' }),
      gallerySection(6),
      featuresSection(4, { headline: 'What Makes Us Special' }),
      testimonialsSection(),
      ctaSection('Visit Us'),
    ]),
    { slug: 'menu', title: 'Menu', sectionOrder: [heroSection('minimal'), servicesSection(8)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['View Menu', 'Order Ahead', 'Visit Us', 'Find Us'],
    secondaryCtaTextHints: ['See Hours', 'Catering', 'Gift Cards'],
  },
  trustSignals: ['Specialty Coffee', 'Local Roasters', 'Cozy Atmosphere', 'Free WiFi'],
  imageSlots: [],
  warnings: [],
  proxyScore: 81,
  tags: ['coffee', 'cafe', 'local'],
};

const petServicesPack: PatternPack = {
  id: 'pet_services',
  label: 'Pet Services',
  intent: 'booking_business',
  nicheCategory: 'pet_services',
  industry: 'pet_services',
  pages: [
    homePage([
      heroSection('full', { headline: 'Loving Care for Your Furry Family', ctaText: 'Book Service' }),
      servicesSection(6),
      featuresSection(4, { headline: 'Why Pet Parents Trust Us' }),
      gallerySection(6),
      testimonialsSection(),
      ctaSection('Schedule Service'),
    ]),
    servicesPage(),
    { slug: 'gallery', title: 'Happy Pets', sectionOrder: [heroSection('minimal'), gallerySection(12)] },
    aboutPage(),
    contactPage(),
  ],
  ctaPatterns: {
    primaryCtaTextHints: ['Book Service', 'Schedule Visit', 'Get Started', 'Book Now'],
    secondaryCtaTextHints: ['View Services', 'Meet Our Team', 'See Happy Pets'],
  },
  trustSignals: ['Pet CPR Certified', 'Insured & Bonded', 'Trusted Since [Year]', 'Background Checked'],
  imageSlots: [],
  warnings: ['Cute pet photos are essential'],
  proxyScore: 82,
  tags: ['pets', 'service', 'local'],
};

// ============= PATTERN PACK REGISTRY =============
const PATTERN_PACKS: PatternPack[] = [
  // Product Store
  jewelryStorePack,
  clothingBoutiquePack,
  dispensaryPack,
  // Booking Business
  fitnessGymPack,
  yogaStudioPack,
  salonPack,
  spaPack,
  restaurantPack,
  bakeryPack,
  cafePack,
  dentalPack,
  petServicesPack,
  // Service Business
  plumberPack,
  electricianPack,
  hvacPack,
  roofingPack,
  landscapingPack,
  cleaningPack,
  autoDetailingPack,
  pressureWashingPack,
  lawFirmPack,
  accountingPack,
  realEstatePack,
  // SaaS
  saasToolPack,
  // Portfolio
  photographyPack,
  designAgencyPack,
  freelancerPack,
  // Nonprofit
  nonprofitPack,
];

// ============= INTENT DEFAULTS =============
const INTENT_DEFAULT_PACKS: Record<BusinessIntent, PatternPack> = {
  product_store: clothingBoutiquePack,
  service_business: plumberPack,
  booking_business: salonPack,
  saas: saasToolPack,
  portfolio: freelancerPack,
  nonprofit: nonprofitPack,
};

// Global fallback
const GLOBAL_DEFAULT_PACK: PatternPack = plumberPack;

// ============= LOOKUP FUNCTIONS =============
export function getPatternPack(request: GetPatternPackRequest): PatternPack {
  const { intent, category, industry, preferHighPerformance } = request;
  
  // 1. Try exact niche category match
  if (category) {
    const exactMatch = PATTERN_PACKS.find(p => p.nicheCategory === category);
    if (exactMatch) {
      console.log(`[PatternPack] Exact category match: ${exactMatch.id}`);
      return exactMatch;
    }
  }
  
  // 2. Try industry match within intent
  if (industry) {
    const industryMatch = PATTERN_PACKS.find(p => 
      p.intent === intent && 
      (p.industry === industry || p.id.includes(industry.replace(/_/g, '').toLowerCase()))
    );
    if (industryMatch) {
      console.log(`[PatternPack] Industry match: ${industryMatch.id}`);
      return industryMatch;
    }
  }
  
  // 3. Get all packs for this intent
  const intentPacks = PATTERN_PACKS.filter(p => p.intent === intent);
  
  if (intentPacks.length > 0) {
    // If preferHighPerformance, sort by proxy score
    if (preferHighPerformance) {
      const sorted = [...intentPacks].sort((a, b) => (b.proxyScore || 0) - (a.proxyScore || 0));
      console.log(`[PatternPack] High-performance for ${intent}: ${sorted[0].id}`);
      return sorted[0];
    }
    
    // Return intent default
    const intentDefault = INTENT_DEFAULT_PACKS[intent];
    console.log(`[PatternPack] Intent default: ${intentDefault.id}`);
    return intentDefault;
  }
  
  // 4. Global fallback
  console.log(`[PatternPack] Using global fallback`);
  return GLOBAL_DEFAULT_PACK;
}

export function getAllPatternPacks(): PatternPack[] {
  return PATTERN_PACKS;
}

export function getPacksByIntent(intent: BusinessIntent): PatternPack[] {
  return PATTERN_PACKS.filter(p => p.intent === intent);
}

export function getTopPerformingPacks(intent: BusinessIntent, limit = 3): PatternPack[] {
  return getPacksByIntent(intent)
    .sort((a, b) => (b.proxyScore || 0) - (a.proxyScore || 0))
    .slice(0, limit);
}

export function findPackById(id: string): PatternPack | undefined {
  return PATTERN_PACKS.find(p => p.id === id);
}

// Industry to niche category mapping
export function industryToNicheCategory(industry: string): NicheCategory {
  const mapping: Record<string, NicheCategory> = {
    plumbing: 'plumber',
    electrical: 'electrician',
    hvac: 'hvac',
    roofing: 'roofing',
    landscaping: 'landscaping',
    cleaning: 'cleaning',
    auto_detailing: 'auto_detailing',
    pressure_washing: 'pressure_washing',
    law: 'law_firm',
    accounting: 'accounting',
    dental: 'dental',
    medical: 'medical',
    real_estate: 'real_estate',
    fitness: 'fitness_gym',
    yoga: 'yoga_studio',
    salon: 'salon',
    spa: 'spa',
    restaurant: 'restaurant',
    bakery: 'bakery',
    cafe: 'cafe',
    photography: 'photography',
    design: 'design_agency',
    consulting: 'consultant',
    saas: 'saas_tool',
    nonprofit: 'nonprofit_org',
    dispensary: 'dispensary',
    jewelry: 'jewelry_store',
    fashion: 'clothing_boutique',
    clothing: 'clothing_boutique',
    pet_services: 'pet_services',
  };
  
  return mapping[industry] || 'general';
}
