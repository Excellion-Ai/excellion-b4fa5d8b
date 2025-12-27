/**
 * Dynamic credit cost calculation based on prompt complexity and task intensity
 */

export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'intensive';

interface CreditCalculation {
  baseCost: number;
  promptLengthMultiplier: number;
  complexityMultiplier: number;
  attachmentCost: number;
  totalCost: number;
  breakdown: string;
}

// Base costs for different action types
const BASE_COSTS = {
  generation: 3,    // Base cost for initial generation
  edit: 2,          // Base cost for edits
  chat: 1,          // Base cost for chat
  image: 2,         // Image generation
  export: 2,        // Code export
  publish: 0,       // Free
};

// Complexity multipliers based on detected keywords and patterns
const COMPLEXITY_PATTERNS = {
  intensive: {
    patterns: [
      /\b(e-commerce|ecommerce|shop|store|cart|checkout|payment)\b/i,
      /\b(dashboard|admin panel|analytics|crm|cms)\b/i,
      /\b(authentication|login|signup|user management|roles)\b/i,
      /\b(database|backend|api|integration)\b/i,
      /\b(multi-page|multiple pages|several pages)\b/i,
      /\b(complex|advanced|sophisticated|comprehensive)\b/i,
      /\b(animation|interactive|3d|parallax)\b/i,
    ],
    multiplier: 2.0,
  },
  complex: {
    patterns: [
      /\b(form|contact|booking|reservation|appointment)\b/i,
      /\b(gallery|portfolio|showcase|slider|carousel)\b/i,
      /\b(pricing|plans|subscription|membership)\b/i,
      /\b(blog|articles|posts|news)\b/i,
      /\b(testimonials|reviews|ratings)\b/i,
      /\b(map|location|directions)\b/i,
    ],
    multiplier: 1.5,
  },
  moderate: {
    patterns: [
      /\b(landing page|homepage|website)\b/i,
      /\b(about|services|team|features)\b/i,
      /\b(professional|modern|clean|minimal)\b/i,
    ],
    multiplier: 1.2,
  },
  simple: {
    patterns: [],
    multiplier: 1.0,
  },
};

/**
 * Detect task complexity based on prompt content
 */
export function detectComplexity(prompt: string): TaskComplexity {
  // Check patterns in order of complexity (highest first)
  for (const [level, config] of Object.entries(COMPLEXITY_PATTERNS)) {
    if (level === 'simple') continue;
    
    for (const pattern of config.patterns) {
      if (pattern.test(prompt)) {
        return level as TaskComplexity;
      }
    }
  }
  
  return 'simple';
}

/**
 * Calculate prompt length multiplier
 * Longer prompts = more processing = higher cost
 */
function calculatePromptLengthMultiplier(prompt: string): number {
  const charCount = prompt.length;
  const wordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;
  
  // Base thresholds
  if (wordCount <= 20) return 1.0;      // Short prompt
  if (wordCount <= 50) return 1.2;      // Medium prompt
  if (wordCount <= 100) return 1.4;     // Long prompt
  if (wordCount <= 200) return 1.6;     // Very long prompt
  return 1.8;                           // Extremely long prompt
}

/**
 * Calculate attachment cost
 * Images and files add processing overhead
 */
function calculateAttachmentCost(attachmentCount: number, hasImages: boolean): number {
  let cost = 0;
  
  // Each attachment adds base cost
  cost += attachmentCount * 0.5;
  
  // Images require more processing (vision models)
  if (hasImages) {
    cost += 1;
  }
  
  return Math.ceil(cost);
}

/**
 * Main function to calculate dynamic credit cost
 */
export function calculateCreditCost(
  actionType: 'generation' | 'edit' | 'chat' | 'image' | 'export' | 'publish',
  prompt: string,
  options: {
    attachmentCount?: number;
    hasImages?: boolean;
    isFirstGeneration?: boolean;
  } = {}
): CreditCalculation {
  const { attachmentCount = 0, hasImages = false, isFirstGeneration = false } = options;
  
  // Get base cost for action type
  const baseCost = BASE_COSTS[actionType] || 1;
  
  // Calculate prompt length multiplier
  const promptLengthMultiplier = calculatePromptLengthMultiplier(prompt);
  
  // Detect and apply complexity multiplier
  const complexity = detectComplexity(prompt);
  const complexityMultiplier = COMPLEXITY_PATTERNS[complexity].multiplier;
  
  // Calculate attachment cost
  const attachmentCost = calculateAttachmentCost(attachmentCount, hasImages);
  
  // First generation gets a small bonus for the initial setup cost
  const firstGenBonus = isFirstGeneration ? 1 : 0;
  
  // Calculate total (minimum 1 credit)
  const rawTotal = (baseCost * promptLengthMultiplier * complexityMultiplier) + attachmentCost + firstGenBonus;
  const totalCost = Math.max(1, Math.ceil(rawTotal));
  
  // Build breakdown string for transparency
  const breakdownParts = [
    `Base: ${baseCost}`,
    `Length: ×${promptLengthMultiplier.toFixed(1)}`,
    `Complexity (${complexity}): ×${complexityMultiplier.toFixed(1)}`,
  ];
  
  if (attachmentCost > 0) {
    breakdownParts.push(`Attachments: +${attachmentCost}`);
  }
  
  if (firstGenBonus > 0) {
    breakdownParts.push(`First gen: +${firstGenBonus}`);
  }
  
  return {
    baseCost,
    promptLengthMultiplier,
    complexityMultiplier,
    attachmentCost,
    totalCost,
    breakdown: breakdownParts.join(' | '),
  };
}

/**
 * Quick estimate for UI display before full calculation
 */
export function estimateCreditCost(
  actionType: 'generation' | 'edit' | 'chat',
  prompt: string
): { min: number; max: number; estimate: number } {
  const complexity = detectComplexity(prompt);
  const wordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;
  
  const baseCost = BASE_COSTS[actionType];
  
  // Provide a range based on detected complexity
  let min = baseCost;
  let max = baseCost;
  
  switch (complexity) {
    case 'intensive':
      min = Math.ceil(baseCost * 1.5);
      max = Math.ceil(baseCost * 3);
      break;
    case 'complex':
      min = Math.ceil(baseCost * 1.2);
      max = Math.ceil(baseCost * 2.5);
      break;
    case 'moderate':
      min = baseCost;
      max = Math.ceil(baseCost * 2);
      break;
    default:
      min = baseCost;
      max = Math.ceil(baseCost * 1.5);
  }
  
  // Adjust for prompt length
  if (wordCount > 100) {
    max = Math.ceil(max * 1.5);
  }
  
  const estimate = Math.ceil((min + max) / 2);
  
  return { min, max, estimate };
}
