import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= STEP 1: ARCHITECT PROMPT =============
// The Architect creates a UX plan: pages, sections, layout, and content strategy
const ARCHITECT_PROMPT = `You are a Senior UX Architect. Given a business description, create a detailed website plan.

OUTPUT FORMAT (JSON only, no markdown):
{
  "siteName": "Business Name",
  "tagline": "One compelling tagline",
  "pages": [
    {
      "path": "/",
      "title": "Home",
      "sections": [
        {
          "type": "hero",
          "headline": "Compelling headline",
          "subheadline": "Supporting text",
          "cta": { "text": "Call to Action", "href": "#contact" }
        },
        {
          "type": "features",
          "title": "Why Choose Us",
          "items": [
            { "icon": "star", "title": "Feature 1", "description": "Description" }
          ]
        },
        {
          "type": "testimonials",
          "title": "What Clients Say",
          "items": [
            { "quote": "Quote text", "author": "Name", "role": "Title" }
          ]
        },
        {
          "type": "cta",
          "headline": "Ready to Get Started?",
          "cta": { "text": "Contact Us", "href": "#contact" }
        },
        {
          "type": "contact",
          "title": "Get in Touch",
          "fields": ["name", "email", "phone", "message"]
        }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#2563eb",
    "backgroundColor": "#0a0a0a",
    "style": "modern"
  },
  "navigation": [
    { "label": "Home", "href": "/" },
    { "label": "Services", "href": "#services" },
    { "label": "Contact", "href": "#contact" }
  ]
}

RULES:
- Create 3-5 sections per page
- Use benefit-driven, persuasive headlines
- Match the industry tone (professional for law, friendly for restaurants)
- Include clear CTAs that drive conversions
- Output ONLY valid JSON, no explanation`;

// ============= STEP 2: DEVELOPER PROMPT =============
// The Developer converts the UX plan into production-ready Tailwind HTML
const DEVELOPER_PROMPT = `You are a Senior Frontend Developer. Convert the UX plan into a complete, production-ready single-page HTML website.

REQUIREMENTS:
1. Use Tailwind CSS via CDN (include in head)
2. Include Lucide Icons via CDN
3. Mobile-first responsive design
4. Smooth scroll behavior
5. Interactive elements (hover states, transitions)
6. Form with validation attributes
7. Accessibility: proper headings, alt text, aria-labels
8. Dark/light theme based on the plan

OUTPUT: A complete HTML document starting with <!DOCTYPE html>

STRUCTURE:
- <head> with meta tags, Tailwind CDN, fonts
- <nav> sticky navigation
- <main> with all sections from the plan
- <footer> with links and copyright
- Inline <script> for mobile menu toggle

STYLE RULES:
- Use the theme colors from the plan
- Generous spacing (py-16, py-24)
- Glass effects where appropriate (backdrop-blur)
- Subtle shadows and rounded corners
- Gradient accents for visual interest

OUTPUT ONLY THE HTML CODE, no markdown or explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[GENERATE-SITE:${requestId}] Request received`);

  try {
    const { prompt, row_id } = await req.json();

    if (!prompt || !row_id) {
      console.error(`[GENERATE-SITE:${requestId}] Missing required fields`);
      return new Response(
        JSON.stringify({ error: "prompt and row_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[GENERATE-SITE:${requestId}] Processing row_id: ${row_id}`);
    console.log(`[GENERATE-SITE:${requestId}] Prompt: ${prompt.slice(0, 100)}...`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[GENERATE-SITE:${requestId}] Missing environment variables`);
      throw new Error("Server configuration error");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update status to 'processing'
    await supabase
      .from("generated_sites")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", row_id);

    console.log(`[GENERATE-SITE:${requestId}] Status updated to 'processing'`);

    // ============= STEP 1: ARCHITECT PHASE =============
    console.log(`[GENERATE-SITE:${requestId}] STEP 1: Architect creating UX plan...`);
    
    const architectResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: ARCHITECT_PROMPT },
          { role: "user", content: `Create a website plan for: ${prompt}` },
        ],
        max_tokens: 4000,
      }),
    });

    if (!architectResponse.ok) {
      const errorText = await architectResponse.text();
      console.error(`[GENERATE-SITE:${requestId}] Architect API error:`, errorText);
      
      if (architectResponse.status === 429) {
        await supabase.from("generated_sites").update({ status: "failed" }).eq("id", row_id);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Architect API error: ${architectResponse.status}`);
    }

    const architectData = await architectResponse.json();
    const uxPlanRaw = architectData.choices?.[0]?.message?.content || "";
    
    console.log(`[GENERATE-SITE:${requestId}] Architect response length: ${uxPlanRaw.length}`);

    // Parse UX plan (handle markdown code blocks if present)
    let uxPlan: string;
    const jsonMatch = uxPlanRaw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      uxPlan = jsonMatch[1].trim();
    } else {
      uxPlan = uxPlanRaw.trim();
    }

    // Validate JSON
    try {
      JSON.parse(uxPlan);
      console.log(`[GENERATE-SITE:${requestId}] UX plan JSON valid`);
    } catch (parseError) {
      console.warn(`[GENERATE-SITE:${requestId}] UX plan is not valid JSON, proceeding anyway`);
    }

    const architectTime = Date.now() - startTime;
    console.log(`[GENERATE-SITE:${requestId}] STEP 1 complete in ${architectTime}ms`);

    // ============= STEP 2: DEVELOPER PHASE =============
    console.log(`[GENERATE-SITE:${requestId}] STEP 2: Developer generating HTML...`);
    
    const developerResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: DEVELOPER_PROMPT },
          { role: "user", content: `Convert this UX plan into a complete HTML website:\n\n${uxPlan}` },
        ],
        max_tokens: 12000,
      }),
    });

    if (!developerResponse.ok) {
      const errorText = await developerResponse.text();
      console.error(`[GENERATE-SITE:${requestId}] Developer API error:`, errorText);
      
      if (developerResponse.status === 429) {
        await supabase.from("generated_sites").update({ status: "failed" }).eq("id", row_id);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Developer API error: ${developerResponse.status}`);
    }

    const developerData = await developerResponse.json();
    let htmlCode = developerData.choices?.[0]?.message?.content || "";
    
    console.log(`[GENERATE-SITE:${requestId}] Developer response length: ${htmlCode.length}`);

    // Extract HTML from markdown code blocks if present
    const htmlMatch = htmlCode.match(/```(?:html)?\s*([\s\S]*?)```/);
    if (htmlMatch) {
      htmlCode = htmlMatch[1].trim();
    }

    // Ensure it starts with DOCTYPE
    if (!htmlCode.toLowerCase().startsWith("<!doctype")) {
      console.warn(`[GENERATE-SITE:${requestId}] HTML doesn't start with DOCTYPE, attempting fix`);
      const doctypeIndex = htmlCode.toLowerCase().indexOf("<!doctype");
      if (doctypeIndex > 0) {
        htmlCode = htmlCode.slice(doctypeIndex);
      }
    }

    const developerTime = Date.now() - startTime - architectTime;
    console.log(`[GENERATE-SITE:${requestId}] STEP 2 complete in ${developerTime}ms`);

    // ============= UPDATE DATABASE =============
    const { error: updateError } = await supabase
      .from("generated_sites")
      .update({
        status: "completed",
        code: htmlCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row_id);

    if (updateError) {
      console.error(`[GENERATE-SITE:${requestId}] Database update error:`, updateError);
      throw new Error("Failed to save generated code");
    }

    const totalTime = Date.now() - startTime;
    console.log(`[GENERATE-SITE:${requestId}] SUCCESS - Total time: ${totalTime}ms`);
    console.log(`[GENERATE-SITE:${requestId}]   Architect: ${architectTime}ms`);
    console.log(`[GENERATE-SITE:${requestId}]   Developer: ${developerTime}ms`);
    console.log(`[GENERATE-SITE:${requestId}]   HTML size: ${htmlCode.length} chars`);

    return new Response(
      JSON.stringify({
        success: true,
        row_id,
        stats: {
          totalTime,
          architectTime,
          developerTime,
          htmlSize: htmlCode.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[GENERATE-SITE:${requestId}] ERROR:`, errorMessage);

    // Try to update status to failed
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const { row_id } = await req.json().catch(() => ({}));
        if (row_id) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          await supabase.from("generated_sites").update({ status: "failed" }).eq("id", row_id);
        }
      }
    } catch {
      // Ignore cleanup errors
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
