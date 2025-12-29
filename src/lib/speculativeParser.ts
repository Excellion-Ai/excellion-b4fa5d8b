/**
 * Speculative JSON Parser
 * Attempts to parse partial JSON from streaming AI responses
 * to enable progressive rendering before generation completes
 */

import { SiteSpec } from '@/types/site-spec';

// Minimum tokens before attempting speculative parse
const MIN_TOKENS_FOR_PARSE = 200;

// How often to attempt parsing (every N tokens)
const PARSE_INTERVAL_TOKENS = 150;

export interface SpeculativeResult {
  spec: Partial<SiteSpec> | null;
  confidence: 'low' | 'medium' | 'high';
  parsedFields: string[];
  rawLength: number;
}

/**
 * Attempt to extract a partial SiteSpec from incomplete JSON
 */
export function speculativeParse(rawResponse: string, lastTokenCount: number): SpeculativeResult | null {
  // Don't parse too early or too frequently
  if (lastTokenCount < MIN_TOKENS_FOR_PARSE) return null;
  if (lastTokenCount % PARSE_INTERVAL_TOKENS > 50) return null;

  // Find JSON block
  const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)(?:```|$)/);
  if (!jsonMatch) {
    // Try without code fence
    const braceMatch = rawResponse.match(/\{[\s\S]*$/);
    if (!braceMatch) return null;
  }

  const jsonContent = jsonMatch?.[1] || rawResponse.match(/\{[\s\S]*$/)?.[0] || '';
  if (!jsonContent || jsonContent.length < 50) return null;

  try {
    // First, try complete parse
    const complete = JSON.parse(jsonContent);
    return {
      spec: complete as Partial<SiteSpec>,
      confidence: 'high',
      parsedFields: Object.keys(complete),
      rawLength: jsonContent.length,
    };
  } catch {
    // Incomplete JSON - try to repair
    return attemptRepair(jsonContent);
  }
}

/**
 * Attempt to repair incomplete JSON by closing open structures
 */
function attemptRepair(partial: string): SpeculativeResult | null {
  let repaired = partial;
  const parsedFields: string[] = [];

  // Track open structures
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escaped = false;

  for (const char of partial) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
  }

  // If we're in a string, close it
  if (inString) {
    repaired += '"';
  }

  // Remove trailing comma
  repaired = repaired.replace(/,\s*$/, '');

  // Close arrays then objects
  while (brackets > 0) {
    repaired += ']';
    brackets--;
  }
  while (braces > 0) {
    repaired += '}';
    braces--;
  }

  try {
    const parsed = JSON.parse(repaired);
    
    // Determine confidence based on what we have
    const hasName = !!parsed.name;
    const hasTheme = !!parsed.theme;
    const hasPages = Array.isArray(parsed.pages) && parsed.pages.length > 0;
    const hasCompletePage = hasPages && parsed.pages[0]?.sections?.length > 0;

    if (hasName) parsedFields.push('name');
    if (hasTheme) parsedFields.push('theme');
    if (hasPages) parsedFields.push('pages');
    if (parsed.navigation) parsedFields.push('navigation');
    if (parsed.footer) parsedFields.push('footer');

    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (hasName && hasTheme) confidence = 'medium';
    if (hasCompletePage) confidence = 'high';

    return {
      spec: parsed as Partial<SiteSpec>,
      confidence,
      parsedFields,
      rawLength: repaired.length,
    };
  } catch {
    // Still can't parse - extract individual fields
    return extractFields(partial);
  }
}

/**
 * Last resort: extract individual recognizable fields
 */
function extractFields(partial: string): SpeculativeResult | null {
  const result: Partial<SiteSpec> = {};
  const parsedFields: string[] = [];

  // Extract name
  const nameMatch = partial.match(/"name"\s*:\s*"([^"]+)"/);
  if (nameMatch) {
    result.name = nameMatch[1];
    parsedFields.push('name');
  }

  // Extract theme colors
  const primaryMatch = partial.match(/"primaryColor"\s*:\s*"(#[a-fA-F0-9]{6})"/);
  const secondaryMatch = partial.match(/"secondaryColor"\s*:\s*"(#[a-fA-F0-9]{6})"/);
  if (primaryMatch || secondaryMatch) {
    result.theme = {
      primaryColor: primaryMatch?.[1] || '#3b82f6',
      secondaryColor: secondaryMatch?.[1] || '#1e3a5f',
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      darkMode: true,
      fontHeading: 'Inter',
      fontBody: 'Inter',
    };
    parsedFields.push('theme');
  }

  // Extract layout structure
  const layoutMatch = partial.match(/"layoutStructure"\s*:\s*"(\w+)"/);
  if (layoutMatch) {
    result.layoutStructure = layoutMatch[1] as any;
    parsedFields.push('layoutStructure');
  }

  if (parsedFields.length === 0) return null;

  return {
    spec: result,
    confidence: 'low',
    parsedFields,
    rawLength: partial.length,
  };
}

/**
 * Check if we should attempt a speculative parse based on token count
 */
export function shouldAttemptParse(tokenCount: number, lastParseTokenCount: number): boolean {
  if (tokenCount < MIN_TOKENS_FOR_PARSE) return false;
  if (tokenCount - lastParseTokenCount < PARSE_INTERVAL_TOKENS) return false;
  return true;
}

/**
 * Merge speculative spec with existing spec (if speculative has more data)
 */
export function mergeSpeculative(
  current: Partial<SiteSpec> | null,
  speculative: Partial<SiteSpec>
): Partial<SiteSpec> {
  if (!current) return speculative;

  const merged = { ...current };

  // Only update if speculative has more data
  if (!merged.name && speculative.name) merged.name = speculative.name;
  if (!merged.theme && speculative.theme) merged.theme = speculative.theme;
  if (!merged.navigation && speculative.navigation) merged.navigation = speculative.navigation;
  if (!merged.footer && speculative.footer) merged.footer = speculative.footer;
  if (!merged.layoutStructure && speculative.layoutStructure) merged.layoutStructure = speculative.layoutStructure;

  // Merge pages carefully
  if (speculative.pages && speculative.pages.length > 0) {
    if (!merged.pages || merged.pages.length === 0) {
      merged.pages = speculative.pages;
    } else if (speculative.pages.length > merged.pages.length) {
      merged.pages = speculative.pages;
    } else {
      // Check if speculative has more sections
      const currentSections = merged.pages.reduce((acc, p) => acc + (p.sections?.length || 0), 0);
      const specSections = speculative.pages.reduce((acc, p) => acc + (p.sections?.length || 0), 0);
      if (specSections > currentSections) {
        merged.pages = speculative.pages;
      }
    }
  }

  return merged;
}
