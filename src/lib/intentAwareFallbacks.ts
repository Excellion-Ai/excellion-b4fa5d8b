// Intent-aware fallback content for Pricing and CTA sections
// Ensures complete first-draft rendering based on business intent

import { PrimaryGoal } from './contentPipeline/types';
import { PricingTier, CTAContent } from '@/types/app-spec';
import { NicheCategory, ConversionGoal } from './nicheRouter';

export type BusinessIntent = 'booking_business' | 'service_business' | 'product_store' | 'saas' | 'nonprofit' | 'portfolio';

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
