import { supabase } from '@/integrations/supabase/client';

export interface RefinerMeta {
  detectedIndustry?: string | null;
  inferredGoals?: string[];
  inferredTone?: string;
  assumptions?: string[];
  confidence?: 'low' | 'medium' | 'high';
}

export interface RefinerResult {
  refinedPrompt: string;
  meta: RefinerMeta;
  fallback: boolean;
  latencyMs?: number;
  error?: string;
}

export interface RefinerContext {
  source?: 'hero' | 'builder' | 'interview';
  locale?: string;
  userPlan?: string;
}

const REFINER_TIMEOUT_MS = 3500; // 3.5 second timeout

/**
 * Refines a user prompt using AI to improve website generation quality.
 * Falls back to original prompt on any error/timeout.
 */
export async function refinePrompt(
  originalPrompt: string,
  context?: RefinerContext
): Promise<RefinerResult> {
  const startTime = Date.now();
  
  // Return original for very short prompts (let the refiner handle internally)
  if (!originalPrompt || originalPrompt.trim().length < 3) {
    return {
      refinedPrompt: originalPrompt,
      meta: { confidence: 'low', assumptions: ['Prompt too short for refinement'] },
      fallback: true,
      latencyMs: 0,
    };
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REFINER_TIMEOUT_MS);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prompt-refiner`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ originalPrompt, context }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Check if content was blocked
      if (errorData.blocked) {
        throw new Error(errorData.message || 'Content not allowed');
      }
      
      console.warn('[PromptRefiner] Non-OK response:', response.status);
      return {
        refinedPrompt: originalPrompt,
        meta: { confidence: 'low' },
        fallback: true,
        latencyMs: Date.now() - startTime,
      };
    }

    const data: RefinerResult = await response.json();
    
    // If the API returned a fallback or empty refined prompt, use original
    if (data.fallback || !data.refinedPrompt) {
      return {
        refinedPrompt: originalPrompt,
        meta: data.meta || { confidence: 'low' },
        fallback: true,
        latencyMs: data.latencyMs || (Date.now() - startTime),
      };
    }

    console.log(`[PromptRefiner] Success in ${data.latencyMs}ms, confidence: ${data.meta?.confidence}`);
    
    return {
      refinedPrompt: data.refinedPrompt,
      meta: data.meta || {},
      fallback: false,
      latencyMs: data.latencyMs,
    };

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[PromptRefiner] Timeout after ${latencyMs}ms`);
        return {
          refinedPrompt: originalPrompt,
          meta: { confidence: 'low', assumptions: ['Refinement timed out'] },
          fallback: true,
          latencyMs,
        };
      }
      
      // Re-throw blocked content errors
      if (error.message.includes('Content not allowed')) {
        throw error;
      }
    }

    console.error('[PromptRefiner] Error:', error);
    return {
      refinedPrompt: originalPrompt,
      meta: { confidence: 'low' },
      fallback: true,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Storage key for the setting
const AUTO_IMPROVE_SETTING_KEY = 'excellion_auto_improve_prompts';

/**
 * Get the auto-improve prompts setting (default: true)
 */
export function getAutoImproveEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(AUTO_IMPROVE_SETTING_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * Set the auto-improve prompts setting
 */
export function setAutoImproveEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_IMPROVE_SETTING_KEY, String(enabled));
}
