import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Disallowed content patterns
const DISALLOWED_PATTERNS = [
  /\b(porn|xxx|adult\s*content|explicit|nsfw)\b/i,
  /\b(weapon|gun|bomb|explosive|terrorism)\b/i,
  /\b(drugs|cocaine|heroin|meth)\b/i,
  /\b(hate|racist|nazi)\b/i,
];

const SYSTEM_PROMPT = `You are a website prompt refiner. Your job is to enhance user prompts to produce better first-draft websites. CRITICAL: Never add "Excellion" or any platform branding to business names or content.

RULES:
1. PRESERVE everything explicit the user provided (colors, features, location, pricing, business name, etc.)
2. NEVER invent specific facts (addresses, years in business, awards) unless user provided them
3. ADD structure and high-value defaults:
   - Suggested tone (professional, friendly, bold, minimal, etc.)
   - Trust signals (reviews CTA, certifications section, etc.)
   - Strong CTA appropriate to the business type
   - Page suggestions (home, about, services, contact)
   - Layout guidance (hero style, section order)
   - SEO intent keywords
4. If prompt is extremely short (<15 words), be conservative and note assumptions
5. Keep refinedPrompt under 1200 characters
6. Output clean text only - no markdown, no bullet points
7. Focus on what makes this business type convert well

Respond with ONLY valid JSON in this exact format:
{
  "refinedPrompt": "the improved prompt text here",
  "meta": {
    "detectedIndustry": "industry name or null",
    "inferredGoals": ["goal1", "goal2"],
    "inferredTone": "professional/friendly/bold/minimal/etc",
    "assumptions": ["assumption1 if any"],
    "confidence": "low/medium/high"
  }
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { originalPrompt, context } = await req.json();
    
    if (!originalPrompt || typeof originalPrompt !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Missing or invalid originalPrompt' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for disallowed content
    for (const pattern of DISALLOWED_PATTERNS) {
      if (pattern.test(originalPrompt)) {
        console.log('[REFINER] Blocked disallowed content');
        return new Response(JSON.stringify({ 
          error: 'Content not allowed',
          blocked: true,
          message: 'This type of content cannot be used to generate websites. Please try a different prompt.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!LOVABLE_API_KEY) {
      console.error('[REFINER] LOVABLE_API_KEY not configured');
      // Fallback: return original prompt
      return new Response(JSON.stringify({
        refinedPrompt: originalPrompt,
        meta: {
          detectedIndustry: null,
          inferredGoals: [],
          inferredTone: 'professional',
          assumptions: ['API key not configured - using original prompt'],
          confidence: 'low'
        },
        fallback: true,
        latencyMs: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userMessage = `Refine this website prompt:

"${originalPrompt}"

${context?.source ? `Source: ${context.source}` : ''}
${context?.locale ? `Locale: ${context.locale}` : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[REFINER] AI gateway error:', response.status, errorText);
      
      // Fallback on error
      return new Response(JSON.stringify({
        refinedPrompt: originalPrompt,
        meta: {
          detectedIndustry: null,
          inferredGoals: [],
          inferredTone: 'professional',
          assumptions: ['AI service unavailable - using original prompt'],
          confidence: 'low'
        },
        fallback: true,
        latencyMs: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('[REFINER] No content in response');
      return new Response(JSON.stringify({
        refinedPrompt: originalPrompt,
        meta: { confidence: 'low', assumptions: ['No AI response'] },
        fallback: true,
        latencyMs: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON from response
    let parsed;
    try {
      // Try to extract JSON from the response (may have markdown wrapper)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseErr) {
      console.error('[REFINER] JSON parse error:', parseErr);
      return new Response(JSON.stringify({
        refinedPrompt: originalPrompt,
        meta: { confidence: 'low', assumptions: ['Failed to parse AI response'] },
        fallback: true,
        latencyMs: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const latencyMs = Date.now() - startTime;
    console.log(`[REFINER] Success in ${latencyMs}ms, confidence: ${parsed.meta?.confidence}`);

    return new Response(JSON.stringify({
      refinedPrompt: parsed.refinedPrompt || originalPrompt,
      meta: parsed.meta || {},
      fallback: false,
      latencyMs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[REFINER] Error:', error);
    
    // Always fallback gracefully
    return new Response(JSON.stringify({
      refinedPrompt: '',
      meta: { confidence: 'low', assumptions: ['Server error - using original prompt'] },
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      latencyMs: Date.now() - startTime
    }), {
      status: 200, // Return 200 so client can use fallback
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
