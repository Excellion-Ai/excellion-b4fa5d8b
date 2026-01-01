// Value Props Templates - Intent-based value proposition templates
// Replaces generic "Features" with industry-specific value props

import { BusinessIntent } from '@/components/secret-builder/SiteBriefPanel';

export interface ValueProp {
  title: string;
  description: string;
  icon: string;
}

export interface ValuePropsTemplate {
  title: string;
  subtitle: string;
  items: ValueProp[];
}

// Intent-based value prop templates
export const VALUE_PROPS_BY_INTENT: Record<BusinessIntent, ValuePropsTemplate> = {
  product_store: {
    title: 'Why Shop With Us',
    subtitle: 'Quality products and exceptional service',
    items: [
      {
        title: 'Curated Selection',
        description: 'Hand-picked products that meet our high quality standards',
        icon: 'Diamond',
      },
      {
        title: 'Easy Returns',
        description: 'Hassle-free 30-day return policy on all orders',
        icon: 'RefreshCw',
      },
      {
        title: 'Fast Shipping',
        description: 'Most orders ship within 24 hours',
        icon: 'Truck',
      },
      {
        title: 'Secure Checkout',
        description: 'Your payment information is always protected',
        icon: 'ShieldCheck',
      },
    ],
  },
  
  service_business: {
    title: 'Why Choose Us',
    subtitle: 'Trusted by homeowners and businesses',
    items: [
      {
        title: 'Licensed & Insured',
        description: 'Fully bonded professionals you can trust with your property',
        icon: 'ShieldCheck',
      },
      {
        title: 'Free Estimates',
        description: 'Transparent pricing with no hidden fees or surprises',
        icon: 'Calculator',
      },
      {
        title: 'Satisfaction Guaranteed',
        description: 'We stand behind our work with a 100% satisfaction guarantee',
        icon: 'Award',
      },
      {
        title: 'Local & Reliable',
        description: 'Family-owned business serving our community',
        icon: 'Home',
      },
    ],
  },
  
  booking_business: {
    title: 'The Experience',
    subtitle: 'What makes us different',
    items: [
      {
        title: 'Easy Online Booking',
        description: 'Schedule your appointment in seconds, 24/7',
        icon: 'Calendar',
      },
      {
        title: 'Expert Staff',
        description: 'Trained professionals dedicated to your satisfaction',
        icon: 'Users',
      },
      {
        title: 'Flexible Scheduling',
        description: 'Convenient hours including evenings and weekends',
        icon: 'Clock',
      },
      {
        title: 'Personalized Service',
        description: 'Tailored experiences based on your preferences',
        icon: 'Heart',
      },
    ],
  },
  
  saas: {
    title: 'Why Teams Choose Us',
    subtitle: 'Built for modern workflows',
    items: [
      {
        title: 'Instant Setup',
        description: 'Get started in minutes with no complex configuration',
        icon: 'Zap',
      },
      {
        title: 'Powerful Integrations',
        description: 'Connect with the tools you already use',
        icon: 'Plug',
      },
      {
        title: 'Real-time Collaboration',
        description: 'Work together seamlessly with your team',
        icon: 'Users',
      },
      {
        title: 'Enterprise Security',
        description: 'SOC 2 compliant with bank-level encryption',
        icon: 'Shield',
      },
    ],
  },
  
  portfolio: {
    title: 'My Approach',
    subtitle: 'What sets my work apart',
    items: [
      {
        title: 'Creative Vision',
        description: 'Unique perspective that brings your ideas to life',
        icon: 'Sparkles',
      },
      {
        title: 'Attention to Detail',
        description: 'Every project receives meticulous care and precision',
        icon: 'Eye',
      },
      {
        title: 'Collaborative Process',
        description: 'Your input shapes the final result at every stage',
        icon: 'MessageCircle',
      },
      {
        title: 'Timely Delivery',
        description: 'Reliable deadlines without compromising quality',
        icon: 'Clock',
      },
    ],
  },
};

// Industry-specific value props (more granular than intent)
export const VALUE_PROPS_BY_INDUSTRY: Record<string, ValuePropsTemplate> = {
  plumbing: {
    title: 'Why Call Us',
    subtitle: 'Your trusted local plumbers',
    items: [
      { title: '24/7 Emergency Service', description: 'Available when you need us most, day or night', icon: 'Phone' },
      { title: 'Licensed & Insured', description: 'Certified professionals you can trust', icon: 'ShieldCheck' },
      { title: 'Upfront Pricing', description: 'Know the cost before we start any work', icon: 'Calculator' },
      { title: 'Guaranteed Work', description: 'All repairs backed by our satisfaction guarantee', icon: 'Award' },
    ],
  },
  
  pressure_washing: {
    title: 'Our Difference',
    subtitle: 'Professional exterior cleaning',
    items: [
      { title: 'Commercial-Grade Equipment', description: 'Powerful results without damaging your surfaces', icon: 'Droplets' },
      { title: 'Eco-Friendly Solutions', description: 'Safe for your family, pets, and landscaping', icon: 'Leaf' },
      { title: 'Same-Day Service', description: 'Fast turnaround for most residential jobs', icon: 'Clock' },
      { title: 'Free On-Site Estimates', description: 'See results before you commit', icon: 'Eye' },
    ],
  },
  
  auto_detailing: {
    title: 'The Detail Difference',
    subtitle: 'Premium car care services',
    items: [
      { title: 'Hand-Wash Only', description: 'Gentle techniques that protect your finish', icon: 'Car' },
      { title: 'Premium Products', description: 'Industry-leading detailing products and coatings', icon: 'Diamond' },
      { title: 'Mobile Service', description: 'We come to your home or office', icon: 'MapPin' },
      { title: 'Satisfaction Guaranteed', description: 'Not happy? We\'ll make it right', icon: 'ThumbsUp' },
    ],
  },
  
  restaurant: {
    title: 'Our Promise',
    subtitle: 'A dining experience you\'ll love',
    items: [
      { title: 'Fresh Ingredients', description: 'Locally-sourced and made from scratch daily', icon: 'Leaf' },
      { title: 'Warm Hospitality', description: 'Every guest treated like family', icon: 'Heart' },
      { title: 'Easy Reservations', description: 'Book online or call ahead for groups', icon: 'Calendar' },
      { title: 'Takeout & Delivery', description: 'Enjoy our food wherever you are', icon: 'Truck' },
    ],
  },
  
  salon: {
    title: 'The Salon Experience',
    subtitle: 'Where beauty meets relaxation',
    items: [
      { title: 'Expert Stylists', description: 'Trained in the latest techniques and trends', icon: 'Scissors' },
      { title: 'Premium Products', description: 'Only the best for your hair and skin', icon: 'Diamond' },
      { title: 'Relaxing Atmosphere', description: 'Escape the everyday in our tranquil space', icon: 'Heart' },
      { title: 'Easy Booking', description: 'Schedule online anytime, anywhere', icon: 'Calendar' },
    ],
  },
  
  dental: {
    title: 'Your Comfort Matters',
    subtitle: 'Gentle, modern dental care',
    items: [
      { title: 'Pain-Free Dentistry', description: 'Advanced techniques for comfortable treatment', icon: 'Smile' },
      { title: 'Modern Technology', description: 'Digital X-rays and same-day crowns', icon: 'Monitor' },
      { title: 'Flexible Financing', description: 'Payment plans that fit your budget', icon: 'CreditCard' },
      { title: 'Family-Friendly', description: 'Care for patients of all ages', icon: 'Users' },
    ],
  },
  
  yoga_fitness: {
    title: 'Transform Your Practice',
    subtitle: 'Mind, body, and community',
    items: [
      { title: 'All Levels Welcome', description: 'From beginners to advanced practitioners', icon: 'Users' },
      { title: 'Expert Instructors', description: 'Certified teachers who guide your journey', icon: 'Award' },
      { title: 'Diverse Classes', description: 'Yoga, pilates, meditation, and more', icon: 'Dumbbell' },
      { title: 'Supportive Community', description: 'A welcoming space for everyone', icon: 'Heart' },
    ],
  },
  
  law_firm: {
    title: 'Why Clients Trust Us',
    subtitle: 'Experienced legal representation',
    items: [
      { title: 'Proven Track Record', description: 'Millions recovered for our clients', icon: 'Trophy' },
      { title: 'Free Consultation', description: 'Discuss your case at no cost or obligation', icon: 'MessageCircle' },
      { title: 'No Win, No Fee', description: 'You only pay if we win your case', icon: 'Scale' },
      { title: 'Personal Attention', description: 'Direct access to your attorney, always', icon: 'Phone' },
    ],
  },
  
  real_estate: {
    title: 'Your Home Journey',
    subtitle: 'Expert guidance every step',
    items: [
      { title: 'Local Market Expert', description: 'Deep knowledge of neighborhoods and values', icon: 'MapPin' },
      { title: 'Proven Results', description: 'Homes sold above asking, faster than average', icon: 'TrendingUp' },
      { title: 'Full-Service Support', description: 'From listing to closing, we handle it all', icon: 'Home' },
      { title: 'Always Available', description: 'Responsive communication on your schedule', icon: 'Phone' },
    ],
  },
  
  photography: {
    title: 'Capturing Your Story',
    subtitle: 'Moments that last forever',
    items: [
      { title: 'Artistic Vision', description: 'Creative approach that reflects your personality', icon: 'Camera' },
      { title: 'Professional Editing', description: 'Each image carefully retouched and enhanced', icon: 'Sparkles' },
      { title: 'Quick Turnaround', description: 'Preview gallery within 48 hours', icon: 'Clock' },
      { title: 'Full Rights Included', description: 'Print and share your photos freely', icon: 'Download' },
    ],
  },
  
  dispensary: {
    title: 'Why Shop Here',
    subtitle: 'Premium cannabis, expert guidance',
    items: [
      { title: 'Lab-Tested Products', description: 'Every item verified for purity and potency', icon: 'ShieldCheck' },
      { title: 'Knowledgeable Staff', description: 'Friendly budtenders to guide your selection', icon: 'Users' },
      { title: 'Daily Deals', description: 'Rotating specials on top products', icon: 'Tag' },
      { title: 'Online Ordering', description: 'Skip the line with express pickup', icon: 'Smartphone' },
    ],
  },
  
  hvac: {
    title: 'Your Comfort Experts',
    subtitle: 'Heating & cooling you can rely on',
    items: [
      { title: '24/7 Emergency Repair', description: 'Never left without heat or AC', icon: 'Phone' },
      { title: 'Upfront Pricing', description: 'No surprises, no hidden fees', icon: 'Calculator' },
      { title: 'Energy Efficient', description: 'Systems that save you money monthly', icon: 'Leaf' },
      { title: 'Satisfaction Guaranteed', description: 'All work backed by our warranty', icon: 'Award' },
    ],
  },
  
  roofing: {
    title: 'Roofing Done Right',
    subtitle: 'Protecting your biggest investment',
    items: [
      { title: 'Free Inspections', description: 'Know your roof\'s condition at no cost', icon: 'Eye' },
      { title: 'Insurance Specialists', description: 'We work directly with your insurance', icon: 'FileText' },
      { title: 'Quality Materials', description: 'Industry-leading shingles and underlayment', icon: 'Diamond' },
      { title: 'Workmanship Warranty', description: 'Peace of mind for years to come', icon: 'ShieldCheck' },
    ],
  },
  
  cleaning: {
    title: 'A Cleaner Home',
    subtitle: 'Professional cleaning you can trust',
    items: [
      { title: 'Vetted Professionals', description: 'Background-checked, trained cleaners', icon: 'ShieldCheck' },
      { title: 'Eco-Friendly Products', description: 'Safe for your family and pets', icon: 'Leaf' },
      { title: 'Flexible Scheduling', description: 'Weekly, bi-weekly, or one-time service', icon: 'Calendar' },
      { title: 'Satisfaction Guaranteed', description: 'Not happy? We\'ll re-clean for free', icon: 'Award' },
    ],
  },
  
  nonprofit: {
    title: 'Our Impact',
    subtitle: 'Together, we make a difference',
    items: [
      { title: 'Transparent Spending', description: '90%+ of donations go directly to programs', icon: 'PieChart' },
      { title: 'Local Focus', description: 'Supporting our community where it matters most', icon: 'MapPin' },
      { title: 'Volunteer-Powered', description: 'Join hundreds making a difference', icon: 'Heart' },
      { title: 'Measurable Results', description: 'Clear outcomes and regular updates', icon: 'TrendingUp' },
    ],
  },
};

// Get value props for a specific industry, falling back to intent
export function getValuePropsForBusiness(
  industry: string,
  intent: BusinessIntent,
  offerings?: string[]
): ValuePropsTemplate {
  // Check industry-specific first
  const normalizedIndustry = industry.toLowerCase().replace(/[_\s-]+/g, '_');
  if (VALUE_PROPS_BY_INDUSTRY[normalizedIndustry]) {
    return VALUE_PROPS_BY_INDUSTRY[normalizedIndustry];
  }
  
  // Fall back to intent-based
  return VALUE_PROPS_BY_INTENT[intent];
}

// Customize value props with offerings
export function customizeValueProps(
  template: ValuePropsTemplate,
  offerings: string[],
  businessName?: string
): ValuePropsTemplate {
  // If we have offerings, potentially swap out generic descriptions
  if (offerings.length > 0) {
    const customized = { ...template };
    // Could enhance descriptions with actual offerings here
    return customized;
  }
  return template;
}

// BANNED generic phrases that should never appear in value props
export const BANNED_VALUE_PROP_PHRASES = [
  'Fast & Reliable',
  'Secure',
  '24/7 Support',
  'Top Quality',
  'Everything you need to succeed',
  'Custom section content goes here',
  'Lorem ipsum',
  'Placeholder',
  'Coming soon',
  'TBD',
  'Insert text here',
];

// Validate value props don't contain banned phrases
export function validateValueProps(props: ValuePropsTemplate): boolean {
  const allText = [
    props.title,
    props.subtitle,
    ...props.items.map(i => i.title),
    ...props.items.map(i => i.description),
  ].join(' ').toLowerCase();
  
  for (const banned of BANNED_VALUE_PROP_PHRASES) {
    if (allText.includes(banned.toLowerCase())) {
      return false;
    }
  }
  return true;
}
