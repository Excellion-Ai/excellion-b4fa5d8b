// ============= Site Plan Generator =============
// Generates page structure and sections based on BusinessBrief

import { BusinessBrief, PageRequirement, SitePlan } from './types';

// Industry-specific hero content templates
const INDUSTRY_HERO_TEMPLATES: Record<string, Record<string, { headline: string; subheadline: string }>> = {
  'pressure_washing': {
    '/': { headline: 'Professional Pressure Washing Services', subheadline: 'We blast away years of grime and restore your property to like-new condition.' },
    '/services': { headline: 'Our Cleaning Services', subheadline: 'From driveways to decks, we have the right solution for every surface.' },
    '/about': { headline: 'Our Story', subheadline: 'Family-owned and dedicated to making your property shine.' },
    '/contact': { headline: 'Get Your Free Quote', subheadline: 'Request an estimate and we\'ll respond within 24 hours.' },
  },
  'plumbing': {
    '/': { headline: 'Trusted Plumbing Experts', subheadline: 'Fast, reliable plumbing service when you need it most.' },
    '/services': { headline: 'Our Plumbing Services', subheadline: 'From repairs to installations, we handle it all.' },
    '/about': { headline: 'Meet Our Team', subheadline: 'Licensed, insured, and committed to quality work.' },
    '/contact': { headline: 'Need a Plumber?', subheadline: 'Call us now for same-day service.' },
  },
  'auto_detailing': {
    '/': { headline: 'Showroom Shine, Every Time', subheadline: 'Professional auto detailing that makes your car look brand new.' },
    '/services': { headline: 'Our Detailing Packages', subheadline: 'Choose from basic wash to full paint correction.' },
    '/about': { headline: 'About Us', subheadline: 'Car enthusiasts dedicated to perfection.' },
    '/contact': { headline: 'Book Your Detail', subheadline: 'Schedule your appointment online or give us a call.' },
  },
  'restaurant': {
    '/': { headline: 'Fresh Flavors, Made With Love', subheadline: 'Experience cuisine crafted from the finest ingredients.' },
    '/menu': { headline: 'Our Menu', subheadline: 'Discover our carefully crafted dishes and seasonal specials.' },
    '/about': { headline: 'Our Story', subheadline: 'A passion for food that spans generations.' },
    '/contact': { headline: 'Visit Us', subheadline: 'Make a reservation or order for pickup.' },
  },
  'bakery': {
    '/': { headline: 'Freshly Baked, Made Daily', subheadline: 'Artisan breads, pastries, and custom cakes baked with love.' },
    '/menu': { headline: 'Our Baked Goods', subheadline: 'From crusty loaves to sweet treats.' },
    '/about': { headline: 'Our Bakery Story', subheadline: 'Family recipes passed down through generations.' },
    '/contact': { headline: 'Order Today', subheadline: 'Place your order for pickup or custom cakes.' },
  },
  'law_firm': {
    '/': { headline: 'Experienced Legal Representation', subheadline: 'Fighting for your rights with dedication and expertise.' },
    '/services': { headline: 'Practice Areas', subheadline: 'Comprehensive legal services tailored to your needs.' },
    '/about': { headline: 'Our Attorneys', subheadline: 'Decades of combined experience and proven results.' },
    '/contact': { headline: 'Schedule a Consultation', subheadline: 'Free case evaluation. Let\'s discuss your options.' },
  },
  'dental': {
    '/': { headline: 'Your Smile, Our Priority', subheadline: 'Comprehensive dental care for the whole family.' },
    '/services': { headline: 'Dental Services', subheadline: 'From routine cleanings to cosmetic transformations.' },
    '/about': { headline: 'Meet Our Team', subheadline: 'Caring professionals dedicated to your comfort.' },
    '/contact': { headline: 'Book Your Appointment', subheadline: 'New patients welcome. Call or schedule online.' },
  },
  'salon': {
    '/': { headline: 'Look & Feel Your Best', subheadline: 'Expert stylists creating looks you\'ll love.' },
    '/services': { headline: 'Our Services', subheadline: 'From cuts and color to treatments and styling.' },
    '/about': { headline: 'Meet Our Stylists', subheadline: 'Passionate professionals who love what they do.' },
    '/contact': { headline: 'Book Your Appointment', subheadline: 'Walk-ins welcome or schedule your visit.' },
  },
  'yoga_fitness': {
    '/': { headline: 'Transform Your Body & Mind', subheadline: 'Find your strength with classes for all levels.' },
    '/services': { headline: 'Our Classes', subheadline: 'Yoga, fitness, and wellness programs designed for you.' },
    '/about': { headline: 'Our Studio', subheadline: 'A welcoming space for your wellness journey.' },
    '/contact': { headline: 'Start Your Journey', subheadline: 'Sign up for a class or try a free session.' },
  },
  'lighter_shop': {
    '/': { headline: 'Premium Lighters & Collectibles', subheadline: 'Curated collection of the world\'s finest lighters.' },
    '/shop': { headline: 'Browse Our Collection', subheadline: 'From everyday essentials to rare collector pieces.' },
    '/about': { headline: 'Our Passion', subheadline: 'Decades of expertise in fine lighters and accessories.' },
    '/contact': { headline: 'Visit Our Store', subheadline: 'Get directions or contact us with questions.' },
  },
  'dispensary': {
    '/': { headline: 'Premium Cannabis Products', subheadline: 'Quality flower, edibles, and concentrates.' },
    '/menu': { headline: 'Our Menu', subheadline: 'Browse our full selection of products.' },
    '/about': { headline: 'About Us', subheadline: 'Committed to quality, safety, and education.' },
    '/contact': { headline: 'Visit Us', subheadline: 'Must be 21+ with valid ID.' },
  },
  'saas': {
    '/': { headline: 'The Smarter Way to Work', subheadline: 'Powerful tools that help your team do more.' },
    '/features': { headline: 'Platform Features', subheadline: 'Built for modern teams and workflows.' },
    '/pricing': { headline: 'Simple Pricing', subheadline: 'Plans that grow with your business.' },
    '/contact': { headline: 'Get in Touch', subheadline: 'Questions? We\'re here to help.' },
  },
  'photography': {
    '/': { headline: 'Capturing Your Special Moments', subheadline: 'Professional photography that tells your story.' },
    '/portfolio': { headline: 'Our Work', subheadline: 'Browse our recent projects and galleries.' },
    '/about': { headline: 'Meet the Photographer', subheadline: 'Passionate about capturing life\'s moments.' },
    '/contact': { headline: 'Book a Session', subheadline: 'Let\'s create something beautiful together.' },
  },
  'nonprofit': {
    '/': { headline: 'Making a Difference Together', subheadline: 'Join us in creating positive change in our community.' },
    '/programs': { headline: 'Our Programs', subheadline: 'Learn about the work we do.' },
    '/about': { headline: 'Our Mission', subheadline: 'Who we are and why we do what we do.' },
    '/contact': { headline: 'Get Involved', subheadline: 'Volunteer, donate, or partner with us.' },
  },
};

// Default hero templates for any industry
const DEFAULT_HERO_TEMPLATES: Record<string, { headline: string; subheadline: string }> = {
  '/': { headline: 'Quality Service You Can Trust', subheadline: 'Dedicated to exceeding your expectations.' },
  '/services': { headline: 'What We Offer', subheadline: 'Comprehensive solutions tailored to your needs.' },
  '/about': { headline: 'About Us', subheadline: 'Our story, our team, our commitment.' },
  '/contact': { headline: 'Get in Touch', subheadline: 'We\'d love to hear from you.' },
};

// Section requirements by page type
const PAGE_SECTIONS: Record<string, string[]> = {
  'home': ['hero', 'features', 'testimonials', 'cta'],
  'services': ['hero', 'services', 'cta'],
  'menu': ['hero', 'gallery', 'cta'],
  'shop': ['hero', 'gallery', 'cta'],
  'portfolio': ['hero', 'portfolio', 'cta'],
  'about': ['hero', 'team', 'stats'],
  'contact': ['hero', 'contact'],
  'pricing': ['hero', 'pricing', 'faq', 'cta'],
  'faq': ['hero', 'faq', 'cta'],
  'programs': ['hero', 'features', 'cta'],
  'features': ['hero', 'features', 'cta'],
};

/**
 * Determines which pages to include based on business type
 */
function determinePages(brief: BusinessBrief): Array<{ path: string; title: string; type: string }> {
  const pages: Array<{ path: string; title: string; type: string }> = [];

  // Always include home
  pages.push({ path: '/', title: 'Home', type: 'home' });

  // Determine main offering page
  if (brief.industry === 'restaurant' || brief.industry === 'bakery' || brief.industry === 'dispensary') {
    pages.push({ path: '/menu', title: 'Menu', type: 'menu' });
  } else if (brief.needsEcommerce || brief.industry === 'lighter_shop' || brief.industry === 'retail_general') {
    pages.push({ path: '/shop', title: 'Shop', type: 'shop' });
  } else if (brief.industry === 'photography' || brief.industry.includes('portfolio')) {
    pages.push({ path: '/portfolio', title: 'Portfolio', type: 'portfolio' });
  } else if (brief.industry === 'saas') {
    pages.push({ path: '/features', title: 'Features', type: 'features' });
    pages.push({ path: '/pricing', title: 'Pricing', type: 'pricing' });
  } else if (brief.industry === 'nonprofit') {
    pages.push({ path: '/programs', title: 'Programs', type: 'programs' });
  } else {
    pages.push({ path: '/services', title: 'Services', type: 'services' });
  }

  // Add about page (most businesses benefit from it)
  pages.push({ path: '/about', title: 'About', type: 'about' });

  // Add contact page
  pages.push({ path: '/contact', title: 'Contact', type: 'contact' });

  return pages;
}

/**
 * Gets hero content for a specific page
 */
function getHeroContent(
  brief: BusinessBrief,
  pagePath: string
): { headline: string; subheadline: string; cta?: string } {
  // Try industry-specific templates first
  const industryTemplates = INDUSTRY_HERO_TEMPLATES[brief.industry];
  const template = industryTemplates?.[pagePath] || DEFAULT_HERO_TEMPLATES[pagePath] || DEFAULT_HERO_TEMPLATES['/'];

  // Customize headline with business name if available
  let headline = template.headline;
  let subheadline = template.subheadline;

  // Inject location if available for home page
  if (pagePath === '/' && brief.location?.city) {
    subheadline = `Serving ${brief.location.city} and surrounding areas. ${subheadline}`;
  }

  // Determine CTA based on page and goal
  let cta: string | undefined;
  if (pagePath === '/' || pagePath === '/services' || pagePath === '/shop') {
    cta = brief.primaryCTA;
  } else if (pagePath === '/contact') {
    // Contact page usually has form, not hero CTA
    cta = undefined;
  }

  return { headline, subheadline, cta };
}

/**
 * Determines navigation items
 */
function buildNavigation(pages: Array<{ path: string; title: string }>): Array<{ label: string; href: string }> {
  return pages.slice(0, 5).map((page) => ({
    label: page.title,
    href: page.path,
  }));
}

/**
 * Determines footer links
 */
function buildFooterLinks(hasEcommerce: boolean): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  if (hasEcommerce) {
    links.push({ label: 'Shipping & Returns', href: '/shipping' });
  }

  return links;
}

/**
 * Main function: Generate SitePlan from BusinessBrief
 */
export function generateSitePlan(brief: BusinessBrief): SitePlan {
  const pageConfigs = determinePages(brief);

  const pages: PageRequirement[] = pageConfigs.map((config) => {
    const heroContent = getHeroContent(brief, config.path);
    const sections = PAGE_SECTIONS[config.type] || PAGE_SECTIONS['home'];

    return {
      path: config.path,
      title: config.title,
      sections,
      heroContent,
    };
  });

  const navigation = buildNavigation(pageConfigs);
  const footerLinks = buildFooterLinks(brief.needsEcommerce);
  const hasCart = brief.needsEcommerce || brief.industry === 'lighter_shop' || brief.industry === 'retail_general';

  return {
    businessBrief: brief,
    pages,
    navigation,
    hasCart,
    footerLinks,
  };
}
