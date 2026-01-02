// ============= Site Spec Validator =============
// Final validation and auto-fill for generated SiteSpec
// Ensures "Never Ship Empty" policy in preview mode

import { SiteSpec, SiteSection, SectionContent, FeaturesContent, TestimonialsContent, FAQContent, PricingContent, CTAContent, StatsContent, ServicesContent } from '@/types/site-spec';
import { BusinessIntent } from '@/lib/intentAwareFallbacks';

// ============= BANNED PHRASES =============
// These should NEVER appear in a generated site
export const BANNED_PHRASES = [
  // Generic SaaS/tech filler
  'welcome to our website',
  'discover what we have to offer',
  'everything you need to succeed',
  'custom section content goes here',
  'lorem ipsum',
  'feature 1',
  'feature 2',
  'feature 3',
  'fast & reliable',
  'fast and reliable',
  'built for speed',
  'your data is always protected',
  'data protected',
  '99.9% uptime',
  'scalable',
  'enterprise-grade',
  'api access',
  'sla',
  'ownership & export',
  'code ownership',
  'excellion',
  'website builder',
  'hosting',
  'top quality',
  'best in class',
  'world-class',
  'industry-leading',
  'cutting-edge',
  'state-of-the-art',
  'next-generation',
  'revolutionary',
  'transform your business',
  // Generic CTAs
  'start free trial',
  'contact sales',
  'get demo',
  'learn more',
  'get started',
  'explore',
  'discover',
  "let's work together",
  'ready to get started',
  // Generic support claims
  '24/7 support',
  'trusted by thousands',
  // Placeholder content
  'your tagline here',
  'your headline here',
  'description goes here',
  'content coming soon',
  'add ___',
  'insert text here',
  'tbd',
  'n/a',
  'sample text',
  'sample content',
  'placeholder',
  // Bad CTA section content
  "we're here to help",
  'reach out today',
  'we can help',
] as const;

// Intent-specific banned phrases (only for certain intents)
export const SAAS_ONLY_PHRASES = [
  'free trial',
  'pro plan',
  'enterprise plan',
  '/month',
  'per user',
  'advanced analytics',
  'unlimited users',
  'api calls',
  'cloud storage',
  'integrations included',
  'priority support',
];

// ============= VALIDATION TYPES =============
export type ValidationIssue = {
  page: string;
  sectionId: string;
  sectionType: string;
  issue: 'banned_phrase' | 'empty_content' | 'placeholder' | 'missing_industry_relevance';
  details: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
  score: number; // 0-100
};

// ============= VALIDATION FUNCTIONS =============

export function hasBannedPhrase(text: string, intent?: BusinessIntent): string | null {
  const lower = text.toLowerCase();
  
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      return phrase;
    }
  }
  
  // Check SaaS-only phrases for non-SaaS businesses
  if (intent && intent !== 'saas') {
    for (const phrase of SAAS_ONLY_PHRASES) {
      if (lower.includes(phrase.toLowerCase())) {
        return phrase;
      }
    }
  }
  
  return null;
}

export function isEmptyOrPlaceholder(content: unknown): boolean {
  if (!content) return true;
  if (typeof content === 'string' && content.trim() === '') return true;
  
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  const lower = str.toLowerCase();
  
  // Check for placeholder patterns
  const placeholderPatterns = [
    /custom\s*section\s*content\s*goes\s*here/i,
    /lorem\s*ipsum/i,
    /placeholder/i,
    /coming\s*soon/i,
    /insert\s*(text|content)\s*here/i,
    /\[.*\]/,
    /^tbd$/i,
    /^n\/a$/i,
    /sample\s*(text|content)/i,
  ];
  
  for (const pattern of placeholderPatterns) {
    if (pattern.test(lower)) return true;
  }
  
  // Check for empty arrays/objects
  if (typeof content === 'object') {
    if (Array.isArray(content) && content.length === 0) return true;
    if (Object.keys(content as object).length === 0) return true;
  }
  
  return false;
}

export function validateSiteSpec(
  spec: SiteSpec | null,
  intent: BusinessIntent = 'service_business'
): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  if (!spec || !spec.pages) {
    return { valid: false, issues: [{ page: 'root', sectionId: '', sectionType: '', issue: 'empty_content', details: 'No site spec provided' }], score: 0 };
  }
  
  for (const page of spec.pages) {
    for (const section of page.sections || []) {
      const sectionStr = JSON.stringify(section.content || section);
      
      // Check for banned phrases
      const bannedPhrase = hasBannedPhrase(sectionStr, intent);
      if (bannedPhrase) {
        issues.push({
          page: page.path,
          sectionId: section.id,
          sectionType: section.type,
          issue: 'banned_phrase',
          details: `Contains banned phrase: "${bannedPhrase}"`,
        });
      }
      
      // Check for empty content in key sections
      if (['features', 'testimonials', 'pricing', 'services', 'faq'].includes(section.type)) {
        const content = section.content as any;
        if (!content?.items || content.items.length === 0) {
          issues.push({
            page: page.path,
            sectionId: section.id,
            sectionType: section.type,
            issue: 'empty_content',
            details: 'Section has no items',
          });
        }
      }
      
      // Check for placeholder content
      if (isEmptyOrPlaceholder(section.content)) {
        issues.push({
          page: page.path,
          sectionId: section.id,
          sectionType: section.type,
          issue: 'placeholder',
          details: 'Section contains placeholder or empty content',
        });
      }
    }
  }
  
  const score = Math.max(0, 100 - issues.length * 10);
  
  return {
    valid: issues.length === 0,
    issues,
    score,
  };
}

// ============= INTENT-AWARE FALLBACK CONTENT =============

// These fallbacks are used when content is empty and we're in preview mode
export const FEATURES_FALLBACK_BY_INTENT: Record<BusinessIntent, FeaturesContent> = {
  product_store: {
    title: 'Why Shop With Us',
    subtitle: 'The best selection, the best prices',
    items: [
      { title: 'Curated Selection', description: 'Handpicked products from trusted sources', icon: 'Diamond' },
      { title: 'Fast Shipping', description: 'Free delivery on orders over $50', icon: 'Truck' },
      { title: 'Easy Returns', description: '30-day hassle-free return policy', icon: 'RotateCcw' },
      { title: 'Expert Support', description: 'Knowledgeable staff ready to help', icon: 'MessageCircle' },
    ],
  },
  service_business: {
    title: 'Why Choose Us',
    subtitle: 'Trusted by homeowners across the area',
    items: [
      { title: 'Licensed & Insured', description: 'Fully certified professionals you can trust', icon: 'ShieldCheck' },
      { title: 'Free Estimates', description: 'Know the cost before we start any work', icon: 'Calculator' },
      { title: 'Satisfaction Guaranteed', description: 'We stand behind every job we do', icon: 'Award' },
      { title: 'Same-Day Service', description: 'Available for urgent needs', icon: 'Clock' },
    ],
  },
  booking_business: {
    title: 'The Experience',
    subtitle: 'What sets us apart',
    items: [
      { title: 'Expert Professionals', description: 'Trained specialists dedicated to your care', icon: 'Award' },
      { title: 'Easy Online Booking', description: 'Schedule your appointment in seconds', icon: 'Calendar' },
      { title: 'Premium Products', description: 'Only the best for our clients', icon: 'Diamond' },
      { title: 'Relaxing Atmosphere', description: 'Designed for your comfort', icon: 'Heart' },
    ],
  },
  saas: {
    title: 'Powerful Features',
    subtitle: 'Everything you need to succeed',
    items: [
      { title: 'Intuitive Dashboard', description: 'Manage everything from one place', icon: 'LayoutDashboard' },
      { title: 'Real-time Analytics', description: 'Track what matters most', icon: 'BarChart' },
      { title: 'Team Collaboration', description: 'Work together seamlessly', icon: 'Users' },
      { title: 'Automation', description: 'Save time with smart workflows', icon: 'Zap' },
    ],
  },
  nonprofit: {
    title: 'Our Impact',
    subtitle: 'Making a difference together',
    items: [
      { title: 'Transparent Spending', description: '90%+ of donations go directly to programs', icon: 'PieChart' },
      { title: 'Local Focus', description: 'Supporting our community where it matters most', icon: 'MapPin' },
      { title: 'Volunteer-Powered', description: 'Join hundreds making a difference', icon: 'Heart' },
      { title: 'Measurable Results', description: 'Clear outcomes and regular updates', icon: 'TrendingUp' },
    ],
  },
  portfolio: {
    title: 'Our Approach',
    subtitle: 'How we deliver results',
    items: [
      { title: 'Creative Vision', description: 'Unique concepts tailored to your brand', icon: 'Lightbulb' },
      { title: 'Attention to Detail', description: 'Every pixel, every word matters', icon: 'Eye' },
      { title: 'Collaborative Process', description: 'Your input shapes the outcome', icon: 'MessageCircle' },
      { title: 'On-Time Delivery', description: 'Reliable timelines you can count on', icon: 'Clock' },
    ],
  },
};

export const TESTIMONIALS_FALLBACK_BY_INTENT: Record<BusinessIntent, TestimonialsContent> = {
  product_store: {
    title: 'Customer Reviews',
    subtitle: 'What our customers are saying',
    items: [
      { name: 'Jennifer M.', role: 'Verified Buyer', quote: 'Amazing quality and fast shipping. Will definitely order again!', rating: 5 },
      { name: 'David K.', role: 'Repeat Customer', quote: 'Best selection I\'ve found anywhere. Great prices too.', rating: 5 },
      { name: 'Rachel S.', role: 'First-time Buyer', quote: 'Exceeded my expectations. The customer service was fantastic.', rating: 5 },
    ],
  },
  service_business: {
    title: 'What Our Clients Say',
    subtitle: 'Real reviews from real customers',
    items: [
      { name: 'Michael R.', role: 'Homeowner', quote: 'Professional, on time, and the work was excellent. Highly recommend!', rating: 5 },
      { name: 'Sarah T.', role: 'Local Business Owner', quote: 'They\'ve handled all our needs for years. Trustworthy and fair.', rating: 5 },
      { name: 'James L.', role: 'Property Manager', quote: 'Responsive and reliable. They make my job easier.', rating: 5 },
    ],
  },
  booking_business: {
    title: 'Client Testimonials',
    subtitle: 'Experiences our clients love',
    items: [
      { name: 'Amanda P.', role: 'Regular Client', quote: 'Best experience every time. The staff is incredible.', rating: 5 },
      { name: 'Chris M.', role: 'First-time Visitor', quote: 'Felt so relaxed and taken care of. Already booked my next visit!', rating: 5 },
      { name: 'Nicole K.', role: 'VIP Member', quote: 'Worth every penny. This is my happy place.', rating: 5 },
    ],
  },
  saas: {
    title: 'Loved by Teams',
    subtitle: 'See what our customers have to say',
    items: [
      { name: 'Alex Chen', role: 'CTO, TechCorp', quote: 'Cut our development time in half. Game-changing for our team.', rating: 5 },
      { name: 'Maria Santos', role: 'Founder, StartupX', quote: 'The ROI was immediate. Best tool we\'ve adopted this year.', rating: 5 },
      { name: 'Jordan Lee', role: 'Product Manager', quote: 'Finally a solution that just works. No more workarounds.', rating: 5 },
    ],
  },
  nonprofit: {
    title: 'Community Voices',
    subtitle: 'Stories from those we serve',
    items: [
      { name: 'Community Member', role: 'Program Participant', quote: 'This organization changed my life. I\'m forever grateful.', rating: 5 },
      { name: 'Local Volunteer', role: 'Weekly Helper', quote: 'Being part of this mission is the most rewarding thing I do.', rating: 5 },
      { name: 'Partner Organization', role: 'Collaboration Partner', quote: 'Their dedication to the community is unmatched.', rating: 5 },
    ],
  },
  portfolio: {
    title: 'Client Feedback',
    subtitle: 'What it\'s like to work together',
    items: [
      { name: 'Emily R.', role: 'Marketing Director', quote: 'Creative, professional, and delivered exactly what we envisioned.', rating: 5 },
      { name: 'Thomas B.', role: 'Startup Founder', quote: 'Transformed our brand. The results speak for themselves.', rating: 5 },
      { name: 'Lisa M.', role: 'Creative Director', quote: 'A true collaborator. Made the whole process enjoyable.', rating: 5 },
    ],
  },
};

export const FAQ_FALLBACK_BY_INTENT: Record<BusinessIntent, FAQContent> = {
  product_store: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know',
    items: [
      { question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days. Express options are available at checkout.' },
      { question: 'What is your return policy?', answer: 'We offer a 30-day return policy on all unused items in original packaging.' },
      { question: 'Do you ship internationally?', answer: 'Yes! We ship to most countries. International shipping rates are calculated at checkout.' },
      { question: 'How can I track my order?', answer: 'You\'ll receive a tracking number via email once your order ships.' },
    ],
  },
  service_business: {
    title: 'Common Questions',
    subtitle: 'Get the answers you need',
    items: [
      { question: 'Do you offer free estimates?', answer: 'Yes, we provide free on-site estimates with no obligation.' },
      { question: 'Are you licensed and insured?', answer: 'Absolutely. We\'re fully licensed, bonded, and insured for your protection.' },
      { question: 'What areas do you serve?', answer: 'We serve the greater metropolitan area and surrounding communities.' },
      { question: 'What forms of payment do you accept?', answer: 'We accept all major credit cards, cash, and checks. Financing options available.' },
    ],
  },
  booking_business: {
    title: 'Questions & Answers',
    subtitle: 'What you need to know before visiting',
    items: [
      { question: 'How do I book an appointment?', answer: 'You can book online 24/7, call us, or walk in during business hours.' },
      { question: 'What should I expect on my first visit?', answer: 'We\'ll do a consultation to understand your needs before your service.' },
      { question: 'Do you accept walk-ins?', answer: 'Yes! Walk-ins are welcome, but appointments are recommended to guarantee availability.' },
      { question: 'What is your cancellation policy?', answer: 'Please give us 24 hours notice if you need to reschedule or cancel.' },
    ],
  },
  saas: {
    title: 'FAQ',
    subtitle: 'Common questions answered',
    items: [
      { question: 'Is there a free trial?', answer: 'Yes! Start with a 14-day free trial. No credit card required.' },
      { question: 'Can I cancel anytime?', answer: 'Absolutely. Cancel or change your plan anytime with no penalties.' },
      { question: 'How does billing work?', answer: 'We offer monthly and annual billing. Annual plans save you 20%.' },
      { question: 'Do you offer team plans?', answer: 'Yes, we have plans for teams of all sizes with volume discounts.' },
    ],
  },
  nonprofit: {
    title: 'About Our Organization',
    subtitle: 'Answers to common questions',
    items: [
      { question: 'How is my donation used?', answer: 'Over 90% of every dollar goes directly to our programs and services.' },
      { question: 'Is my donation tax-deductible?', answer: 'Yes, we are a registered 501(c)(3) and all donations are tax-deductible.' },
      { question: 'How can I volunteer?', answer: 'Visit our volunteer page or contact us directly. We have opportunities for all skill levels.' },
      { question: 'How can I stay updated?', answer: 'Sign up for our newsletter or follow us on social media for the latest news.' },
    ],
  },
  portfolio: {
    title: 'Working Together',
    subtitle: 'Common questions about our process',
    items: [
      { question: 'What is your process?', answer: 'We start with a discovery call, then move through concept, design, and delivery phases.' },
      { question: 'How long does a typical project take?', answer: 'Most projects take 2-6 weeks depending on scope and complexity.' },
      { question: 'What do you need from me to start?', answer: 'A brief about your goals, brand guidelines if available, and any reference materials.' },
      { question: 'Do you offer revisions?', answer: 'Yes, all projects include revision rounds to ensure you\'re 100% satisfied.' },
    ],
  },
};

export const STATS_FALLBACK_BY_INTENT: Record<BusinessIntent, StatsContent> = {
  product_store: {
    title: 'By the Numbers',
    items: [
      { value: '10K+', label: 'Happy Customers' },
      { value: '500+', label: 'Products' },
      { value: '4.9', label: 'Average Rating' },
      { value: '24h', label: 'Shipping' },
    ],
  },
  service_business: {
    title: 'Our Track Record',
    items: [
      { value: '15+', label: 'Years Experience' },
      { value: '5000+', label: 'Jobs Completed' },
      { value: '100%', label: 'Satisfaction' },
      { value: '24/7', label: 'Availability' },
    ],
  },
  booking_business: {
    title: 'Why Clients Love Us',
    items: [
      { value: '10K+', label: 'Happy Clients' },
      { value: '50+', label: 'Expert Staff' },
      { value: '4.9', label: 'Rating' },
      { value: '8+', label: 'Years' },
    ],
  },
  saas: {
    title: 'Trusted Globally',
    items: [
      { value: '50K+', label: 'Users' },
      { value: '120+', label: 'Countries' },
      { value: '99.9%', label: 'Uptime' },
      { value: '4.8', label: 'Rating' },
    ],
  },
  nonprofit: {
    title: 'Our Impact',
    items: [
      { value: '10K+', label: 'Lives Touched' },
      { value: '$1M+', label: 'Raised' },
      { value: '500+', label: 'Volunteers' },
      { value: '50+', label: 'Programs' },
    ],
  },
  portfolio: {
    title: 'Results Delivered',
    items: [
      { value: '200+', label: 'Projects' },
      { value: '50+', label: 'Clients' },
      { value: '10+', label: 'Years' },
      { value: '15', label: 'Awards' },
    ],
  },
};

// ============= FILL MISSING CONTENT FUNCTION =============
// Used in preview mode to auto-fill empty sections

// NUCLEAR FIX: Only fill TRULY empty sections (no content object at all)
// If AI returns empty items array, PRESERVE IT - do not replace with fallback
export function fillMissingSectionContent(
  section: SiteSection,
  intent: BusinessIntent
): SiteSection {
  const content = section.content as any;
  
  // NUCLEAR FIX: Only replace if content is completely null/undefined
  // If content exists (even with empty items), PRESERVE the AI's work
  if (!content) {
    console.log('[FALLBACK] Section has NO content, applying fallback:', section.type, 'intent:', intent);
    switch (section.type) {
      case 'features':
      case 'services':
        return { ...section, content: FEATURES_FALLBACK_BY_INTENT[intent] || FEATURES_FALLBACK_BY_INTENT.service_business };
      case 'testimonials':
        return { ...section, content: TESTIMONIALS_FALLBACK_BY_INTENT[intent] || TESTIMONIALS_FALLBACK_BY_INTENT.service_business };
      case 'faq':
        return { ...section, content: FAQ_FALLBACK_BY_INTENT[intent] || FAQ_FALLBACK_BY_INTENT.service_business };
      case 'stats':
        return { ...section, content: STATS_FALLBACK_BY_INTENT[intent] || STATS_FALLBACK_BY_INTENT.service_business };
    }
  }
  
  // AI returned content (even if items is empty) - PRESERVE IT
  return section;
}

// Fill all missing sections in a SiteSpec for preview mode
// NUCLEAR FIX: Read intent from siteSpec.businessIntent if available
export function fillMissingSiteContent(
  spec: SiteSpec,
  fallbackIntent: BusinessIntent = 'service_business'
): SiteSpec {
  if (!spec.pages) return spec;
  
  // NUCLEAR FIX: Use businessIntent from spec if available, otherwise fallback
  const effectiveIntent = (spec as any).businessIntent || fallbackIntent;
  console.log('[FILL] Using businessIntent:', effectiveIntent, 'from spec:', !!(spec as any).businessIntent);
  
  return {
    ...spec,
    pages: spec.pages.map(page => ({
      ...page,
      sections: (page.sections || []).map(section => 
        fillMissingSectionContent(section, effectiveIntent)
      ),
    })),
  };
}
