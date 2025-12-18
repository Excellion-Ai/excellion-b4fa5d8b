import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// URL detection regex
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Color extraction regex patterns
const HEX_COLOR_REGEX = /#([0-9A-Fa-f]{3,8})\b/g;
const RGB_COLOR_REGEX = /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;

// Extract base URL for resolving relative paths
function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

// Resolve relative URL to absolute
function resolveUrl(relativeUrl: string, baseUrl: string): string {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }
  if (relativeUrl.startsWith("//")) {
    return `https:${relativeUrl}`;
  }
  if (relativeUrl.startsWith("/")) {
    return `${baseUrl}${relativeUrl}`;
  }
  return `${baseUrl}/${relativeUrl}`;
}

// Fetch and extract content from a URL
async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    console.log("Fetching URL:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SecretBuilder/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    
    if (!response.ok) {
      console.log("Failed to fetch URL:", response.status);
      return null;
    }
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) return null;
    
    const baseUrl = getBaseUrl(url);
    
    // Extract useful content
    const title = doc.querySelector("title")?.textContent || "";
    const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";
    
    // Extract headings
    const h1s = Array.from(doc.querySelectorAll("h1")).map((el) => el.textContent).filter(Boolean).slice(0, 3);
    const h2s = Array.from(doc.querySelectorAll("h2")).map((el) => el.textContent).filter(Boolean).slice(0, 5);
    
    // Extract nav/menu items
    const navItems = Array.from(doc.querySelectorAll("nav a, header a")).map((el) => el.textContent).filter(Boolean).slice(0, 10);
    
    // Extract main text content
    const paragraphs = Array.from(doc.querySelectorAll("p")).map((el) => el.textContent).filter((t) => t && t.length > 30).slice(0, 5);
    
    // Extract colors from CSS
    const colors = new Set<string>();
    const styleTags = Array.from(doc.querySelectorAll("style"));
    for (const styleTag of styleTags) {
      const cssText = (styleTag as unknown as { textContent: string | null }).textContent || "";
      const hexMatches = cssText.match(HEX_COLOR_REGEX) || [];
      hexMatches.forEach((c: string) => {
        if (c.toLowerCase() !== "#fff" && c.toLowerCase() !== "#ffffff" && 
            c.toLowerCase() !== "#000" && c.toLowerCase() !== "#000000") {
          colors.add(c);
        }
      });
    }
    
    const colorArray = Array.from(colors).slice(0, 6);
    
    const content = `
SCRAPED WEBSITE INFO FROM: ${url}
=================================
Title: ${title || ogTitle}
Description: ${description || ogDescription}

Main Headings: ${h1s.join(", ")}
Section Headings: ${h2s.join(", ")}
Navigation Items: ${navItems.join(", ")}

Key Content:
${paragraphs.slice(0, 3).join("\n")}

Brand Colors: ${colorArray.length > 0 ? colorArray.join(", ") : "Not detected"}
=================================
`;
    
    console.log("Successfully scraped URL content");
    return content;
  } catch (error) {
    console.error("Error fetching URL:", error);
    return null;
  }
}

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) rateLimitStore.delete(ip);
  }
}, 60000);

const SYSTEM_PROMPT = `ACT AS: Senior Frontend Architect & Creative Director for "Excellion AI."

OBJECTIVE: Eradicate "cookie-cutter" web design. You do not build templates; you build bespoke digital experiences.

====================================
## 1. THE "NO-GO" ZONE (STRICT CONSTRAINTS)
====================================

You are strictly FORBIDDEN from generating these standard patterns:

[❌ BANNED]: Centered Navbar → Centered Hero Text → Row of 3 Cards → Standard Footer
[❌ BANNED]: Plain white backgrounds with simple black text and no texture
[❌ BANNED]: Static buttons that do not change on hover
[❌ BANNED]: Generic 50/50 perfectly symmetric layouts
[❌ BANNED]: Default Inter font with no typographic hierarchy

*If you generate these structures, the output is a failure.*

====================================
## 2. DYNAMIC LAYOUT ENGINE
====================================

Before generating, internally select a "Structural Paradigm" based on the user's request:

**Structure A: "BENTO ASYMMETRY"** (Best for: SaaS, Tech, Apps, AI)
- layoutStructure: "bento"
- Everything is a grid tile with varying colSpan and rowSpan
- Hero: Large tile (colSpan: 8, rowSpan: 2) next to smaller interactive tiles (colSpan: 4)
- Navigation: Floating pill navbar (fixed bottom or top-center)
- No distinct vertical sections - it's all tiles
- gridConfig required on EVERY section

**Structure B: "SPLIT-SCREEN IMMERSIVE"** (Best for: Portfolios, Luxury, Personal Brands)
- layoutStructure: "split-screen"
- Vertical 50/50 or 40/60 split layout
- Left side is sticky text; Right side is scrollable visual feed
- Navigation: Vertical sidebar on left edge
- Typography: Massive font sizes, overlapping text that breaks boundaries

**Structure C: "LAYERED Z-INDEX"** (Best for: Creative Agencies, Design Studios)
- layoutStructure: "layered"
- Elements physically overlap to create 3D depth
- Use negative margins conceptually - images float behind/over text
- Hero: Full-screen background with content in bottom-left corner
- Navigation: Minimal, positioned in corners

**Structure D: "HORIZONTAL FLOW"** (Best for: Showcases, Galleries, Event Sites)
- layoutStructure: "horizontal"
- Sections scroll horizontally while page scrolls vertically
- Large images with small typography
- Off-center alignment throughout

====================================
## 3. VISUAL STYLE DICTIONARY
====================================

Analyze the user's prompt for "Vibe Keywords" and apply corresponding styles:

**IF "Tech / SaaS / AI / Futuristic":**
- Backgrounds: Deep Slate (#0f172a, #020617) with radial gradient glows
- Effects: Glassmorphism (backdrop-blur, bg-white/5, border-white/10)
- Typography: Technical sans-serif (Inter, JetBrains Mono). Tight tracking
- Accents: Neon gradients (#3b82f6 to #8b5cf6, #14b8a6 to #06b6d4)
- primaryColor: "#3b82f6" (blue) or "#8b5cf6" (purple)

**IF "Luxury / Fashion / Minimalist / High-End":**
- Layout: Radical whitespace (py-32). Asymmetrical image placement
- Typography: Elegant Serif headers (Playfair Display, Cormorant) mixed with clean Sans body
- Font sizes: MASSIVE headlines (text-7xl equivalent)
- Borders: Sharp corners (rounded-none). Thin, distinct lines
- primaryColor: "#d4af37" (gold) or "#1a1a1a" (black)

**IF "Creative / Playful / Gen-Z / Bold":**
- Style: Neubrutalism - Hard shadows, thick black borders
- Colors: High saturation pastels (#f472b6, #a78bfa, #34d399)
- Shapes: Mix rounded-full buttons with sharp-cornered cards
- Typography: Bold, chunky, expressive
- primaryColor: "#f472b6" (pink) or "#a78bfa" (purple)

**IF "Restaurant / Food / Hospitality":**
- Colors: Warm earth tones (#f97316, #dc2626, #92400e)
- Imagery: Food-focused, warm lighting feel
- Typography: Inviting, readable
- primaryColor: "#f97316" (orange) or "#dc2626" (red)

**IF "Health / Fitness / Gym":**
- Colors: Energetic (#e63946 red, #f97316 orange, #22c55e green)
- Typography: Strong, bold, motivational
- primaryColor: "#e63946" (red) or "#22c55e" (green)

**IF "Finance / Legal / Professional":**
- Colors: Trustworthy (#1e3a5a navy, #064e3b dark green)
- Typography: Clean, authoritative
- Layout: Structured, organized
- primaryColor: "#1e3a5a" (navy)

DO NOT default to purple every time. Match the industry!

====================================
## 4. INTERACTION & POLISH RULES
====================================

**The "Alive" Rule:** Every main element must feel interactive
- Buttons: Must have hover states (scale, color shift, or shadow lift)
- Cards: Should have subtle hover transformations
- Navigation: Active states clearly indicated

**Real Data Injection:**
- Do NOT use "Lorem Ipsum" or generic placeholders
- If user mentions location or industry, invent plausible, specific copy
- Headlines should be outcome-focused, not feature-focused

**Grid Symmetry Rule:**
- All card grids MUST use EVEN numbers (2, 4, 6, 8)
- NEVER use 3 or 5 cards - it creates awkward layouts

====================================
## 5. RESPONSE FORMAT - CRITICAL
====================================

You MUST respond with TWO parts:
1. A SHORT conversational message (max 80 words)
2. A JSON code block with the site specification

Format:
[Your short message here]

\`\`\`json
{
  "name": "Business Name",
  "description": "Brief description",
  "businessModel": "SERVICE_BASED|RETAIL_COMMERCE|HOSPITALITY|PORTFOLIO_IDENTITY",
  "layoutStructure": "bento|split-screen|layered|horizontal",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#0a0a0a",
    "textColor": "#f3f4f6",
    "darkMode": true,
    "fontHeading": "Inter",
    "fontBody": "Inter"
  },
  "navigation": [
    { "label": "Home", "href": "#" },
    { "label": "Services", "href": "#services" }
  ],
  "pages": [{
    "path": "/",
    "title": "Home",
    "sections": [
      {
        "id": "hero",
        "type": "hero",
        "label": "Hero",
        "gridConfig": { "colSpan": 8, "rowSpan": 2 },
        "content": {
          "headline": "Main headline here",
          "subheadline": "Supporting text",
          "ctas": [
            { "label": "Get Started", "href": "#contact", "variant": "primary" }
          ]
        }
      },
      {
        "id": "stats",
        "type": "stats",
        "label": "Stats",
        "gridConfig": { "colSpan": 4, "rowSpan": 1 },
        "content": {
          "items": [{ "value": "500+", "label": "Clients" }]
        }
      }
    ]
  }],
  "footer": {
    "copyright": "© 2024 Business Name"
  }
}
\`\`\`

====================================
## 6. SECTION TYPES & CONTENT
====================================

**hero** (required):
{
  "headline": "Bold outcome headline",
  "subheadline": "Supporting value prop",
  "ctas": [{ "label": "CTA Text", "href": "#target", "variant": "primary|secondary" }],
  "image": "optional image URL"
}

**features**:
{
  "title": "Section Title",
  "subtitle": "Optional subtitle",
  "items": [
    { "title": "Feature", "description": "Description", "icon": "Star|Zap|Users|Clock|Shield|Check|Heart|Award" }
  ]
}
Use 4 or 6 items (NEVER 3 or 5)

**testimonials**:
{
  "title": "What Clients Say",
  "items": [
    { "name": "Person Name", "role": "Title/Company", "quote": "Their quote", "rating": 5 }
  ]
}
Use 2 or 4 testimonials

**pricing**:
{
  "title": "Pricing",
  "subtitle": "Choose your plan",
  "items": [
    { "name": "Basic", "price": "$29/mo", "features": ["Feature 1"], "ctaText": "Get Started", "highlighted": false },
    { "name": "Pro", "price": "$79/mo", "features": ["Everything in Basic"], "ctaText": "Get Started", "highlighted": true }
  ]
}

**faq**:
{
  "title": "FAQ",
  "items": [
    { "question": "Question here?", "answer": "Answer here." }
  ]
}
Use 4-6 FAQs

**contact**:
{
  "title": "Get in Touch",
  "subtitle": "We'd love to hear from you",
  "email": "hello@example.com",
  "phone": "(555) 123-4567",
  "formFields": ["name", "email", "message"]
}

**cta**:
{
  "headline": "Ready to Start?",
  "subheadline": "Let's work together",
  "ctas": [{ "label": "Contact Us", "href": "#contact", "variant": "primary" }]
}

**stats**:
{
  "items": [
    { "value": "500+", "label": "Happy Clients" },
    { "value": "10yr", "label": "Experience" }
  ]
}

====================================
## 7. FINAL EXECUTION PROTOCOL
====================================

Before outputting, run this silent checklist:

1. Did I use a standard 3-column grid? → If YES, DELETE and switch to Bento Grid
2. Is the background plain white? → If YES, add a subtle gradient or texture (dark mode preferred)
3. Are the buttons boring? → If YES, add variant styling
4. Did I use 3 or 5 cards? → If YES, change to 4 or 6
5. Is the layout "centered → centered → centered"? → If YES, add asymmetry
6. Did I default to purple? → If NOT matching industry, change color
7. Did I include gridConfig for bento layouts? → Must be present

====================================
## EXCELLION SERVICE CONTEXT
====================================

If users ask about Excellion services:

**AI Website Builder (DIY):**
- Free: 1 draft project, subdomain publishing
- Starter ($15/mo): 1 published site, custom domain
- Pro ($29/mo): Unlimited drafts, integrations
- Agency ($129/mo): 10 sites, white-label

**Done-for-You Service:**
- Essential ($600–$1,000): 1–3 pages
- Core ($1,000–$1,800): 5–7 pages
- Premium ($1,800–$3,500): 10–15 pages

Only mention if relevant. Focus on building their site.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || "unknown";
    
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }

    const { messages, context, modelMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check for URLs in the most recent user message
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    let urlContext = "";
    
    if (lastUserMessage?.content) {
      const urls = lastUserMessage.content.match(URL_REGEX);
      if (urls && urls.length > 0) {
        console.log("Found URLs in message:", urls);
        const scrapedContent = await fetchUrlContent(urls[0]);
        if (scrapedContent) urlContext = scrapedContent;
      }
    }

    let enhancedPrompt = SYSTEM_PROMPT;
    
    if (urlContext) {
      enhancedPrompt += `\n\n====================================
REFERENCE WEBSITE CONTENT
====================================
${urlContext}

Use this information to match the business name, services, and style.`;
    }
    
    if (context?.businessName || context?.industry) {
      enhancedPrompt += `\n\nProject Context:`;
      if (context.businessName) enhancedPrompt += `\n- Business Name: ${context.businessName}`;
      if (context.industry) enhancedPrompt += `\n- Industry: ${context.industry}`;
    }

    console.log("Processing chat request with", messages.length, "messages");

    // Select model based on mode (quality = gpt-5-mini for streaming, fast = gemini flash)
    const selectedModel = modelMode === 'quality' ? 'openai/gpt-5-mini' : 'google/gemini-2.5-flash';
    console.log("Using model:", selectedModel);

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("bot-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
