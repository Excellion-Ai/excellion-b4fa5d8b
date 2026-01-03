import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Banned phrases that should NEVER appear in generated content
const BANNED_PHRASES = [
  "welcome to",
  "we're passionate",
  "unlock your",
  "elevate your",
  "seamless experience",
  "cutting-edge",
  "state-of-the-art",
  "next-level",
  "world-class",
  "best-in-class",
  "industry-leading",
  "game-changing",
  "revolutionize",
  "synergy",
  "leverage",
  "paradigm",
  "holistic approach",
  "one-stop shop",
  "your trusted partner",
  "we pride ourselves",
  "excellion",
  "built with lovable",
  "ai-powered website builder",
];

// SaaS phrases that shouldn't appear for non-tech businesses
const SAAS_ONLY_PHRASES = [
  "start your free trial",
  "14-day trial",
  "no credit card required",
  "enterprise plan",
  "pro plan",
  "api access",
  "integrations",
  "sla",
  "uptime",
  "$29/month",
  "$99/month",
  "per seat",
  "per user",
];

// Generic CTAs that should be replaced with industry-specific ones
const GENERIC_CTAS = [
  "get started",
  "learn more", 
  "contact us",
  "sign up",
  "subscribe",
  "explore",
  "discover",
];

// Industry-specific CTA mappings
const INDUSTRY_CTAS: Record<string, string[]> = {
  restaurant: ["View Menu", "Reserve Table", "Order Online", "See Hours"],
  gym: ["Start Free Trial", "Join Now", "Book Class", "Get Membership"],
  salon: ["Book Appointment", "View Services", "Call Now"],
  plumber: ["Get Free Quote", "Call Now", "Emergency Service"],
  lawyer: ["Free Consultation", "Case Review", "Call Today"],
  dental: ["Book Appointment", "Schedule Cleaning", "Call Us"],
  contractor: ["Get Estimate", "Request Quote", "View Projects"],
  landscaping: ["Get Quote", "See Our Work", "Call Today"],
  real_estate: ["View Listings", "Schedule Tour", "Contact Agent"],
  auto: ["Book Service", "Get Quote", "Call Now"],
  ecommerce: ["Shop Now", "View Collection", "Browse Products"],
};

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[AUDIT:${requestId}] Started`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siteSpec, industry } = await req.json();
    
    if (!siteSpec) {
      return new Response(JSON.stringify({ error: "SiteSpec required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const issues: Array<{
      type: 'error' | 'warning' | 'suggestion';
      path: string;
      message: string;
      suggestion?: string;
    }> = [];

    // Flatten all text content from spec
    const allText = JSON.stringify(siteSpec).toLowerCase();
    
    // Check for banned phrases
    for (const phrase of BANNED_PHRASES) {
      if (allText.includes(phrase.toLowerCase())) {
        issues.push({
          type: 'error',
          path: 'content',
          message: `Banned phrase detected: "${phrase}"`,
          suggestion: 'Remove or replace with industry-specific language'
        });
      }
    }

    // Check for SaaS phrases in non-tech businesses
    const isTech = ['tech', 'saas', 'software', 'startup'].includes(industry?.toLowerCase() || '');
    if (!isTech) {
      for (const phrase of SAAS_ONLY_PHRASES) {
        if (allText.includes(phrase.toLowerCase())) {
          issues.push({
            type: 'error',
            path: 'content',
            message: `SaaS-only phrase in non-tech business: "${phrase}"`,
            suggestion: 'Replace with appropriate service-based language'
          });
        }
      }
    }

    // Check for generic CTAs
    for (const page of siteSpec.pages || []) {
      for (const section of page.sections || []) {
        const content = section.content as any;
        
        // Check hero CTAs
        if (section.type === 'hero') {
          const cta = content?.ctaText?.toLowerCase() || '';
          if (GENERIC_CTAS.some(g => cta.includes(g))) {
            const suggestions = INDUSTRY_CTAS[industry?.toLowerCase()] || ['Call Now', 'Get Quote'];
            issues.push({
              type: 'warning',
              path: `${page.path}/${section.id}`,
              message: `Generic CTA "${content?.ctaText}" - not industry-specific`,
              suggestion: `Try: ${suggestions.slice(0, 2).join(' or ')}`
            });
          }
          
          // Check for missing hero image
          if (!content?.backgroundImage || content.backgroundImage === '') {
            issues.push({
              type: 'error',
              path: `${page.path}/${section.id}`,
              message: 'Hero section missing background image',
              suggestion: 'Add an Unsplash image URL matching the business type'
            });
          }
        }

        // Check for placeholder content
        if (content?.headline) {
          if (content.headline.includes('[') || content.headline.includes('Lorem')) {
            issues.push({
              type: 'error',
              path: `${page.path}/${section.id}`,
              message: 'Placeholder text detected in headline',
              suggestion: 'Replace with actual business content'
            });
          }
        }

        // Check pricing items for SaaS patterns in non-tech
        if (section.type === 'pricing' && !isTech) {
          const items = content?.items || [];
          for (const item of items) {
            const name = item.name?.toLowerCase() || '';
            if (['starter', 'pro', 'enterprise', 'basic plan', 'premium plan'].some(p => name.includes(p))) {
              issues.push({
                type: 'warning',
                path: `${page.path}/${section.id}`,
                message: `SaaS-style pricing tier "${item.name}" for non-tech business`,
                suggestion: 'Use service-based pricing (e.g., "Basic Service", "Full Package")'
              });
            }
          }
        }
      }
    }

    // Check theme colors
    if (siteSpec.theme) {
      const primary = siteSpec.theme.primaryColor?.toLowerCase();
      if (primary === '#3b82f6' || primary === '#8b5cf6') {
        // These are default colors - might indicate no industry matching
        issues.push({
          type: 'suggestion',
          path: 'theme',
          message: 'Default blue/purple theme detected',
          suggestion: 'Consider industry-specific colors (red for food, teal for medical, etc.)'
        });
      }
    }

    // Calculate quality score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const suggestionCount = issues.filter(i => i.type === 'suggestion').length;
    
    const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 5) - (suggestionCount * 2));

    console.log(`[AUDIT:${requestId}] Score: ${score}, Issues: ${issues.length} (${errorCount}E/${warningCount}W/${suggestionCount}S)`);

    return new Response(JSON.stringify({
      score,
      issues,
      summary: {
        errors: errorCount,
        warnings: warningCount,
        suggestions: suggestionCount,
        passed: score >= 70
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[AUDIT:${requestId}] ERROR:`, errorMessage);
    
    return new Response(JSON.stringify({ 
      score: 50,
      issues: [],
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
