import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[HELP-CHAT] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[HELP-CHAT] Processing request with', messages.length, 'messages');

    // Fetch global instructions from knowledge base
    let globalInstructions = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        console.log('[HELP-CHAT] Fetching global instructions...');
        const globalResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/knowledge_base?name=eq.__global_instructions__&select=content&limit=1`,
          {
            headers: {
              "apikey": SUPABASE_SERVICE_ROLE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }
        );
        
        if (globalResponse.ok) {
          const entries = await globalResponse.json();
          if (entries && entries.length > 0 && entries[0].content) {
            globalInstructions = entries[0].content;
            console.log('[HELP-CHAT] Global instructions loaded successfully');
          } else {
            console.log('[HELP-CHAT] No global instructions found');
          }
        } else {
          console.log('[HELP-CHAT] Global instructions fetch failed:', globalResponse.status);
        }
      } catch (e) {
        console.error('[HELP-CHAT] Error fetching global instructions:', e);
      }
    } else {
      console.log('[HELP-CHAT] Skipping global instructions (missing env vars)');
    }

    // Master Blueprint context for architecture-aligned responses
    const masterBlueprint = `
## EXCELLION MASTER BLUEPRINT CONTEXT

You are supporting users of Excellion Secret Builder - a high-end, AI-powered website builder.

### Technical Architecture (for accurate support):
- **Database**: Supabase (core table: generated_sites, builder_projects)
- **AI Generation**: Handled via Edge Functions (bot-chat, generate-site, builder-agent)
- **Models**: Gemini 2.5 Flash for site generation, Gemini 2.5 Flash Image for visuals
- **Workflow**: Two-step process: 1. Architect Plan (UX Flow) -> 2. Developer Implementation

### Design System:
- Framework: Tailwind CSS
- Default Theme: High-Tech Dark Mode (Slate-900 backgrounds, slate-50 text, gold accents)
- Typography: Inter font with professional hierarchy

### Key Features to Reference:
- Three-layer image system ensures professional stock photos
- Hero variants: split, centered, glassmorphism, minimal
- Layout structures: Bento, F-Pattern, Editorial Split, Brutalist
- Publishing to lovable.app subdomain
- Custom domains for paid plans

### Security:
- Row Level Security (RLS) ensures users only access their own sites
- All API keys stored in Edge Function Secrets

When answering questions, align responses with this architecture.
`;

    // Combine system prompts - global instructions enhance the base prompt
    const basePrompt = systemPrompt || 'You are a helpful assistant for Excellion Secret Builder.';
    const enhancedSystemPrompt = globalInstructions 
      ? `${basePrompt}\n\n${masterBlueprint}\n\n## KNOWLEDGE BASE\nUse the following knowledge to answer questions about features, integrations, billing, and technical details:\n\n${globalInstructions}`
      : `${basePrompt}\n\n${masterBlueprint}`;

    console.log('[HELP-CHAT] Calling AI with enhanced prompt');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          ...messages
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HELP-CHAT] AI API error:', response.status, errorText);
      
      // Parse GPT-5 specific errors
      let errorCode = "AI_ERROR";
      let errorMessage = "Failed to get AI response";
      try {
        const errorJson = JSON.parse(errorText);
        const apiError = errorJson.error?.message || errorJson.error || "";
        if (apiError.includes("Invalid parameter: temperature")) {
          errorCode = "GPT5_PARAM_TEMPERATURE";
          errorMessage = "Model configuration error";
        } else if (apiError.includes("Invalid parameter: max_tokens")) {
          errorCode = "GPT5_PARAM_MAX_TOKENS";
          errorMessage = "Model configuration error";
        }
        console.error(`[HELP-CHAT] Error code: ${errorCode}`);
      } catch {}
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMIT' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please check your account.', code: 'USAGE_LIMIT' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: errorMessage, code: errorCode }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || 'No response generated';

    console.log('[HELP-CHAT] Response generated successfully');

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[HELP-CHAT] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
