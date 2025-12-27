// Diversity Guardrail - Check against layout signature repetition
import { 
  computeSignature, 
  isGenericSignature, 
  signatureSimilarity, 
  getRecentSignatures, 
  storeSignature,
  type LayoutSignature 
} from './layoutSignature';
import type { SiteSpec } from '@/types/site-spec';

export type DiversityResult = {
  valid: boolean;
  issues: string[];
  isRepeat: boolean;
  isGeneric: boolean;
  signature: LayoutSignature;
};

const SIMILARITY_THRESHOLD = 0.85;

export function checkDiversity(spec: SiteSpec): DiversityResult {
  const signature = computeSignature(spec);
  const issues: string[] = [];
  let isRepeat = false;
  
  // Check if generic
  const isGeneric = isGenericSignature(signature);
  if (isGeneric) {
    issues.push('Layout matches generic single-page pattern. Consider adding more pages or unique sections.');
  }
  
  // Check against recent signatures
  const recentHashes = getRecentSignatures();
  if (recentHashes.includes(signature.hash)) {
    issues.push('This exact layout was recently generated. Diversifying...');
    isRepeat = true;
  }
  
  return {
    valid: issues.length === 0,
    issues,
    isRepeat,
    isGeneric,
    signature,
  };
}

export function recordGeneration(spec: SiteSpec): void {
  const signature = computeSignature(spec);
  storeSignature(signature);
}

// Get alternative archetype suggestions when diversity fails
export function getSuggestedAlternatives(
  currentArchetypeId: string, 
  availableArchetypes: string[]
): string[] {
  // Filter out current archetype and return alternatives
  return availableArchetypes
    .filter(id => id !== currentArchetypeId)
    .slice(0, 3);
}
