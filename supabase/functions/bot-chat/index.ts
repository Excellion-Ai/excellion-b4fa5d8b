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

const SYSTEM_PROMPT = `You are the Secret Website Builder AI. Your job is to generate complete, structured website specifications based on user descriptions.

====================================
RESPONSE FORMAT - CRITICAL
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
        "content": {
          "headline": "Main headline here",
          "subheadline": "Supporting text",
          "ctas": [
            { "label": "Get Started", "href": "#contact", "variant": "primary" }
          ]
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
SECTION TYPES & CONTENT STRUCTURE
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
Use 4 or 6 items (never 3 or 5 - must be even for grid layout)

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
    { "name": "Basic", "price": "$29/mo", "features": ["Feature 1", "Feature 2"], "ctaText": "Get Started", "highlighted": false },
    { "name": "Pro", "price": "$79/mo", "features": ["Everything in Basic", "Feature 3"], "ctaText": "Get Started", "highlighted": true }
  ]
}
Use 2 or 3 pricing tiers

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

====================================
COLOR SCHEMES BY BUSINESS TYPE
====================================

Pick colors that match the business:
- Gym/Fitness: #e63946 (red), #f97316 (orange)
- Tech/SaaS: #3b82f6 (blue), #14b8a6 (teal)
- Luxury/Premium: #d4af37 (gold), #581c87 (purple)
- Health/Wellness: #22c55e (green)
- Restaurant/Food: #f97316 (orange), #dc2626 (red)
- Finance/Legal: #1e3a5a (navy), #064e3b (dark green)
- Creative/Agency: #ec4899 (pink), #8b5cf6 (purple)
- Local Services: #0ea5e9 (sky blue)

DO NOT default to purple every time. Match the industry!

====================================
REQUIRED SECTIONS
====================================

Every site MUST have:
1. hero - Main headline, value prop, CTAs
2. features - 4 or 6 benefits/services
3. testimonials OR pricing - Social proof or offerings
4. faq - 4-6 common questions
5. contact - Contact info and form
6. cta - Final call to action

====================================
COPY GUIDELINES
====================================

- Write specific, benefit-driven copy
- No generic phrases like "High-quality service" or "Best in class"
- Use the business name if provided
- Keep headlines under 10 words
- Keep descriptions under 25 words
- Be concrete: "Save 3 hours per week" > "Save time"

====================================
CRITICAL RULES
====================================

1. ALWAYS include the JSON code block - the preview depends on it
2. Keep chat message SHORT (under 80 words)
3. Use EVEN numbers for card grids (4 or 6, never 3 or 5)
4. Match colors to business type - don't always use purple
5. Never mention "Excellion" unless user names their business that`;

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

    const { messages, context } = await req.json();
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
