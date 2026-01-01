import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ RATE LIMITING ============

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         req.headers.get("x-real-ip") ||
         req.headers.get("cf-connecting-ip") ||
         "unknown";
}

// ============ SSRF PROTECTION ============

// Private/internal IP ranges that should be blocked
const BLOCKED_IP_PATTERNS = [
  /^127\./,                          // Loopback
  /^10\./,                           // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private Class B
  /^192\.168\./,                     // Private Class C
  /^169\.254\./,                     // Link-local
  /^0\./,                            // Current network
  /^224\./,                          // Multicast
  /^240\./,                          // Reserved
  /^255\./,                          // Broadcast
  /^::1$/,                           // IPv6 loopback
  /^fe80:/i,                         // IPv6 link-local
  /^fc00:/i,                         // IPv6 unique local
  /^fd00:/i,                         // IPv6 unique local
];

// Blocked hostnames
const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  '0.0.0.0',
  '[::]',
  '[::1]',
  'metadata.google.internal',        // GCP metadata
  '169.254.169.254',                 // Cloud metadata endpoints
  'metadata.google',
  'metadata',
];

// Blocked URL schemes
const ALLOWED_SCHEMES = ['http:', 'https:'];

// Validate URL is safe from SSRF attacks
async function validateUrlSecurity(urlString: string): Promise<{ safe: boolean; error?: string }> {
  try {
    const url = new URL(urlString);
    
    // Check scheme
    if (!ALLOWED_SCHEMES.includes(url.protocol)) {
      return { safe: false, error: `Blocked scheme: ${url.protocol}` };
    }
    
    // Check for blocked hostnames
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      return { safe: false, error: `Blocked hostname: ${hostname}` };
    }
    
    // Check for IP address patterns in hostname
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, error: `Blocked internal IP: ${hostname}` };
      }
    }
    
    // Resolve DNS to check for internal IPs
    try {
      const addresses = await Deno.resolveDns(hostname, "A");
      for (const ip of addresses) {
        for (const pattern of BLOCKED_IP_PATTERNS) {
          if (pattern.test(ip)) {
            console.warn(`DNS resolution blocked: ${hostname} -> ${ip}`);
            return { safe: false, error: `Hostname resolves to blocked IP: ${ip}` };
          }
        }
      }
    } catch (dnsError) {
      // If DNS resolution fails for non-IP hostnames, allow the request
      // The fetch will fail naturally if the host doesn't exist
      console.log(`DNS resolution skipped for ${hostname}:`, dnsError);
    }
    
    // Check for suspicious port numbers (only allow 80, 443, or default)
    const port = url.port;
    if (port && !['80', '443', ''].includes(port)) {
      // Allow common web ports but block internal service ports
      const portNum = parseInt(port, 10);
      if (portNum < 1024 || [3000, 5000, 8080, 8443, 9000].includes(portNum)) {
        // These are common dev ports, allow them for flexibility
      } else if (portNum > 49151) {
        return { safe: false, error: `Suspicious port number: ${port}` };
      }
    }
    
    return { safe: true };
  } catch (parseError) {
    return { safe: false, error: `Invalid URL: ${parseError}` };
  }
}

// Color extraction patterns
const HEX_COLOR_REGEX = /#([0-9A-Fa-f]{3,8})\b/g;
const RGB_COLOR_REGEX = /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi;
const HSL_COLOR_REGEX = /hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/gi;
const CSS_VAR_REGEX = /--[\w-]+:\s*([^;]+)/g;

// Font extraction patterns
const FONT_FAMILY_REGEX = /font-family:\s*([^;]+)/gi;
const GOOGLE_FONTS_REGEX = /fonts\.googleapis\.com\/css[^"'\s)]+/gi;

interface BrandKit {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    all: string[];
  };
  fonts: {
    heading: string;
    body: string;
    all: string[];
  };
  logo: string | null;
  favicon: string | null;
  images: string[];
}

interface PageSection {
  type: string;
  headline?: string;
  content?: string;
  items?: string[];
}

interface SiteMap {
  pages: {
    path: string;
    title: string;
    sections: PageSection[];
  }[];
  navigation: { label: string; href: string }[];
}

interface ContentExtraction {
  businessName: string;
  tagline: string;
  description: string;
  headlines: string[];
  paragraphs: string[];
  ctaTexts: string[];
  features: string[];
  testimonials: { quote: string; author?: string }[];
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

interface ExtractionResult {
  success: boolean;
  sourceUrl: string;
  brandKit: BrandKit;
  siteMap: SiteMap;
  content: ContentExtraction;
  businessModel: string;
  suggestedLayout: string;
}

// Resolve relative URL to absolute
function resolveUrl(relativeUrl: string, baseUrl: string): string {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("data:")) return relativeUrl;
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) return relativeUrl;
  if (relativeUrl.startsWith("//")) return `https:${relativeUrl}`;
  
  try {
    const base = new URL(baseUrl);
    if (relativeUrl.startsWith("/")) {
      return `${base.protocol}//${base.host}${relativeUrl}`;
    }
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return relativeUrl;
  }
}

// Extract colors from CSS text
function extractColors(cssText: string): string[] {
  const colors = new Set<string>();
  const ignoredColors = new Set([
    "#fff", "#ffffff", "#000", "#000000", "#333", "#333333",
    "#666", "#666666", "#999", "#999999", "#ccc", "#cccccc",
    "transparent", "inherit", "initial", "currentColor"
  ]);
  
  // Extract hex colors
  const hexMatches = cssText.match(HEX_COLOR_REGEX) || [];
  hexMatches.forEach(c => {
    const lower = c.toLowerCase();
    if (!ignoredColors.has(lower)) colors.add(lower);
  });
  
  // Extract from CSS variables
  let varMatch;
  while ((varMatch = CSS_VAR_REGEX.exec(cssText)) !== null) {
    const value = varMatch[1].trim();
    if (value.startsWith("#") && !ignoredColors.has(value.toLowerCase())) {
      colors.add(value.toLowerCase());
    }
  }
  
  return Array.from(colors).slice(0, 10);
}

// Extract fonts from CSS and HTML
function extractFonts(doc: Document, html: string): string[] {
  const fonts = new Set<string>();
  const defaultFonts = new Set([
    "arial", "helvetica", "times", "times new roman", "georgia",
    "verdana", "courier", "sans-serif", "serif", "monospace", "system-ui"
  ]);
  
  // From inline styles and stylesheets
  let match;
  while ((match = FONT_FAMILY_REGEX.exec(html)) !== null) {
    const fontList = match[1].split(",").map(f => 
      f.trim().replace(/['"]/g, "").toLowerCase()
    );
    fontList.forEach(f => {
      if (!defaultFonts.has(f) && f.length > 1) {
        fonts.add(f.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
      }
    });
  }
  
  // From Google Fonts links
  const googleFontsMatches = html.match(GOOGLE_FONTS_REGEX) || [];
  googleFontsMatches.forEach(url => {
    const familyMatch = url.match(/family=([^&:]+)/);
    if (familyMatch) {
      const families = familyMatch[1].split("|");
      families.forEach(f => fonts.add(decodeURIComponent(f.replace(/\+/g, " "))));
    }
  });
  
  return Array.from(fonts).slice(0, 5);
}

// Classify business model from content
function classifyBusinessModel(content: ContentExtraction, navItems: string[]): string {
  const allText = [
    content.description,
    ...content.headlines,
    ...content.features,
    ...navItems
  ].join(" ").toLowerCase();
  
  if (/shop|store|cart|buy|product|checkout|price|sale/i.test(allText)) {
    return "RETAIL_COMMERCE";
  }
  if (/menu|reserv|book.*table|restaurant|cuisine|dine/i.test(allText)) {
    return "HOSPITALITY";
  }
  if (/portfolio|work|project|case stud|gallery|design/i.test(allText)) {
    return "PORTFOLIO_IDENTITY";
  }
  return "SERVICE_BASED";
}

// Suggest layout based on business model
function suggestLayout(businessModel: string): string {
  switch (businessModel) {
    case "RETAIL_COMMERCE": return "horizontal";
    case "HOSPITALITY": return "layered";
    case "PORTFOLIO_IDENTITY": return "layered";
    default: return "bento";
  }
}

// Main extraction function
async function extractFromUrl(url: string): Promise<ExtractionResult> {
  console.log("Starting deep extraction for:", url);
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }
  
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  if (!doc) {
    throw new Error("Failed to parse HTML");
  }
  
  const baseUrl = new URL(url).origin;
  
  // ============ BRAND KIT EXTRACTION ============
  
  // Extract all CSS
  let allCss = "";
  doc.querySelectorAll("style").forEach((el: any) => {
    allCss += el.textContent || "";
  });
  allCss += html; // Include inline styles
  
  const extractedColors = extractColors(allCss);
  const extractedFonts = extractFonts(doc as any, html);
  
  // Get logo
  let logo: string | null = null;
  const logoSelectors = [
    'img[class*="logo"]', 'img[id*="logo"]', 'img[alt*="logo"]',
    'header img:first-child', '.logo img', '#logo img',
    'a[class*="logo"] img', 'a[href="/"] img'
  ];
  for (const selector of logoSelectors) {
    const logoEl = doc.querySelector(selector);
    if (logoEl) {
      const src = logoEl.getAttribute("src");
      if (src) {
        logo = resolveUrl(src, baseUrl);
        break;
      }
    }
  }
  
  // Get favicon
  let favicon: string | null = null;
  const faviconEl = doc.querySelector('link[rel*="icon"]');
  if (faviconEl) {
    const href = faviconEl.getAttribute("href");
    if (href) favicon = resolveUrl(href, baseUrl);
  }
  
  // Get key images
  const images: string[] = [];
  doc.querySelectorAll("img").forEach((img: any) => {
    const src = img.getAttribute("src");
    if (src && !src.includes("logo") && !src.includes("icon") && !src.startsWith("data:")) {
      const resolved = resolveUrl(src, baseUrl);
      if (resolved && images.length < 10) images.push(resolved);
    }
  });
  
  const brandKit: BrandKit = {
    colors: {
      primary: extractedColors[0] || "#3b82f6",
      secondary: extractedColors[1] || "#1e293b",
      accent: extractedColors[2] || "#f97316",
      background: "#0a0a0a",
      text: "#f3f4f6",
      all: extractedColors,
    },
    fonts: {
      heading: extractedFonts[0] || "Inter",
      body: extractedFonts[1] || extractedFonts[0] || "Inter",
      all: extractedFonts,
    },
    logo,
    favicon,
    images,
  };
  
  // ============ CONTENT EXTRACTION ============
  
  const title = doc.querySelector("title")?.textContent?.trim() || "";
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";
  const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";
  
  // Headlines
  const headlines: string[] = [];
  doc.querySelectorAll("h1, h2").forEach((el: any) => {
    const text = el.textContent?.trim();
    if (text && text.length > 3 && text.length < 150 && headlines.length < 10) {
      headlines.push(text);
    }
  });
  
  // Paragraphs
  const paragraphs: string[] = [];
  doc.querySelectorAll("p").forEach((el: any) => {
    const text = el.textContent?.trim();
    if (text && text.length > 50 && text.length < 500 && paragraphs.length < 8) {
      paragraphs.push(text);
    }
  });
  
  // CTA texts
  const ctaTexts: string[] = [];
  doc.querySelectorAll("a, button").forEach((el: any) => {
    const text = el.textContent?.trim();
    if (text && text.length > 2 && text.length < 40) {
      const lower = text.toLowerCase();
      if (/get|start|book|contact|learn|try|sign|subscribe|shop|buy|order/i.test(lower)) {
        if (!ctaTexts.includes(text) && ctaTexts.length < 6) {
          ctaTexts.push(text);
        }
      }
    }
  });
  
  // Features/services (from lists)
  const features: string[] = [];
  doc.querySelectorAll("li, [class*='feature'], [class*='service']").forEach((el: any) => {
    const text = el.textContent?.trim();
    if (text && text.length > 10 && text.length < 100 && features.length < 8) {
      if (!features.includes(text)) features.push(text);
    }
  });
  
  // Testimonials
  const testimonials: { quote: string; author?: string }[] = [];
  doc.querySelectorAll('[class*="testimonial"], [class*="review"], blockquote').forEach((el: any) => {
    const quote = el.textContent?.trim();
    if (quote && quote.length > 20 && quote.length < 300 && testimonials.length < 4) {
      testimonials.push({ quote });
    }
  });
  
  // Contact info
  const contact: { email?: string; phone?: string; address?: string } = {};
  const emailMatch = html.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) contact.email = emailMatch[0];
  const phoneMatch = html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) contact.phone = phoneMatch[0];
  
  // Business name from title or og:site_name
  let businessName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute("content") || "";
  if (!businessName) {
    businessName = title.split(/[|–-]/)[0]?.trim() || title;
  }
  
  const content: ContentExtraction = {
    businessName,
    tagline: ogTitle || headlines[0] || "",
    description: ogDesc || metaDesc || paragraphs[0] || "",
    headlines,
    paragraphs,
    ctaTexts,
    features,
    testimonials,
    contact,
  };
  
  // ============ SITE MAP EXTRACTION ============
  
  const navigation: { label: string; href: string }[] = [];
  doc.querySelectorAll("nav a, header a").forEach((el: any) => {
    const label = el.textContent?.trim();
    const href = el.getAttribute("href");
    if (label && href && label.length < 30 && navigation.length < 8) {
      if (!navigation.some(n => n.label === label)) {
        navigation.push({ label, href });
      }
    }
  });
  
  // Detect sections from page structure
  const sections: PageSection[] = [];
  
  // Hero section
  sections.push({
    type: "hero",
    headline: headlines[0] || businessName,
    content: paragraphs[0] || metaDesc,
  });
  
  // Features section if we have features
  if (features.length >= 3) {
    sections.push({
      type: "features",
      headline: "What We Offer",
      items: features.slice(0, 6),
    });
  }
  
  // Testimonials if found
  if (testimonials.length > 0) {
    sections.push({
      type: "testimonials",
      headline: "What People Say",
      items: testimonials.map(t => t.quote),
    });
  }
  
  // Contact section
  if (contact.email || contact.phone) {
    sections.push({
      type: "contact",
      headline: "Get in Touch",
    });
  }
  
  // CTA section
  sections.push({
    type: "cta",
    headline: ctaTexts[0] ? `Ready to ${ctaTexts[0]}?` : "Ready to Get Started?",
  });
  
  const siteMap: SiteMap = {
    pages: [{
      path: "/",
      title: "Home",
      sections,
    }],
    navigation: [],
  };
  
  // ============ CLASSIFICATION ============
  
  const businessModel = classifyBusinessModel(content, navigation.map(n => n.label));
  const suggestedLayoutType = suggestLayout(businessModel);
  
  console.log("Extraction complete:", {
    businessName: content.businessName,
    businessModel,
    suggestedLayout: suggestedLayoutType,
    colorsFound: extractedColors.length,
    fontsFound: extractedFonts.length,
  });
  
  return {
    success: true,
    sourceUrl: url,
    brandKit,
    siteMap,
    content,
    businessModel,
    suggestedLayout: suggestedLayoutType,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000))
        } 
      }
    );
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // SSRF protection: validate URL before fetching
    const securityCheck = await validateUrlSecurity(normalizedUrl);
    if (!securityCheck.safe) {
      console.warn(`SSRF blocked: ${normalizedUrl} - ${securityCheck.error}`);
      return new Response(
        JSON.stringify({ success: false, error: "URL not allowed for security reasons" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const result = await extractFromUrl(normalizedUrl);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("URL extraction error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Extraction failed" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
