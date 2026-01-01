// ============= Business Brief Extractor =============
// Extracts structured business data from user prompts

import {
  BusinessBrief,
  PrimaryGoal,
  INDUSTRY_PATTERNS,
  GOAL_PATTERNS,
  GOAL_TO_CTA,
} from './types';

// Location extraction patterns
const LOCATION_PATTERNS = {
  city: /(?:in|from|based\s+in|located\s+in|serving)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  state: /\b([A-Z]{2})\b|\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New\s+Hampshire|New\s+Jersey|New\s+Mexico|New\s+York|North\s+Carolina|North\s+Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode\s+Island|South\s+Carolina|South\s+Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West\s+Virginia|Wisconsin|Wyoming)\b/i,
  country: /\b(USA|United\s+States|Canada|UK|United\s+Kingdom|Australia)\b/i,
};

// Tone detection patterns
const TONE_PATTERNS: Record<string, RegExp[]> = {
  professional: [/profession/i, /corporate/i, /business/i, /formal/i],
  friendly: [/friend/i, /warm/i, /welcom/i, /casual/i, /relaxed/i],
  premium: [/premium/i, /luxury/i, /high-?end/i, /exclusive/i, /upscale/i],
  playful: [/fun/i, /playful/i, /creative/i, /bold/i, /vibrant/i],
  trustworthy: [/trust/i, /reliable/i, /honest/i, /depend/i, /establ/i],
  modern: [/modern/i, /contemporary/i, /sleek/i, /minimal/i, /clean/i],
  traditional: [/tradition/i, /classic/i, /timeless/i, /heritage/i],
  energetic: [/energy/i, /dynamic/i, /active/i, /motivat/i, /pump/i],
};

// E-commerce indicators
const ECOMMERCE_PATTERNS = [
  /e-?commerce/i,
  /online\s+(store|shop|order)/i,
  /sell(ing)?\s+(products?|online)/i,
  /shopping\s*cart/i,
  /checkout/i,
  /ship(ping)?/i,
  /buy\s+online/i,
];

// Booking indicators
const BOOKING_PATTERNS = [
  /book(ing)?/i,
  /appoint/i,
  /reserv/i,
  /schedul/i,
  /slot/i,
  /calendar/i,
];

// Compliance indicators
const COMPLIANCE_PATTERNS: Record<string, RegExp> = {
  'age_verification': /21\+|18\+|age\s*verif|adult/i,
  'hipaa': /hipaa|health\s*information|medical\s*privacy/i,
  'license_required': /licens|certif|insur/i,
  'disclaimer': /disclaimer|legal\s*notice/i,
};

/**
 * Extracts a business name from the prompt
 */
function extractBusinessName(prompt: string): string | null {
  // Pattern: "for [Business Name]" or "[Business Name] website"
  const forPattern = /(?:for|called|named)\s+["']?([A-Z][A-Za-z0-9\s&']+?)["']?(?:\s+(?:website|site|in|based)|$|,|\.|!)/i;
  const match = prompt.match(forPattern);
  if (match) return match[1].trim();

  // Pattern: business name at start
  const startPattern = /^["']?([A-Z][A-Za-z0-9\s&']+?)["']?\s+(?:is|website|site|-)/i;
  const startMatch = prompt.match(startPattern);
  if (startMatch) return startMatch[1].trim();

  return null;
}

/**
 * Detects the industry from the prompt
 */
function detectIndustry(prompt: string): { industry: string; baseOfferings: string[] } {
  const lowerPrompt = prompt.toLowerCase();

  for (const [industry, config] of Object.entries(INDUSTRY_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(prompt)) {
        return { industry, baseOfferings: config.baseOfferings };
      }
    }
  }

  // Default to generic service if no match
  return {
    industry: 'service_general',
    baseOfferings: ['Quality Service', 'Expert Team', 'Customer Satisfaction', 'Free Consultation'],
  };
}

/**
 * Extracts location information
 */
function extractLocation(prompt: string): BusinessBrief['location'] {
  const cityMatch = prompt.match(LOCATION_PATTERNS.city);
  const stateMatch = prompt.match(LOCATION_PATTERNS.state);
  const countryMatch = prompt.match(LOCATION_PATTERNS.country);

  if (!cityMatch && !stateMatch && !countryMatch) return null;

  return {
    city: cityMatch?.[1]?.trim(),
    state: stateMatch?.[1]?.trim() || stateMatch?.[2]?.trim(),
    country: countryMatch?.[1]?.trim(),
  };
}

/**
 * Extracts offerings/services mentioned
 */
function extractOfferings(prompt: string, baseOfferings: string[]): string[] {
  const offerings = new Set<string>();

  // Add base offerings
  baseOfferings.forEach((o) => offerings.add(o));

  // Extract quoted items
  const quotedPattern = /"([^"]+)"|'([^']+)'/g;
  let match;
  while ((match = quotedPattern.exec(prompt)) !== null) {
    const item = (match[1] || match[2]).trim();
    if (item.length > 2 && item.length < 50) {
      offerings.add(item);
    }
  }

  // Extract items after "offering", "selling", "providing"
  const servicePattern = /(?:offer|sell|provid|specializ|featur)(?:ing|s|e)?\s+(?:in\s+)?([^,.]+)/gi;
  while ((match = servicePattern.exec(prompt)) !== null) {
    const items = match[1].split(/\s+and\s+|\s*,\s*/);
    items.forEach((item) => {
      const clean = item.trim();
      if (clean.length > 2 && clean.length < 50) {
        offerings.add(clean.charAt(0).toUpperCase() + clean.slice(1));
      }
    });
  }

  return Array.from(offerings).slice(0, 8);
}

/**
 * Detects the primary conversion goal
 */
function detectPrimaryGoal(prompt: string, industry: string): PrimaryGoal {
  // Check explicit goal patterns first
  for (const [goal, patterns] of Object.entries(GOAL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(prompt)) {
        return goal as PrimaryGoal;
      }
    }
  }

  // Infer from industry
  const industryGoalMap: Record<string, PrimaryGoal> = {
    'pressure_washing': 'leads',
    'plumbing': 'calls',
    'auto_detailing': 'bookings',
    'restaurant': 'bookings',
    'bakery': 'visits',
    'law_firm': 'leads',
    'dental': 'bookings',
    'salon': 'bookings',
    'yoga_fitness': 'signups',
    'retail_general': 'visits',
    'lighter_shop': 'visits',
    'dispensary': 'visits',
    'saas': 'signups',
    'photography': 'bookings',
    'landscaping': 'leads',
    'hvac': 'calls',
    'roofing': 'leads',
    'real_estate': 'leads',
    'insurance': 'leads',
    'pet_services': 'bookings',
    'cleaning': 'leads',
    'moving': 'leads',
    'tutoring': 'bookings',
    'nonprofit': 'donations',
  };

  return industryGoalMap[industry] || 'leads';
}

/**
 * Detects tone/style preferences
 */
function detectTone(prompt: string, industry: string): string[] {
  const tones: string[] = [];

  for (const [tone, patterns] of Object.entries(TONE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(prompt)) {
        tones.push(tone);
        break;
      }
    }
  }

  // Add industry-based default tones if none detected
  if (tones.length === 0) {
    const industryToneMap: Record<string, string[]> = {
      'law_firm': ['professional', 'trustworthy'],
      'dental': ['friendly', 'professional'],
      'salon': ['friendly', 'modern'],
      'yoga_fitness': ['energetic', 'friendly'],
      'saas': ['modern', 'professional'],
      'restaurant': ['friendly', 'warm'],
      'dispensary': ['modern', 'friendly'],
      'lighter_shop': ['premium', 'trustworthy'],
    };
    return industryToneMap[industry] || ['professional', 'friendly'];
  }

  return tones.slice(0, 3);
}

/**
 * Generates SEO keywords from the brief
 */
function generateSeoKeywords(
  industry: string,
  offerings: string[],
  location: BusinessBrief['location']
): BusinessBrief['seo'] {
  const primaryKeywords: string[] = [];
  const serviceAreaKeywords: string[] = [];

  // Add industry keywords
  const industryKeywordMap: Record<string, string[]> = {
    'pressure_washing': ['pressure washing', 'power washing', 'exterior cleaning', 'driveway cleaning'],
    'plumbing': ['plumber', 'plumbing services', 'drain cleaning', 'pipe repair'],
    'auto_detailing': ['auto detailing', 'car detailing', 'mobile detailing', 'ceramic coating'],
    'restaurant': ['restaurant', 'dining', 'food', 'cuisine'],
    'law_firm': ['attorney', 'lawyer', 'legal services', 'law firm'],
    'dental': ['dentist', 'dental care', 'family dentist', 'dental services'],
    'saas': ['software', 'platform', 'solution', 'app'],
  };

  primaryKeywords.push(...(industryKeywordMap[industry] || [industry.replace(/_/g, ' ')]));

  // Add offering-based keywords
  offerings.slice(0, 4).forEach((offering) => {
    primaryKeywords.push(offering.toLowerCase());
  });

  // Add location-based keywords
  if (location?.city) {
    primaryKeywords.forEach((kw) => {
      serviceAreaKeywords.push(`${kw} ${location.city}`);
      serviceAreaKeywords.push(`${kw} near ${location.city}`);
    });
    serviceAreaKeywords.push(`${location.city} ${industry.replace(/_/g, ' ')}`);
  }

  if (location?.state) {
    serviceAreaKeywords.push(`${industry.replace(/_/g, ' ')} ${location.state}`);
  }

  return {
    primaryKeywords: primaryKeywords.slice(0, 10),
    serviceAreaKeywords: serviceAreaKeywords.slice(0, 6),
  };
}

/**
 * Checks if the business needs e-commerce
 */
function needsEcommerce(prompt: string, industry: string): boolean {
  // Explicit e-commerce indicators
  for (const pattern of ECOMMERCE_PATTERNS) {
    if (pattern.test(prompt)) return true;
  }

  // Industry-based defaults
  const ecommerceIndustries = ['retail_general', 'lighter_shop'];
  return ecommerceIndustries.includes(industry);
}

/**
 * Checks if the business needs booking
 */
function needsBooking(prompt: string, industry: string): boolean {
  // Explicit booking indicators
  for (const pattern of BOOKING_PATTERNS) {
    if (pattern.test(prompt)) return true;
  }

  // Industry-based defaults
  const bookingIndustries = ['salon', 'dental', 'yoga_fitness', 'auto_detailing', 'photography', 'restaurant', 'tutoring', 'pet_services'];
  return bookingIndustries.includes(industry);
}

/**
 * Detects compliance requirements
 */
function detectComplianceNotes(prompt: string, industry: string): string[] {
  const notes: string[] = [];

  for (const [note, pattern] of Object.entries(COMPLIANCE_PATTERNS)) {
    if (pattern.test(prompt)) {
      notes.push(note);
    }
  }

  // Industry-specific compliance
  if (industry === 'dispensary') {
    notes.push('age_verification');
  }
  if (['dental', 'healthcare'].includes(industry)) {
    notes.push('hipaa');
  }
  if (['plumbing', 'hvac', 'roofing', 'electrical'].some((i) => industry.includes(i))) {
    notes.push('license_required');
  }

  return [...new Set(notes)];
}

/**
 * Infers differentiators from the prompt
 */
function inferDifferentiators(prompt: string, industry: string): string[] {
  const differentiators: string[] = [];

  // Common differentiator patterns
  const patterns: Record<string, RegExp> = {
    'Family-Owned': /family[\s-]owned|family\s+business/i,
    'Locally-Owned': /local(ly)?[\s-]owned|local\s+business/i,
    'Years of Experience': /(\d+)\s*(?:\+\s*)?years?/i,
    'Licensed & Insured': /licensed|insured/i,
    'Free Estimates': /free\s+(quote|estimate|consult)/i,
    'Same-Day Service': /same[\s-]day|emergency|24.?7/i,
    'Satisfaction Guaranteed': /guarant|satisf/i,
    'Award-Winning': /award|best\s+of|top\s+rated/i,
  };

  for (const [diff, pattern] of Object.entries(patterns)) {
    if (pattern.test(prompt)) {
      differentiators.push(diff);
    }
  }

  // Add generic differentiators if none found
  if (differentiators.length === 0) {
    const industryDiffs: Record<string, string[]> = {
      'service_general': ['Quality Service', 'Expert Team', 'Customer Focused'],
      'pressure_washing': ['Powerful Equipment', 'Eco-Friendly Solutions', 'Same-Day Service'],
      'restaurant': ['Fresh Ingredients', 'Family Recipes', 'Cozy Atmosphere'],
      'law_firm': ['Proven Results', 'Personal Attention', 'Free Consultation'],
    };
    differentiators.push(...(industryDiffs[industry] || industryDiffs['service_general']));
  }

  return differentiators.slice(0, 4);
}

/**
 * Main function: Extract BusinessBrief from user prompt
 */
export function extractBusinessBrief(prompt: string): BusinessBrief {
  const businessName = extractBusinessName(prompt);
  const { industry, baseOfferings } = detectIndustry(prompt);
  const location = extractLocation(prompt);
  const offerings = extractOfferings(prompt, baseOfferings);
  const primaryGoal = detectPrimaryGoal(prompt, industry);
  const tone = detectTone(prompt, industry);
  const differentiators = inferDifferentiators(prompt, industry);
  const complianceNotes = detectComplianceNotes(prompt, industry);
  const seo = generateSeoKeywords(industry, offerings, location);

  // Generate appropriate CTAs
  const ctaOptions = GOAL_TO_CTA[primaryGoal];
  const primaryCTA = ctaOptions[0];
  const secondaryCTA = ctaOptions.length > 1 ? ctaOptions[1] : null;

  return {
    businessName,
    industry,
    location,
    offerings,
    targetCustomers: null, // Could be extracted with more patterns
    differentiators,
    tone,
    primaryGoal,
    primaryCTA,
    secondaryCTA,
    needsEcommerce: needsEcommerce(prompt, industry),
    needsBooking: needsBooking(prompt, industry),
    complianceNotes,
    seo,
  };
}
