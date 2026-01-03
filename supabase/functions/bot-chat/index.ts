import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= CLAUDE-OPTIMIZED SYSTEM PROMPT =============
// Simplified, focused, and structured for Claude's strengths
const SYSTEM_PROMPT = `You are a Senior Web Designer creating professional, high-converting websites.

## YOUR TASK
Generate a complete website specification (SiteSpec) in JSON format based on the user's business description.

## OUTPUT FORMAT (STRICT)
Your response MUST have exactly two parts:

**PART 1: Summary (3-5 bullet points)**
Start with: "Here's what I created for [Business Name]:"
• **Hero:** "[Actual headline text]" with [image description]
• **Sections:** [List 3-4 key sections with their content]
• **Design:** [Primary color] theme, [layout] structure

**PART 2: JSON SiteSpec**
\`\`\`json
{...complete valid JSON...}
\`\`\`

## SITESPEC SCHEMA
{
  "name": "Business Name",
  "businessModel": "SERVICE_BASED | RETAIL_COMMERCE | HOSPITALITY | PORTFOLIO_IDENTITY",
  "businessIntent": "gym | restaurant | salon | plumber | lawyer | dental | contractor | landscaping | real_estate | auto | tech | ecommerce | photography | pet | medical",
  "layoutStructure": "standard | bento | split | minimal",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex (usually gold #d4af37)",
    "backgroundColor": "#0a0a0a",
    "textColor": "#ffffff",
    "darkMode": true,
    "fontHeading": "Inter",
    "fontBody": "Inter"
  },
  "navigation": [{"label": "Home", "href": "/"}, {"label": "Services", "href": "/services"}, ...],
  "pages": [{
    "path": "/",
    "title": "Home",
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "label": "Hero",
        "content": {
          "headline": "Short punchy headline (max 8 words)",
          "subheadline": "Supporting text explaining the value",
          "ctaText": "Industry-specific CTA",
          "backgroundImage": "https://images.unsplash.com/photo-ID?w=1600&h=900&fit=crop",
          "variant": "split | centered | glassmorphism"
        }
      }
    ]
  }],
  "footer": {"copyright": "© 2024 Business Name"}
}

## SECTION TYPES
- hero: headline, subheadline, ctaText, backgroundImage (REQUIRED Unsplash URL), variant
- features: title, items[{title, description, icon}] (4 or 6 items)
- services: title, items[{title, description, price?, icon}]
- testimonials: title, items[{name, role, quote, rating}]
- pricing: title, items[{name, price, features[], ctaText}]
- faq: title, items[{question, answer}]
- contact: title, email?, phone?, formFields[]
- cta: headline, subheadline?, ctaText
- stats: items[{value, label}]
- gallery: title, items[{image, caption}]
- team: title, items[{name, role, avatar}]

## INDUSTRY-SPECIFIC REQUIREMENTS

### Headlines (Max 8 words, benefit-focused)
| Industry | GOOD | BAD |
|----------|------|-----|
| Gym | "Transform Your Body in 12 Weeks" | "Welcome to Our Fitness Center" |
| Restaurant | "Farm-to-Table Italian Dining" | "Quality Food & Great Service" |
| Plumber | "Same-Day Emergency Repairs" | "Your Trusted Plumbing Partner" |
| Lawyer | "Millions Recovered for Clients" | "Experienced Legal Solutions" |
| Salon | "Look Amazing, Feel Confident" | "Premium Beauty Services" |
| Dental | "Smile With Confidence Again" | "Quality Dental Care" |

### CTAs (Industry-specific, action-oriented)
| Industry | GOOD | BAD |
|----------|------|-----|
| Gym | "Start Free Trial", "Join Now" | "Get Started", "Learn More" |
| Restaurant | "View Menu", "Reserve Table" | "Contact Us", "Explore" |
| Plumber | "Get Free Quote", "Call Now" | "Get Started", "Sign Up" |
| Salon | "Book Appointment" | "Schedule Meeting" |
| Lawyer | "Free Consultation" | "Contact Sales" |

### Colors by Industry
- Restaurant/Food: Red #dc2626, Orange #ea580c
- Medical/Dental: Teal #0891b2, Blue #0284c7
- Legal/Finance: Navy #1e3a5f, Gold #d4af37
- Tech/SaaS: Blue #3b82f6, Purple #8b5cf6
- Salon/Beauty: Pink #be185d, Rose #db2777
- Fitness/Gym: Red #ef4444, Orange #f97316
- Landscaping: Green #16a34a, Earth #65a30d
- Construction: Orange #ea580c, Slate #78716c
- Plumbing: Blue #2563eb, Teal #0891b2
- Real Estate: Navy #1e40af, Gold #d4af37
- Auto: Red #dc2626, Dark #1f2937
- Pet: Amber #f59e0b, Green #22c55e

### Hero Variants
- split: Restaurants, Salons, Real Estate, Photography (image-focused)
- centered: Tech, Legal, Finance (text-focused)
- glassmorphism: Modern startups, SaaS

## UNSPLASH PHOTO IDS BY INDUSTRY
| Industry | Hero Photo | Additional |
|----------|-----------|------------|
| Restaurant | 1517248135467-4c7edcad34c4 | 1414235077428-338989a2e8c0 |
| Fitness | 1534438327276-14e5300c3a48 | 1571019613454-1cb2f99b2d8b |
| Salon | 1560066984-138dadb4c035 | 1522337360788-8b13dee7a37e |
| Dental | 1629909613654-28e377c37b09 | 1588776814546-daab30f310ce |
| Real Estate | 1560518883-ce09059eeffa | 1600596542815-ffad4c1539a9 |
| Legal | 1589829545856-d10d557cf95f | 1450101499163-c8848c66ca85 |
| Construction | 1504307651254-35680f356dfd | 1581094794329-c8112a89af12 |
| SaaS/Tech | 1551434678-e076c223a692 | 1460925895917-afdab827c52f |
| Plumbing | 1585704032915-c3400ca199e7 | 1558618666-fcd25c85cd64 |
| Auto | 1492144534655-ae79c964c9d7 | 1503376780353-7e6692767b70 |
| Pet | 1587300003388-59208cc962cb | 1548199973-03cce0bbc87b |
| Landscaping | 1558904541-efa843a96f01 | 1416879595882-3373a0480b5b |

## BANNED CONTENT (Never use these)
- "Welcome to" / "We're passionate about"
- "Unlock your" / "Elevate your" / "Transform your journey"
- "Seamless" / "Cutting-edge" / "State-of-the-art"
- "Get Started" / "Learn More" as primary CTAs
- "Excellion" / "website builder" / "AI" / "hosting"
- SaaS pricing ($29/month, Pro Plan) for physical businesses
- Generic features that apply to any business

## EDIT MODE
When the user asks to CHANGE something:
1. Only modify what was explicitly requested
2. Keep all other content exactly the same
3. Preserve theme, colors, navigation unless asked to change
4. Summary should only list what changed`;

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60000 });
    return { allowed: true };
  }
  
  if (record.count >= 15) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

// Detect message intent
function detectIntent(message: string): 'question' | 'generation' | 'edit' {
  const lower = message.toLowerCase().trim();
  
  // Questions
  if (/^(what|how|why|when|where|which|who|should|would|could|can|is|are|do|does|will)\s/i.test(lower) || /\?$/.test(lower)) {
    if (!/\b(create|build|make|generate|design|website|site|page|landing)\b/i.test(lower)) {
      return 'question';
    }
  }
  
  // Edits
  if (/^(add|change|update|modify|replace|remove|delete|fix|adjust|tweak|make the|turn)\s/i.test(lower)) {
    return 'edit';
  }
  
  return 'generation';
}

// Clean JSON from AI response
function cleanJsonResponse(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return '';
  }
  
  return text.substring(firstBrace, lastBrace + 1);
}

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  
  console.log(`[BOT-CHAT:${requestId}] ========== REQUEST START ==========`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    
    const authClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log(`[BOT-CHAT:${requestId}] User: ${user.id}`);

    // Rate limit
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
      });
    }

    const body = await req.json();
    const { messages, context, projectId, scaffold, speedMode, classification } = body;
    
    const isFastMode = speedMode === 'fast' || (!projectId && messages?.length === 1);
    
    console.log(`[BOT-CHAT:${requestId}] Messages: ${messages?.length}, Fast: ${isFastMode}, Project: ${projectId || 'none'}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get last user message
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    let lastUserMessageText = "";
    if (lastUserMessage?.content) {
      lastUserMessageText = typeof lastUserMessage.content === "string" 
        ? lastUserMessage.content 
        : lastUserMessage.content.find((p: any) => p.type === "text")?.text || "";
    }
    
    const messageIntent = detectIntent(lastUserMessageText);
    console.log(`[BOT-CHAT:${requestId}] Intent: ${messageIntent}`);

    // Question mode - use fast model for conversations
    if (messageIntent === 'question') {
      console.log(`[BOT-CHAT:${requestId}] QUESTION MODE - Using gemini-2.5-flash`);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: "system", content: "You are a helpful website building assistant. Answer questions conversationally. Do NOT output JSON or SiteSpec. Keep responses concise (2-3 paragraphs max)." },
            ...messages,
          ],
          stream: true,
          max_tokens: 1500,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BOT-CHAT:${requestId}] AI error: ${response.status}`, errorText);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Generation/Edit mode - Use CLAUDE for better instruction following
    console.log(`[BOT-CHAT:${requestId}] ${messageIntent.toUpperCase()} MODE - Using Claude`);

    // Build enhanced prompt with classification data if available
    let enhancedPrompt = SYSTEM_PROMPT;
    
    // Add pre-classification context if provided (from classify-business)
    if (classification) {
      console.log(`[BOT-CHAT:${requestId}] Using pre-classification:`, classification.industry);
      enhancedPrompt += `\n\n## PRE-CLASSIFIED CONTEXT (High Confidence)
- Industry: ${classification.industry?.toUpperCase()}
- Business Model: ${classification.businessModel}
- Primary Color: ${classification.primaryColor}
- Secondary Color: ${classification.secondaryColor}
- Layout: ${classification.layoutHint}
- Hero Variant: ${classification.heroVariant}

YOU MUST use these colors and layout unless the user explicitly specifies different ones.`;
    }

    // Add scaffold constraints if present
    if (scaffold) {
      console.log(`[BOT-CHAT:${requestId}] Scaffold: ${scaffold.category} / ${scaffold.archetypeId}`);
      
      let scaffoldPrompt = `\n\n## SCAFFOLD REQUIREMENTS (From Build Assist)\n`;
      scaffoldPrompt += `- Category: ${scaffold.category}\n`;
      scaffoldPrompt += `- Archetype: ${scaffold.archetypeId}\n`;
      
      if (scaffold.requiredPages?.length > 0) {
        scaffoldPrompt += `\n### Required Pages:\n`;
        scaffold.requiredPages.forEach((page: any) => {
          scaffoldPrompt += `- ${page.path}: ${page.title}`;
          if (page.requiredSections?.length > 0) {
            scaffoldPrompt += ` (sections: ${page.requiredSections.join(', ')})`;
          }
          scaffoldPrompt += '\n';
        });
      }
      
      if (scaffold.ctaRules) {
        scaffoldPrompt += `\n### CTA Rules:\n`;
        scaffoldPrompt += `- Primary: "${scaffold.ctaRules.primaryLabel || 'Contact Us'}"\n`;
        if (scaffold.ctaRules.secondaryLabel) {
          scaffoldPrompt += `- Secondary: "${scaffold.ctaRules.secondaryLabel}"\n`;
        }
      }
      
      if (scaffold.customTheme) {
        scaffoldPrompt += `\n### Custom Colors (MUST USE):\n`;
        scaffoldPrompt += `- Primary: ${scaffold.customTheme.primaryColor}\n`;
        scaffoldPrompt += `- Accent: ${scaffold.customTheme.accentColor}\n`;
        scaffoldPrompt += `- Mode: ${scaffold.customTheme.backgroundMode}\n`;
      }
      
      if (scaffold.forbiddenPhrases?.length > 0) {
        scaffoldPrompt += `\n### Forbidden Phrases:\n`;
        scaffold.forbiddenPhrases.forEach((phrase: string) => {
          scaffoldPrompt += `- "${phrase}"\n`;
        });
      }
      
      enhancedPrompt += scaffoldPrompt;
    }

    // Add context from existing project
    if (context?.businessName || context?.industry) {
      enhancedPrompt += `\n\n## Project Context:\n`;
      if (context.businessName) enhancedPrompt += `- Business Name: ${context.businessName}\n`;
      if (context.industry) enhancedPrompt += `- Industry: ${context.industry}\n`;
    }

    // Fetch global instructions (if available)
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const globalResponse = await fetch(
          `${supabaseUrl}/rest/v1/knowledge_base?name=eq.__global_instructions__&select=content&limit=1`,
          {
            headers: {
              "apikey": supabaseServiceKey,
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
          }
        );
        
        if (globalResponse.ok) {
          const entries = await globalResponse.json();
          if (entries?.[0]?.content) {
            enhancedPrompt += `\n\n## Global Instructions:\n${entries[0].content}\n`;
            console.log(`[BOT-CHAT:${requestId}] Global instructions loaded`);
          }
        }
      } catch (e) {
        console.log(`[BOT-CHAT:${requestId}] Could not fetch global instructions`);
      }
    }

    console.log(`[BOT-CHAT:${requestId}] Prompt length: ${enhancedPrompt.length} chars`);

    // USE GEMINI for generation (Claude not available via gateway)
    // The improved prompt structure still provides better results
    const selectedModel = 'google/gemini-2.5-flash';
    const maxTokens = isFastMode ? 6000 : 10000;
    
    console.log(`[BOT-CHAT:${requestId}] Model: ${selectedModel}, Max tokens: ${maxTokens}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: enhancedPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: maxTokens,
      }),
    });

    console.log(`[BOT-CHAT:${requestId}] AI response: ${response.status} (${Date.now() - startTime}ms)`);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error(`[BOT-CHAT:${requestId}] AI error:`, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[BOT-CHAT:${requestId}] SUCCESS - Streaming`);
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[BOT-CHAT:${requestId}] ERROR:`, errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
