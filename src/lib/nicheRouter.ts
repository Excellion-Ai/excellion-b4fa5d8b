// Universal Niche Router - Deterministic category + goal + integrations detection

export type NicheCategory = 
  | 'ecommerce' 
  | 'reseller' 
  | 'restaurant' 
  | 'local_service' 
  | 'saas' 
  | 'course' 
  | 'coaching' 
  | 'event' 
  | 'real_estate' 
  | 'nonprofit' 
  | 'portfolio' 
  | 'community'
  | 'fitness';

export type ConversionGoal = 
  | 'buy_now' 
  | 'book' 
  | 'request_quote' 
  | 'apply' 
  | 'register' 
  | 'subscribe' 
  | 'donate' 
  | 'visit';

export type IntegrationType = 
  | 'stripe' 
  | 'calendly' 
  | 'maps' 
  | 'email_capture' 
  | 'ordering' 
  | 'reservations' 
  | 'analytics';

export type NicheRoute = {
  category: NicheCategory;
  goal: ConversionGoal;
  integrationsNeeded: IntegrationType[];
  confidence: number;
  clarifyingQuestions?: string[];
};

// Goal word patterns - highest priority
const GOAL_PATTERNS: { pattern: RegExp; goal: ConversionGoal }[] = [
  { pattern: /\b(order|checkout|buy|cart|purchase|shop)\b/i, goal: 'buy_now' },
  { pattern: /\b(book|appointment|schedule|session|consult)\b/i, goal: 'book' },
  { pattern: /\b(estimate|quote|pricing|bid)\b/i, goal: 'request_quote' },
  { pattern: /\b(apply|application|join|enroll)\b/i, goal: 'apply' },
  { pattern: /\b(ticket|register|event|attend|rsvp)\b/i, goal: 'register' },
  { pattern: /\b(subscribe|newsletter|updates|notify)\b/i, goal: 'subscribe' },
  { pattern: /\b(donate|support|give|contribute|sponsor)\b/i, goal: 'donate' },
];

// Category detection patterns
const CATEGORY_PATTERNS: { patterns: RegExp[]; category: NicheCategory; baseIntegrations: IntegrationType[] }[] = [
  {
    category: 'ecommerce',
    patterns: [/\b(store|shop|products?|merch|sell|ecommerce|retail)\b/i],
    baseIntegrations: ['stripe', 'analytics'],
  },
  {
    category: 'reseller',
    patterns: [/\b(resell|drop|streetwear|sneaker|vintage|thrift|consignment|flip)\b/i],
    baseIntegrations: ['stripe', 'analytics'],
  },
  {
    category: 'restaurant',
    patterns: [/\b(restaurant|cafe|pizza|sushi|bar|diner|bistro|food|bakery|catering|kitchen)\b/i],
    baseIntegrations: ['ordering', 'reservations', 'maps'],
  },
  {
    category: 'local_service',
    patterns: [/\b(plumb|hvac|electric|clean|repair|lawn|landscap|roof|paint|handyman|detail|mobile|service|contractor)\b/i],
    baseIntegrations: ['calendly', 'maps', 'email_capture'],
  },
  {
    category: 'saas',
    patterns: [/\b(saas|software|app|platform|dashboard|analytics|api|cloud|ai)\b/i],
    baseIntegrations: ['stripe', 'analytics', 'email_capture'],
  },
  {
    category: 'course',
    patterns: [/\b(course|class|training|curriculum|learn|education|workshop|bootcamp|lesson)\b/i],
    baseIntegrations: ['stripe', 'email_capture'],
  },
  {
    category: 'coaching',
    patterns: [/\b(coach|mentor|consult|advisor|therapist|counsel|transform)\b/i],
    baseIntegrations: ['calendly', 'stripe', 'email_capture'],
  },
  {
    category: 'event',
    patterns: [/\b(event|conference|summit|festival|concert|show|gala|meetup)\b/i],
    baseIntegrations: ['stripe', 'email_capture'],
  },
  {
    category: 'real_estate',
    patterns: [/\b(real estate|property|listing|home|house|apartment|realtor|broker|mortgage)\b/i],
    baseIntegrations: ['email_capture', 'maps', 'calendly'],
  },
  {
    category: 'nonprofit',
    patterns: [/\b(nonprofit|charity|foundation|ngo|cause|mission|volunteer|donate)\b/i],
    baseIntegrations: ['stripe', 'email_capture'],
  },
  {
    category: 'portfolio',
    patterns: [/\b(portfolio|designer|artist|photographer|freelance|creative|personal brand)\b/i],
    baseIntegrations: ['email_capture'],
  },
  {
    category: 'community',
    patterns: [/\b(community|membership|club|forum|group|network|association)\b/i],
    baseIntegrations: ['stripe', 'email_capture'],
  },
  {
    category: 'fitness',
    patterns: [/\b(gym|fitness|yoga|pilates|crossfit|personal train|workout|strength|boxing|martial art|athletic)\b/i],
    baseIntegrations: ['stripe', 'calendly'],
  },
];

// Integration keyword additions
const INTEGRATION_KEYWORDS: { pattern: RegExp; integration: IntegrationType }[] = [
  { pattern: /\b(checkout|payment|pay|stripe|credit card)\b/i, integration: 'stripe' },
  { pattern: /\b(book|appointment|calendar|calendly|schedule)\b/i, integration: 'calendly' },
  { pattern: /\b(location|map|address|directions|zip code|service area)\b/i, integration: 'maps' },
  { pattern: /\b(newsletter|email|subscribe|updates)\b/i, integration: 'email_capture' },
  { pattern: /\b(order|doordash|ubereats|delivery|pickup)\b/i, integration: 'ordering' },
  { pattern: /\b(reservation|opentable|resy|table)\b/i, integration: 'reservations' },
  { pattern: /\b(track|analytics|metrics|data)\b/i, integration: 'analytics' },
];

function detectGoal(input: string, category: NicheCategory): ConversionGoal {
  // Restaurant-specific goal detection
  if (category === 'restaurant') {
    if (/\b(reservation|reserve|table|book|booking)\b/i.test(input)) {
      return 'book';
    }
    if (/\b(order|delivery|pickup|takeout)\b/i.test(input)) {
      return 'buy_now';
    }
    return 'buy_now';
  }

  // Fitness-specific goal detection
  if (category === 'fitness') {
    if (/\b(book|class|session|schedule)\b/i.test(input)) {
      return 'book';
    }
    // Default for fitness is membership subscription
    return 'subscribe';
  }

  for (const { pattern, goal } of GOAL_PATTERNS) {
    if (pattern.test(input)) {
      return goal;
    }
  }
  return 'visit';
}

function detectCategory(input: string): { category: NicheCategory; baseIntegrations: IntegrationType[] } {
  for (const { patterns, category, baseIntegrations } of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        return { category, baseIntegrations };
      }
    }
  }
  return { category: 'local_service', baseIntegrations: ['email_capture', 'maps'] };
}

function detectIntegrations(input: string, baseIntegrations: IntegrationType[]): IntegrationType[] {
  const integrations = new Set<IntegrationType>(baseIntegrations);
  
  for (const { pattern, integration } of INTEGRATION_KEYWORDS) {
    if (pattern.test(input)) {
      integrations.add(integration);
    }
  }
  
  return Array.from(integrations);
}

function calculateConfidence(input: string, category: NicheCategory, goal: ConversionGoal): number {
  let confidence = 0.5;
  
  // Category match adds confidence
  const categoryMatch = CATEGORY_PATTERNS.find(p => p.category === category);
  if (categoryMatch) {
    for (const pattern of categoryMatch.patterns) {
      if (pattern.test(input)) {
        confidence += 0.2;
        break;
      }
    }
  }
  
  // Goal match adds confidence
  if (goal !== 'visit') {
    confidence += 0.15;
  }
  
  // Longer, more specific input adds confidence
  if (input.length > 50) confidence += 0.1;
  if (input.length > 100) confidence += 0.05;
  
  return Math.min(confidence, 1.0);
}

function generateClarifyingQuestions(confidence: number, category: NicheCategory, goal: ConversionGoal): string[] | undefined {
  if (confidence >= 0.75) return undefined;
  
  const questions: string[] = [];
  
  if (goal === 'visit') {
    questions.push('What is the main action you want visitors to take on your site?');
  }
  
  if (category === 'local_service') {
    questions.push('Do you need online booking for appointments or estimates?');
  }
  
  return questions.length > 0 ? questions.slice(0, 2) : undefined;
}

export function routeNiche(input: string): NicheRoute {
  const lowerInput = input.toLowerCase();
  
  // Detect category first so we can use category-specific goal detection
  const { category, baseIntegrations } = detectCategory(lowerInput);
  const goal = detectGoal(lowerInput, category);
  const integrationsNeeded = detectIntegrations(lowerInput, baseIntegrations);
  const confidence = calculateConfidence(lowerInput, category, goal);
  const clarifyingQuestions = generateClarifyingQuestions(confidence, category, goal);
  
  console.log('[NicheRouter] Detected:', { category, goal, integrationsNeeded, confidence });
  
  return {
    category,
    goal,
    integrationsNeeded,
    confidence,
    clarifyingQuestions,
  };
}
