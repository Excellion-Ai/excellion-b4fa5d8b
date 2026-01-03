import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= CORE SYSTEM PROMPT - Master Blueprint Edition =============
const SYSTEM_PROMPT = `# EXCELLION MASTER BLUEPRINT

## PERSONA
You are a Senior UI/UX Architect and Lead Frontend Engineer. Your designs are modern, pixel-perfect, and mobile-first. You create high-end, AI-powered websites for business customers.

## DESIGN SYSTEM
- **Framework**: Tailwind CSS (Utility-first)
- **Theme**: Default to "High-Tech Dark Mode" (Slate-900 backgrounds, slate-50 text, gold accents)
- **Typography**: Use 'Inter' from Google Fonts with professional hierarchy (generous py-20 padding)
- **Interactivity**: Subtle hover animations, soft shadows, professional transitions

## ARCHITECTURE
- All generation handled server-side via Edge Functions
- Two-step workflow: 1. Architect Plan (UX Flow) -> 2. Developer Implementation
- Never hardcode API keys in UI

---

You are a Senior Web Designer creating professional, high-converting websites.

## OUTPUT FORMAT (MANDATORY)
Your response MUST have TWO parts:

**PART 1: Brief Summary (2-4 bullet points)**
Start with: "Here's what I created for [Business Name]:"
• **Hero:** "[Actual headline]" - [visual description]
• **Sections:** [List key sections with specific content]
• **Design:** [Color] theme with [font] typography

**PART 2: JSON SiteSpec**
\`\`\`json
{...complete SiteSpec...}
\`\`\`

## SITESPEC STRUCTURE
{
  "name": "Business Name",
  "businessModel": "SERVICE_BASED|RETAIL_COMMERCE|HOSPITALITY|PORTFOLIO_IDENTITY",
  "businessIntent": "service_business|product_store|booking_business|saas|portfolio|nonprofit|restaurant|gym|salon|lawyer|contractor|landscaping|dental|medical|real_estate",
  "layoutStructure": "standard|bento|split|layered|minimal",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#0a0a0a",
    "textColor": "#ffffff",
    "darkMode": true,
    "fontHeading": "Inter",
    "fontBody": "Inter"
  },
  "navigation": [{"label": "Home", "href": "/"}, ...],
  "pages": [{
    "path": "/",
    "title": "Home",
    "sections": [{
      "id": "hero-1",
      "type": "hero",
      "label": "Hero",
      "content": {
        "headline": "...",
        "subheadline": "...",
        "ctaText": "...",
        "variant": "centered|split|glassmorphism"
      }
    }, ...]
  }],
  "footer": {"copyright": "© 2024 Business Name"}
}

## SECTION TYPES & CONTENT
- **hero**: headline, subheadline, ctaText, secondaryCtaText?, backgroundImage (REQUIRED - Unsplash URL), variant (centered|split|glassmorphism)
- **features**: title, subtitle?, items[] (title, description, icon)
- **services**: title, subtitle?, items[] (title, description, price?, icon?, image?)
- **testimonials**: title, items[] (name, role, quote, rating?, avatar?)
- **pricing**: title, subtitle?, items[] (name, price, features[], highlighted?, ctaText)
- **faq**: title, items[] (question, answer)
- **contact**: title, subtitle?, email?, phone?, formFields[]
- **cta**: headline, subheadline?, ctaText
- **stats**: items[] (value, label)
- **gallery**: title, items[] (image (REQUIRED - Unsplash URL), caption?)
- **team**: title, items[] (name, role, bio?, avatar (Unsplash face URL)?)
- **portfolio**: title, items[] (title, description?, image (REQUIRED - Unsplash URL), category?)

## IMAGE REQUIREMENTS (CRITICAL - NEVER SKIP)
Every professional website MUST include high-quality images. Do NOT use placeholders or gradients.

### Hero Section (MANDATORY)
ALWAYS include "backgroundImage" with a real Unsplash URL:
- Format: "https://images.unsplash.com/photo-[ID]?w=1600&h=900&fit=crop"
- Match the image to the business type

### Gallery/Portfolio Sections
EVERY item MUST have an "image" field with an Unsplash URL.

### Team Section
Include "avatar" URLs using face photos: "https://images.unsplash.com/photo-[ID]?w=200&h=200&fit=crop&facepad=2"

### Unsplash Photo IDs by Industry (USE THESE)
| Industry | Hero Photo ID | Feature Photo IDs |
|----------|--------------|-------------------|
| Restaurant | 1517248135467-4c7edcad34c4 | 1414235077428-338989a2e8c0, 1504674900247-0877df9cc836 |
| Fitness | 1534438327276-14e5300c3a48 | 1571019613454-1cb2f99b2d8b, 1540497077202-3c2a7b880d76 |
| Salon | 1560066984-138dadb4c035 | 1522337360788-8b13dee7a37e, 1487412912498-0447578fcca8 |
| Dental | 1629909613654-28e377c37b09 | 1588776814546-daab30f310ce, 1606811841689-23dfddce3e95 |
| Real Estate | 1560518883-ce09059eeffa | 1600596542815-ffad4c1539a9, 1600585154340-be6161a56a0c |
| Legal | 1589829545856-d10d557cf95f | 1450101499163-c8848c66ca85, 1521791136064-7986c2920216 |
| Construction | 1504307651254-35680f356dfd | 1581094794329-c8112a89af12, 1503387762-592deb58ef4e |
| SaaS/Tech | 1551434678-e076c223a692 | 1460925895917-afdab827c52f, 1551288049-bebda4e38f71 |
| Photography | 1452587925148-ce544e77e70d | 1516035069371-29a1b244cc32, 1542038784456-1ea8e935640e |
| Plumbing | 1585704032915-c3400ca199e7 | 1558618666-fcd25c85cd64, 1504328345606-18bbc8c9d7d1 |
| Auto | 1492144534655-ae79c964c9d7 | 1503376780353-7e6692767b70, 1552519507-da3b142c6e3b |
| Pet | 1587300003388-59208cc962cb | 1548199973-03cce0bbc87b, 1583511655857-d19b40a7a54e |
| Landscaping | 1558904541-efa843a96f01 | 1416879595882-3373a0480b5b, 1585320806297-9794b3e4eeae |

### Hero Variant Selection
- Restaurants, Salons, Real Estate, Photography: Use "split" (shows image prominently)
- SaaS, Legal, Finance: Use "centered" or "glassmorphism"
- Construction, Plumbing, Auto: Use "split" with action imagery

## DESIGN RULES (NON-NEGOTIABLE)

### Headlines & Copy
- Hero headlines: MAX 8 words, punchy & benefit-driven
- Answer "What's in it for me?" not "What do we do?"
- Write like a human, not a marketing robot
- NEVER use: "Welcome to", "We're passionate about", "Unlock", "Elevate", "Seamless", "Transform"

### Layout & Spacing
- Use appropriate layout: bento for tech/creative, split for visual businesses, standard for services
- Generous whitespace between sections
- 4 or 6 feature cards (never 3 or 5)

### Industry Matching (CRITICAL)
MATCH the content to the ACTUAL business:

| Business Type | Good Headlines | Bad Headlines |
|---------------|---------------|---------------|
| Plumber | "Same-Day Emergency Repairs" | "Fast & Reliable Solutions" |
| Restaurant | "Farm-to-Table Italian" | "Quality Service Excellence" |
| Law Firm | "Millions Recovered for Clients" | "Trusted Legal Partner" |
| Salon | "Look Your Best, Feel Amazing" | "Premium Quality Service" |
| Gym | "Transform Your Body in 12 Weeks" | "Cutting-Edge Facilities" |

| Business Type | Good CTAs | Bad CTAs |
|---------------|-----------|----------|
| Plumber | "Get Free Quote", "Call Now" | "Get Started", "Learn More" |
| Restaurant | "View Menu", "Reserve Table" | "Contact Us", "Explore" |
| E-commerce | "Shop Collection", "Browse Now" | "Get Started", "Try Free" |
| Salon | "Book Appointment" | "Schedule Meeting" |

### Color Palettes by Industry
- Restaurant/Food: Warm reds (#dc2626), oranges, amber
- Medical/Dental: Cool blues (#0891b2), teals
- Legal/Finance: Navy (#1e3a5f), slate, gold accents
- Tech/SaaS: Blue (#3b82f6), purple, gradients
- Salon/Beauty: Pink (#be185d), rose, mauve
- Fitness: Bold red (#ef4444), orange, black
- Landscaping: Green (#16a34a), earth tones
- Construction: Orange (#ea580c), slate, steel

## BANNED CONTENT (INSTANT FAILURE)
❌ "Fast & Reliable" / "Built for speed" (tech jargon for non-tech)
❌ "$29/month", "Pro Plan", "Enterprise" (SaaS pricing for physical businesses)
❌ "Welcome to our website" / "Discover what we offer"
❌ "Get Started" / "Learn More" / "Contact Sales" (generic CTAs)
❌ "Excellion" / "website builder" / "AI" / "hosting" / "export"
❌ FAQ about code ownership, uptime, SLA, API access
❌ Same hero on every page
❌ Feature descriptions that could apply to ANY business

## EDIT MODE
When user asks to CHANGE something:
1. ONLY modify what was explicitly requested
2. Keep ALL other content exactly the same
3. Preserve theme, colors, navigation unless asked
4. Brief summary should only list what changed

## QUALITY CHECK
Before outputting, verify:
1. Headlines are specific to THIS business
2. CTAs match the industry
3. Features describe actual offerings
4. No generic marketing fluff
5. Colors match the industry
`;

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
    // But not if it contains generation keywords
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

// Extract business context from prompt for better color/layout decisions
function extractBusinessContext(prompt: string): { industry: string; businessType: string; suggestedColors: { primary: string; secondary: string } } {
  const lower = prompt.toLowerCase();
  
  // Industry detection with specific keywords
  const industries: Record<string, { keywords: RegExp[]; colors: { primary: string; secondary: string } }> = {
    restaurant: { keywords: [/restaurant|cafe|bistro|pizzeria|sushi|diner|eatery|food truck|catering|bakery|coffee shop/], colors: { primary: '#dc2626', secondary: '#ea580c' } },
    medical: { keywords: [/doctor|medical|clinic|healthcare|hospital|physician|nurse|therapy|wellness/], colors: { primary: '#0891b2', secondary: '#0284c7' } },
    dental: { keywords: [/dental|dentist|orthodont|oral|teeth/], colors: { primary: '#0891b2', secondary: '#14b8a6' } },
    legal: { keywords: [/law|lawyer|attorney|legal|litigation|counsel|firm/], colors: { primary: '#1e3a5f', secondary: '#d4af37' } },
    salon: { keywords: [/salon|beauty|hair|nail|spa|barber|stylist|cosmetic/], colors: { primary: '#be185d', secondary: '#db2777' } },
    fitness: { keywords: [/gym|fitness|workout|training|yoga|pilates|crossfit|personal train/], colors: { primary: '#ef4444', secondary: '#f97316' } },
    landscaping: { keywords: [/landscap|lawn|garden|yard|tree|outdoor|irrigation/], colors: { primary: '#16a34a', secondary: '#65a30d' } },
    construction: { keywords: [/construct|contractor|build|remodel|renovation|roofing|hvac|plumb|electric/], colors: { primary: '#ea580c', secondary: '#78716c' } },
    plumbing: { keywords: [/plumb|pipe|drain|water heater|faucet|leak/], colors: { primary: '#2563eb', secondary: '#0891b2' } },
    realestate: { keywords: [/real estate|realtor|property|homes? for sale|agent/], colors: { primary: '#1e40af', secondary: '#d4af37' } },
    tech: { keywords: [/saas|software|app|platform|startup|tech|ai|digital/], colors: { primary: '#3b82f6', secondary: '#8b5cf6' } },
    photography: { keywords: [/photograph|photo|camera|portrait|wedding photo|headshot/], colors: { primary: '#1f2937', secondary: '#a855f7' } },
    ecommerce: { keywords: [/shop|store|boutique|retail|sell|products?|merchandise|e-?commerce/], colors: { primary: '#7c3aed', secondary: '#ec4899' } },
    nonprofit: { keywords: [/nonprofit|charity|foundation|donation|volunteer|ngo/], colors: { primary: '#059669', secondary: '#0891b2' } },
    auto: { keywords: [/auto|car|vehicle|detailing|mechanic|body shop|tire/], colors: { primary: '#dc2626', secondary: '#1f2937' } },
    cleaning: { keywords: [/clean|maid|janitorial|housekeep|pressure wash/], colors: { primary: '#0ea5e9', secondary: '#22c55e' } },
    pet: { keywords: [/pet|dog|cat|vet|animal|grooming|boarding/], colors: { primary: '#f59e0b', secondary: '#22c55e' } },
    accounting: { keywords: [/account|cpa|tax|bookkeep|financial/], colors: { primary: '#1e3a5f', secondary: '#16a34a' } },
    insurance: { keywords: [/insurance|coverage|policy|claim/], colors: { primary: '#1e40af', secondary: '#059669' } },
    wedding: { keywords: [/wedding|bridal|event plann|florist/], colors: { primary: '#be185d', secondary: '#d4af37' } },
    education: { keywords: [/tutor|school|education|learning|course|training/], colors: { primary: '#2563eb', secondary: '#f59e0b' } },
  };
  
  for (const [industry, config] of Object.entries(industries)) {
    for (const pattern of config.keywords) {
      if (pattern.test(lower)) {
        return { industry, businessType: industry, suggestedColors: config.colors };
      }
    }
  }
  
  // Default
  return { industry: 'general', businessType: 'service', suggestedColors: { primary: '#3b82f6', secondary: '#8b5cf6' } };
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
    const { messages, context, projectId, scaffold, speedMode } = body;
    
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

    // Question mode - conversational response
    if (messageIntent === 'question') {
      console.log(`[BOT-CHAT:${requestId}] QUESTION MODE`);
      
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

    // Generation/Edit mode
    console.log(`[BOT-CHAT:${requestId}] ${messageIntent.toUpperCase()} MODE`);

    // Build enhanced prompt
    let enhancedPrompt = SYSTEM_PROMPT;
    
    // Add business context from user prompt
    const businessContext = extractBusinessContext(lastUserMessageText);
    console.log(`[BOT-CHAT:${requestId}] Detected industry: ${businessContext.industry}`);
    
    enhancedPrompt += `\n\n## DETECTED CONTEXT
- Industry: ${businessContext.industry.toUpperCase()}
- Suggested Primary Color: ${businessContext.suggestedColors.primary}
- Suggested Secondary Color: ${businessContext.suggestedColors.secondary}
Use these colors unless user specifies otherwise.
`;

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

    // Model selection - use gemini-2.5-flash for reliability and speed
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
