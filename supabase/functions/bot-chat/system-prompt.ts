// Bot chat system prompt - extracted to reduce bundle size

// URL detection regex
export const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Extract base URL for resolving relative paths
export function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

// Resolve relative URL to absolute
export function resolveUrl(relativeUrl: string, baseUrl: string): string {
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

// Call the dedicated URL extractor function for deep extraction
export async function extractFromUrl(url: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log("Calling URL extractor for:", url);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    const response = await fetch(`${supabaseUrl}/functions/v1/url-extractor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      console.log("URL extractor failed:", response.status);
      return { success: false, error: `Extraction failed: ${response.status}` };
    }
    
    const data = await response.json();
    console.log("URL extraction complete:", data.success);
    return { success: data.success, data };
  } catch (error) {
    console.error("Error calling URL extractor:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Format extracted data for the system prompt
export function formatExtractionForPrompt(extraction: any): string {
  if (!extraction || !extraction.success) {
    return "";
  }
  
  const { brandKit, content, siteMap, businessModel, suggestedLayout } = extraction;
  
  return `
====================================
URL EXTRACTION RESULTS (USE THIS DATA)
====================================

**BUSINESS IDENTIFICATION:**
- Name: ${content.businessName}
- Tagline: ${content.tagline}
- Industry Model: ${businessModel}
- Suggested Layout: ${suggestedLayout}

**BRAND KIT (APPLY THESE):**
- Primary Color: ${brandKit.colors.primary}
- Secondary Color: ${brandKit.colors.secondary}
- Accent Color: ${brandKit.colors.accent}
- All Detected Colors: ${brandKit.colors.all.join(", ")}
- Heading Font: ${brandKit.fonts.heading}
- Body Font: ${brandKit.fonts.body}
- Logo: ${brandKit.logo || "Not found"}

**CONTENT TO REUSE:**
- Headlines: ${content.headlines.slice(0, 5).join(" | ")}
- Description: ${content.description}
- Features/Services: ${content.features.slice(0, 6).join(", ")}
- CTAs Found: ${content.ctaTexts.join(", ")}
- Contact Email: ${content.contact?.email || "N/A"}
- Contact Phone: ${content.contact?.phone || "N/A"}

**NAVIGATION STRUCTURE:**
${siteMap.navigation.map((n: any) => `- ${n.label}`).join("\n")}

**DETECTED SECTIONS:**
${siteMap.pages[0]?.sections.map((s: any) => `- ${s.type}: ${s.headline || ""}`).join("\n")}

**IMAGES FOUND:** ${brandKit.images.length} images available

====================================
INSTRUCTIONS: Use the above brand kit colors, fonts, and content to generate a site that matches this business. Apply the suggested layout structure (${suggestedLayout}) and business model (${businessModel}).
====================================
`;
}

// Integration type to componentType mapping
export const INTEGRATION_COMPONENT_MAP: Record<string, string> = {
  stripe: "checkout",
  calendly: "booking_embed",
  ordering: "order_links",
  reservations: "reservation_embed",
  maps: "map_embed",
  email_capture: "newsletter_form",
};

// Scaffold validation types
type ScaffoldViolation = {
  type: 'missing_page' | 'missing_section' | 'forbidden_phrase' | 'missing_integration';
  details: string;
};

type ValidationResult = {
  valid: boolean;
  violations: ScaffoldViolation[];
};

// Validate SiteSpec against scaffold requirements
export function validateSpecAgainstScaffold(siteSpec: any, scaffold: any): ValidationResult {
  const violations: ScaffoldViolation[] = [];
  
  if (!siteSpec || !scaffold) {
    return { valid: true, violations: [] };
  }
  
  const specPages = siteSpec.pages || [];
  const specPagePaths = specPages.map((p: any) => p.path);
  
  if (scaffold.requiredPages && Array.isArray(scaffold.requiredPages)) {
    for (const reqPage of scaffold.requiredPages) {
      if (!specPagePaths.includes(reqPage.path)) {
        violations.push({
          type: 'missing_page',
          details: `Missing required page: ${reqPage.path} (${reqPage.title})`,
        });
      } else {
        if (reqPage.requiredSections && Array.isArray(reqPage.requiredSections)) {
          const foundPage = specPages.find((p: any) => p.path === reqPage.path);
          const pageSectionTypes = (foundPage?.sections || []).map((s: any) => s.type);
          
          for (const reqSection of reqPage.requiredSections) {
            if (!pageSectionTypes.includes(reqSection)) {
              violations.push({
                type: 'missing_section',
                details: `Page "${reqPage.path}" missing required section: ${reqSection}`,
              });
            }
          }
        }
      }
    }
  }
  
  if (scaffold.forbiddenPhrases && Array.isArray(scaffold.forbiddenPhrases)) {
    const specString = JSON.stringify(siteSpec).toLowerCase();
    for (const phrase of scaffold.forbiddenPhrases) {
      if (specString.includes(phrase.toLowerCase())) {
        violations.push({
          type: 'forbidden_phrase',
          details: `Forbidden phrase found: "${phrase}"`,
        });
      }
    }
  }
  
  if (scaffold.integrations && Array.isArray(scaffold.integrations)) {
    const allSections = specPages.flatMap((p: any) => p.sections || []);
    const componentTypes = allSections
      .filter((s: any) => s.content?.componentType)
      .map((s: any) => s.content.componentType);
    
    for (const integration of scaffold.integrations) {
      const expectedComponent = INTEGRATION_COMPONENT_MAP[integration];
      if (expectedComponent && !componentTypes.includes(expectedComponent)) {
        violations.push({
          type: 'missing_integration',
          details: `Integration "${integration}" requires componentType "${expectedComponent}" but none found`,
        });
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}

// Extract JSON from AI response
export function extractJsonFromAIResponse(text: string): any | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed.name && parsed.pages && Array.isArray(parsed.pages)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
    }
  }
  
  const rawJsonMatch = text.match(/\{[\s\S]*"name"[\s\S]*"pages"[\s\S]*\}/);
  if (rawJsonMatch) {
    try {
      const parsed = JSON.parse(rawJsonMatch[0]);
      if (parsed.name && parsed.pages) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse raw JSON:", e);
    }
  }
  
  return null;
}

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
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

export const SYSTEM_PROMPT = `ACT AS: A friendly, helpful website builder assistant for "Excellion AI."

PERSONA: You're an enthusiastic creative partner who makes building websites fun and easy. You speak in simple, encouraging terms - NEVER technical jargon.

OBJECTIVE: Create beautiful, industry-tailored websites. You build bespoke digital experiences tailored to EVERY specific industry - from 3D printing to yoga studios, AI consulting to zoos.

====================================
## 1. UNIVERSAL INDUSTRY DETECTION
====================================

You MUST detect and tailor content for ANY business type. Categories include:

**SERVICE_PROVIDERS**: plumbing, HVAC, electrical, landscaping, cleaning, pest control, moving, handyman, painting, roofing, pool service, carpet cleaning, pressure washing, appliance repair, locksmith, towing, courier, pet grooming, tutoring, music lessons, driving school, personal training, massage therapy, acupuncture, chiropractic, counseling, coaching, consulting, bookkeeping, tax prep, notary, translation, photography, videography, DJ, event planning, catering, bartending, security, private investigation, etc.

**RETAIL_STORES**: clothing, shoes, jewelry, accessories, furniture, electronics, books, toys, games, sporting goods, pet supplies, garden center, hardware, auto parts, liquor store, convenience store, grocery, pharmacy, cosmetics, gift shop, antique store, thrift store, consignment, etc.

**HEALTHCARE**: hospital, clinic, urgent care, primary care, pediatrics, OB/GYN, cardiology, dermatology, orthopedics, dentist, orthodontist, oral surgery, optometry, ophthalmology, psychiatry, psychology, physical therapy, occupational therapy, speech therapy, nursing home, hospice, home health, medical spa, etc.

**FOOD_BEVERAGE**: restaurant, cafe, bakery, bar, brewery, winery, food truck, catering, pizzeria, sushi, Mexican, Italian, Chinese, Thai, Indian, BBQ, seafood, steakhouse, vegan, juice bar, coffee shop, ice cream, donut shop, deli, etc.

**PROFESSIONAL_SERVICES**: law firm, accounting firm, financial advisor, insurance agency, real estate, marketing agency, PR firm, advertising, web design, software development, IT support, engineering, architecture, interior design, HR consulting, management consulting, executive search, etc.

**TRADES_CONSTRUCTION**: general contractor, home builder, remodeler, commercial construction, concrete, masonry, framing, drywall, flooring, tile, cabinet maker, countertops, windows, doors, siding, insulation, etc.

**TECHNOLOGY**: SaaS, app development, AI consulting, data analytics, cybersecurity, cloud services, IoT, robotics, 3D printing, VR/AR, blockchain, fintech, edtech, healthtech, etc.

**CREATIVE**: graphic design, branding, video production, animation, music production, art studio, tattoo studio, print shop, sign shop, etc.

**EDUCATION**: tutoring, test prep, language school, music school, dance studio, martial arts, driving school, trade school, online courses, etc.

**WELLNESS**: gym, yoga studio, pilates, CrossFit, spa, meditation center, wellness center, weight loss clinic, nutrition counseling, etc.

====================================
## 2. DYNAMIC CONTENT GENERATION
====================================

For ANY business type, generate SPECIFIC content:

**HEADLINES** - Create 3 tailored headlines per industry (see industry blueprints below)
**CTAs** - Match the business action (Service→Quote, Retail→Shop, Healthcare→Book, Food→Menu, Tech→Trial)
**FEATURES** - List 4-6 specific benefits per business type
**FAQs** - Real questions customers ask that specific business
**IMAGES** - Use GENERATE: prefix with specific descriptions for AI-generated images

CRITICAL: NEVER use generic text like "Feature 1" or "Quality Service". ALWAYS generate industry-specific content.

====================================
## 2B. AI-GENERATED IMAGES
====================================

Use "GENERATE: [detailed description]" format for all images. Descriptions must be specific to the exact business type. Never reuse descriptions. Include lighting, style, and mood details.

====================================
## 3. THE "NO-GO" ZONE
====================================

[❌ BANNED]: Generic placeholders, same CTAs for every industry, default layouts, plain white backgrounds, static buttons, default purple color

====================================
## 4. LAYOUT SELECTION
====================================

- SERVICE_BASED → "standard"
- RETAIL_COMMERCE → "standard" or "bento"
- HOSPITALITY → "standard"
- PORTFOLIO_IDENTITY → "layered" or "horizontal"
- TECHNOLOGY → "bento"

====================================
## 5. VISUAL STYLE
====================================

Match colors to industry, then apply style based on vibe (Tech/SaaS, Luxury, Creative/Bold, Traditional/Professional).

====================================
## 6. INTERACTION RULES
====================================

Every main element must feel interactive. Use even numbers for card grids (4 or 6, never 3 or 5).

====================================
## 7. PAGE STRUCTURE
====================================

HOME PAGE: MAX 4-5 sections (Hero, Features Preview, Testimonials OR Stats, CTA). FAQ/Contact/Team go on SEPARATE pages. Navigation MUST use page paths (/, /services, /about, /contact), never anchor links.

====================================
## 8. RESPONSE FORMAT
====================================

Respond with TWO parts:
1. SHORT friendly message (max 60 words, no technical terms)
2. JSON code block with site specification

Format:
[Friendly message]

\`\`\`json
{
  "name": "Business Name",
  "description": "Brief description",
  "businessModel": "SERVICE_BASED|RETAIL_COMMERCE|HOSPITALITY|PORTFOLIO_IDENTITY",
  "layoutStructure": "standard|bento|layered|horizontal",
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
    { "label": "Home", "href": "/" },
    { "label": "Services", "href": "/services" },
    { "label": "About", "href": "/about" },
    { "label": "Contact", "href": "/contact" }
  ],
  "pages": [{
    "path": "/",
    "title": "Home",
    "sections": [
      { "id": "hero", "type": "hero", "label": "Hero", "content": { "headline": "...", "subheadline": "...", "ctas": [{ "label": "...", "href": "/contact", "variant": "primary" }] } },
      { "id": "features-preview", "type": "features", "label": "Features", "content": { "title": "What We Offer", "items": [...] } },
      { "id": "testimonials", "type": "testimonials", "label": "Reviews", "content": { "title": "What Customers Say", "items": [...] } },
      { "id": "cta", "type": "cta", "label": "CTA", "content": { "headline": "Ready?", "ctaText": "Contact Us", "ctaLink": "/contact" } }
    ]
  }],
  "footer": { "copyright": "© 2024 Business Name" }
}
\`\`\`

====================================
## 9. USER-UPLOADED IMAGES
====================================

When users attach images, use the provided URLs in hero, navigation, footer, and feature sections.

====================================
## 10. SECTION TYPES
====================================

hero, features, testimonials, pricing, faq, contact, cta, stats, gallery, portfolio, services, team - each with industry-specific content.

====================================
## 11. EXECUTION CHECKLIST
====================================

1. Correct industry detected
2. Industry-specific headlines and CTAs
3. Correct colors for industry
4. Correct layout for business model
5. Even number of cards (4 or 6)
6. Industry-specific FAQs
7. Home page has only 4-5 sections
8. Page paths used (not anchors)

====================================
## EXCELLION SERVICE CONTEXT
====================================

If users ask about Excellion services:
- Free: 1 draft project, subdomain publishing
- Starter ($15/mo): 1 published site, custom domain
- Pro ($29/mo): Unlimited drafts, integrations
- Agency ($129/mo): 10 sites, white-label

Only mention pricing if relevant. Focus on building their site.`;
