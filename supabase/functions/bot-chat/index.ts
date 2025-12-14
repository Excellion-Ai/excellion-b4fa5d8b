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
const HSL_COLOR_REGEX = /hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/g;

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
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
    const themeColor = doc.querySelector('meta[name="theme-color"]')?.getAttribute("content") || "";
    
    // Extract headings
    const h1s = Array.from(doc.querySelectorAll("h1")).map((el) => el.textContent).filter(Boolean).slice(0, 3);
    const h2s = Array.from(doc.querySelectorAll("h2")).map((el) => el.textContent).filter(Boolean).slice(0, 5);
    
    // Extract nav/menu items
    const navItems = Array.from(doc.querySelectorAll("nav a, header a")).map((el) => el.textContent).filter(Boolean).slice(0, 10);
    
    // Extract main text content (paragraphs)
    const paragraphs = Array.from(doc.querySelectorAll("p")).map((el) => el.textContent).filter((t) => t && t.length > 30).slice(0, 5);
    
    // Extract images (hero images, logo, key visuals)
    const images: string[] = [];
    
    // Logo
    const logoSelectors = ['img[alt*="logo" i]', 'img[src*="logo" i]', 'img[class*="logo" i]', 'header img', '.logo img'];
    for (const selector of logoSelectors) {
      const logoEl = doc.querySelector(selector);
      if (logoEl) {
        const src = logoEl.getAttribute("src");
        if (src) {
          images.push(`Logo: ${resolveUrl(src, baseUrl)}`);
          break;
        }
      }
    }
    
    // Hero/banner images
    const heroSelectors = ['img[class*="hero" i]', 'img[class*="banner" i]', 'section:first-of-type img', '.hero img', '#hero img'];
    for (const selector of heroSelectors) {
      const heroEl = doc.querySelector(selector);
      if (heroEl) {
        const src = heroEl.getAttribute("src");
        if (src && !images.some(i => i.includes(src))) {
          images.push(`Hero/Banner: ${resolveUrl(src, baseUrl)}`);
          break;
        }
      }
    }
    
    // Featured/product images (first few)
    const allImages = Array.from(doc.querySelectorAll("img")).slice(0, 10);
    for (const img of allImages) {
      const imgEl = img as unknown as { getAttribute: (name: string) => string | null };
      const src = imgEl.getAttribute("src");
      const alt = imgEl.getAttribute("alt") || "";
      if (src && !src.includes("icon") && !src.includes("placeholder") && !images.some(i => i.includes(src))) {
        if (images.length < 6) {
          images.push(`Image (${alt || "untitled"}): ${resolveUrl(src, baseUrl)}`);
        }
      }
    }
    
    // OG image as fallback
    if (ogImage && !images.some(i => i.includes(ogImage))) {
      images.push(`OG Image: ${resolveUrl(ogImage, baseUrl)}`);
    }
    
    // Extract colors from CSS and inline styles
    const colors = new Set<string>();
    
    // Theme color
    if (themeColor) colors.add(themeColor);
    
    // Extract from style tags
    const styleTags = Array.from(doc.querySelectorAll("style"));
    for (const styleTag of styleTags) {
      const cssText = (styleTag as unknown as { textContent: string | null }).textContent || "";
      
      // Find hex colors
      const hexMatches = cssText.match(HEX_COLOR_REGEX) || [];
      hexMatches.forEach((c: string) => {
        if (c.toLowerCase() !== "#fff" && c.toLowerCase() !== "#ffffff" && 
            c.toLowerCase() !== "#000" && c.toLowerCase() !== "#000000") {
          colors.add(c);
        }
      });
      
      // Find rgb colors
      const rgbMatches = cssText.match(RGB_COLOR_REGEX) || [];
      rgbMatches.forEach((c: string) => colors.add(c));
    }
    
    // Extract from inline styles on key elements
    const styledElements = Array.from(doc.querySelectorAll("[style]")).slice(0, 20);
    for (const el of styledElements) {
      const elWithAttr = el as unknown as { getAttribute: (name: string) => string | null };
      const style = elWithAttr.getAttribute("style") || "";
      const hexMatches = style.match(HEX_COLOR_REGEX) || [];
      hexMatches.forEach((c: string) => {
        if (c.toLowerCase() !== "#fff" && c.toLowerCase() !== "#ffffff" && 
            c.toLowerCase() !== "#000" && c.toLowerCase() !== "#000000") {
          colors.add(c);
        }
      });
    }
    
    // Extract from CSS variables in :root
    const rootStyleTag = doc.querySelector("style");
    const rootStyle = rootStyleTag ? (rootStyleTag as unknown as { textContent: string | null }).textContent || "" : "";
    const cssVarMatch = rootStyle.match(/:root\s*\{([^}]+)\}/);
    if (cssVarMatch) {
      const varContent = cssVarMatch[1];
      const colorVars = varContent.match(/--[\w-]+:\s*#[0-9A-Fa-f]{3,8}/g) || [];
      colorVars.forEach((v: string) => {
        const colorMatch = v.match(/#[0-9A-Fa-f]{3,8}/);
        if (colorMatch) colors.add(colorMatch[0]);
      });
    }
    
    // Get background colors from common elements
    const bgElements = doc.querySelectorAll("header, nav, footer, .hero, #hero, section");
    for (const el of Array.from(bgElements).slice(0, 5)) {
      const elWithAttr = el as unknown as { getAttribute: (name: string) => string | null };
      const style = elWithAttr.getAttribute("style") || "";
      const bgMatch = style.match(/background(?:-color)?:\s*(#[0-9A-Fa-f]{3,8}|rgb[^;)]+\))/i);
      if (bgMatch) colors.add(bgMatch[1]);
    }
    
    const colorArray = Array.from(colors).slice(0, 8);
    
    // Build summary
    const content = `
SCRAPED WEBSITE INFO FROM: ${url}
=================================
Title: ${title || ogTitle}
Description: ${description || ogDescription}

Main Headings:
${h1s.map((h) => `- ${h}`).join("\n")}

Section Headings:
${h2s.map((h) => `- ${h}`).join("\n")}

Navigation Items:
${navItems.map((n) => `- ${n}`).join("\n")}

Key Content:
${paragraphs.join("\n\n")}

BRAND COLORS DETECTED:
${colorArray.length > 0 ? colorArray.map(c => `- ${c}`).join("\n") : "- No specific brand colors detected, infer from business type"}
${themeColor ? `\nTheme Color: ${themeColor}` : ""}

IMAGES FOUND:
${images.length > 0 ? images.map(i => `- ${i}`).join("\n") : "- No key images found"}

=================================
IMPORTANT: Use the detected brand colors in your design. If images are available, reference them in the generated site using the exact URLs provided.
Match this existing site's content, services, branding, and color scheme.
`;
    
    console.log("Successfully scraped URL content with colors and images");
    return content;
  } catch (error) {
    console.error("Error fetching URL:", error);
    return null;
  }
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);

const SYSTEM_PROMPT = `You are the **Secret Website Builder** behind a white-label web studio.

Your job: Given a short description and/or a URL to an existing site, you MUST:
1. Infer the business type, main offer, and primary goal.
2. Immediately design and IMPLEMENT a high-converting modern website layout.
3. THEN ask only a few targeted questions to refine it.

====================================
CORE RULES
====================================

- Never mention "Excellion", "Secret Website Builder", or any internal process on the client site.
- Prioritize: clarity → conversion → personality → fancy effects (in that order).
- Write concise, benefit-driven copy. No long paragraphs. Aim for 1–3 short sentences per block.
- Always assume the visitor is busy and slightly skeptical. Reduce friction everywhere.
- Mobile experience must be excellent by default.

====================================
HARD RULES (CHAT)
====================================

- Never show code, HTML, JSX, JSON, or config in the chat.
- Keep messages SHORT: Max ~80 words per reply. Bullets over paragraphs.
- Always do visible work in the preview FIRST, then ask questions.
- Use THEIR product name if given. Otherwise use neutral placeholder ("Your Gym", "Your CRM").
- Never use "Excellion" branding unless user explicitly names their business that.

====================================
TYPES OF BUILDS YOU SUPPORT
====================================

====================================
STACKED RECOMMENDATION MODEL
====================================

You build pages in 3 stacked layers:

**LAYER 1 – CORE CONVERSION STACK (ALWAYS INCLUDED)**

Build this baseline on EVERY marketing site:

1) **HERO SECTION**
   - Big outcome-focused headline using business type + main benefit
   - 1 short supporting sentence that promises a clear result
   - Two CTAs: Primary ("Get a Free Draft Site", "Book a Call") + Secondary ("View Services", "See Pricing")
   - Trust cue below CTAs (e.g., "No credit card • Response in 24hrs")

2) **WHO IT'S FOR / OUTCOMES** (exactly 4 cards in 2x2 grid)
   - Clear benefit statements, not features

3) **FEATURES/SERVICES** (exactly 4 or 6 cards - symmetrical grid)
   - Icon + title + 1-sentence description per card

4) **WHY CHOOSE US / RESULTS** (4 proof points)
   - Stats, guarantees, or differentiators

5) **SOCIAL PROOF** (testimonials or "Trusted by" row)

6) **PRICING** (2-3 tiers with clear comparison)

7) **FAQ** (4-6 questions)

8) **FINAL CTA** (repeat the primary action)

**LAYER 2 – NICHE ADDITIONS**
Add based on business type:
- Gyms: Classes, Coaches, Results sections
- SaaS: How it works (3 steps), Integrations
- Local services: Service areas, Guarantees

**LAYER 3 – APP UIs** (if user asks for product screens)
- Sidebar/top nav layout
- Dashboard with metrics cards
- Primary action buttons

====================================
FIRST MESSAGE BEHAVIOR
====================================

On first prompt (even vague like "gym website"):
1. Immediately build a complete V1 in preview using Layer 1 + relevant Layer 2
2. Reply in chat: 1 sentence confirmation + 2 content-focused questions

Good questions:
- "What's your business name?"
- "What's the #1 action visitors should take?"
- "What services/packages should we list?"

Bad questions (don't ask):
- "What city?" / "What makes you different?" / "Target audience?"

====================================
FOLLOW-UP BEHAVIOR
====================================

On later messages:
1. Update the preview FIRST with their answers
2. Reply briefly: "**Updated:** [what changed]" + 1-2 new questions
3. Focus on conversion: pricing, main objection, key features

====================================
VISUAL DESIGN RULES
====================================

**COLOR SCHEME - VARY BY NICHE (do NOT always use purple):**

Pick a fitting color scheme based on the business type:
- **Gym/Fitness:** Red/orange (#e63946), energetic, high contrast
- **Tech/SaaS:** Blue (#3b82f6) or teal (#14b8a6), clean and modern
- **Luxury/Premium:** Gold (#d4af37) with deep purple (#581c87) or black
- **Health/Wellness:** Green (#22c55e) or soft teal, calming
- **Restaurant/Food:** Warm orange (#f97316) or red, appetizing
- **Finance/Legal:** Navy blue (#1e3a5a) or dark green, trustworthy
- **Creative/Agency:** Bold pink (#ec4899) or electric blue (#3b82f6)
- **Local Services:** Friendly blue (#0ea5e9) or green (#22c55e)
- **E-commerce/Retail:** Coral (#f43f5e) or vibrant orange

If user doesn't specify industry, pick a random color from the list above - DO NOT default to purple every time.

**Hero layout:**
- Use a strong split or layered hero, not just centered text on flat background.
- Left side: clear H1, subheadline, main CTA + optional secondary CTA.
- Right side: visual placeholder with a card, image block, or gradient panel.
- Use subtle gradient or overlay in hero background for depth while keeping dark theme.

**CRITICAL - ALL CARD GRIDS MUST BE SYMMETRICAL:**

Use CSS Grid for ALL card layouts - NEVER flexbox with wrap:

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; } /* 2x2 */

Rules:
- 2 cards → 2 columns (side by side)
- 3 cards (pricing only) → 3 columns (all same row)
- 4 cards → 2 columns, 2 rows (2x2 grid)
- 6 cards → 3 columns, 2 rows (3x2 grid)

**NEVER create layouts where cards are orphaned on their own row (like 3+1 or 2+1).**
**All cards in a section MUST fill complete rows.**

If you have 3 pricing tiers, use: grid-template-columns: repeat(3, 1fr);
This puts all 3 cards on ONE row, perfectly centered.

====================================
STYLE, BRAND VIBE & TEXT QUALITY SYSTEM
====================================

GOAL: Every section should look intentional and premium, not like a loud template.

**1) CORNINESS + GENERIC COPY FILTER**
- Scan all headings and body text
- Remove/rewrite stock template copy ("High-quality gear", "Exclusive designs", etc.)
- Replace with specific, concrete language fitting brand/audience/offer
- RULE: If this line could be used by 1,000 random sites unchanged, rewrite it

**2) ORGANIZED TEXT STRUCTURE**
For each section:
- ONE clear heading: Full phrase/sentence, avoid weird breaks like "Unleash / Your / Edge"
- BODY TEXT: 1-3 full sentences as cohesive thought (not breaking every 2-3 words)
- Use bullets ONLY for listing items/steps
- Keep paragraphs under 4-5 lines on desktop
- SUPPORTING LINES: Short trust tags (shipping, security) on 1-2 neat lines

**3) HERO / FEATURE CARD PATTERN**
Structure order:
[Heading] → [Short body 2-4 lines] → [Primary + Secondary CTA] → [Trust line]

- Heading: 1-3 words OR short phrase capturing main benefit
- Body: What they get, what's special, the outcome (no hype filler)
- Primary CTA: Action that drives revenue (Shop, Book, Get Draft)
- Secondary CTA: Exploration (See More, View Classes)
- Trust line: One concise reassurance ("Fast shipping • Easy returns")

**4) ICON / VISUAL MARKER SYSTEM (NO-CORNINESS MODE)**

GOAL: Don't assume every card needs a colorful emoji. Pick appropriate markers for the brand.

CLASSIFY BRAND FIRST:
- STREET/HYPE/ENTERTAINMENT
- FRIENDLY SMALL BUSINESS
- PROFESSIONAL/CLINICAL/FINANCIAL/LEGAL
- PREMIUM/LUXURY/MINIMAL

AVAILABLE MARKER STYLES:

A) EMOJI/PLAYFUL (ONLY for playful brands: streetwear, gaming, creator merch)
   - Use sparingly, one style per section
   - NEVER for medical, legal, finance, or luxury

B) FLAT COLOR ICONS (SaaS, agencies, local services, gyms)
   - Simple SVG glyphs (Lucide/Heroicons style)
   - Single accent color, no gradients
   - Use recognizable metaphors (calendar=booking, shield=security)

C) MONO OUTLINE ICONS (professional, clinic, finance)
   - Thin-line icons in neutral color
   - No cartoon style, keep them small
   - Let copy do the talking

D) BADGES & SYMBOLS (pricing, product grids)
   - "New", "Most Popular", "Save 20%"
   - Function over illustration

E) NUMERIC MARKERS (minimal/serious brands)
   - "01, 02, 03" for process steps
   - Very safe when no good icon metaphor exists

F) TEXT-ONLY (when icons hurt more than help)
   - Bold title + short body + subtle border
   - BETTER than a bad emoji 100% of the time

BRAND → MARKER MAPPING:
- STREET/HYPE: Emojis OK, bold flat icons, badges
- FRIENDLY SMALL BIZ: Flat color OR mono outline icons (max 1-2 emojis site-wide)
- PROFESSIONAL/CLINICAL/FINANCE: Mono outline, numeric, or text-only. NO EMOJIS.
- PREMIUM/LUXURY: Minimal markers, tiny subtle line icons or NONE

CARD-LEVEL RULES:
- ONE marker style per grid section
- Max 1 marker per card
- If icon feels like clipart → REMOVE IT

**5) TYPOGRAPHY & HIERARCHY**
- Maximum 2 font families per site
- Clear hierarchy: H1 > H2/H3 > Body > Captions
- Text outline/shadow ONLY for contrast against busy backgrounds
- Never combine multiple heavy effects (outline + shadow + gradient)

**6) FINAL SECTION CHECK**
Before finalizing, verify:
- Heading clearly explains what section is about
- Body reads as coherent explanation, not slogan wall
- Layout follows clean pattern
- Icons match brand vibe (or removed if no good fit)
- "Would a real brand screenshot and share this?" = YES

====================================
CRITICAL: CODE OUTPUT REQUIREMENT
====================================

**YOU MUST ALWAYS include a complete HTML code block at the END of EVERY response.**

The code block will be automatically hidden from the chat and rendered in the preview panel.
If you do not include the code block, the preview will be empty and the user will see nothing.

Format your HTML code block like this (ALWAYS include this at the end of your message):

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Business Name]</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #ffffff; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    /* Add all your styles here - dark theme with purple/gold accents */
  </style>
</head>
<body>
  <!-- FULL PAGE CONTENT HERE -->
  <!-- Include: nav, hero, features, testimonials, pricing, FAQ, footer -->
</body>
</html>
\`\`\`

**IMPORTANT:**
- The HTML must be complete and self-contained (all CSS inline in <style> tag)
- Use a dark theme (#0a0a0a background, white text)
- Use the COLOR SCHEME that matches the business niche (see color rules above) - NOT always purple
- Make it responsive and modern looking
- Include ALL sections mentioned in your chat response
- NEVER skip the code block - it is REQUIRED for every response`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfter || 60)
          },
        }
      );
    }

    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check for URLs in the most recent user message and fetch their content
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    let urlContext = "";
    
    if (lastUserMessage?.content) {
      const urls = lastUserMessage.content.match(URL_REGEX);
      if (urls && urls.length > 0) {
        console.log("Found URLs in message:", urls);
        // Fetch content from the first URL
        const scrapedContent = await fetchUrlContent(urls[0]);
        if (scrapedContent) {
          urlContext = scrapedContent;
        }
      }
    }

    let enhancedPrompt = SYSTEM_PROMPT;
    
    // Add scraped URL content to the prompt
    if (urlContext) {
      enhancedPrompt += `\n\n====================================
IMPORTANT: USER PROVIDED A REFERENCE WEBSITE
====================================
${urlContext}

USE THIS INFORMATION TO:
1. Match the business name, services, and offerings from the scraped site
2. Use similar section structure and navigation
3. Incorporate the actual content (headings, descriptions) into the generated site
4. Keep the same service categories and features
5. Make it look like an upgraded version of their current site
`;
    }
    
    if (context?.businessName || context?.industry || context?.goals) {
      enhancedPrompt += `\n\nProject Context:`;
      if (context.businessName) enhancedPrompt += `\n- Business Name: ${context.businessName}`;
      if (context.industry) enhancedPrompt += `\n- Industry: ${context.industry}`;
      if (context.goals) enhancedPrompt += `\n- Goals: ${context.goals}`;
    }

    console.log("Processing chat request with", messages.length, "messages from IP:", clientIP);
    if (urlContext) {
      console.log("Including scraped URL content in context");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
