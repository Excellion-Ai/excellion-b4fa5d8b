import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Claude-powered business classification
// Runs BEFORE generation to provide accurate context
serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[CLASSIFY:${requestId}] Started`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a business classifier. Analyze the user's prompt and extract:
1. industry: The specific business type (restaurant, gym, salon, plumber, lawyer, dentist, contractor, landscaping, auto, real_estate, tech, ecommerce, photography, pet, medical, accounting, etc.)
2. businessModel: SERVICE_BASED, RETAIL_COMMERCE, HOSPITALITY, or PORTFOLIO_IDENTITY
3. businessIntent: The specific intent (service_business, product_store, booking_business, saas, portfolio, nonprofit, restaurant, gym, salon, lawyer, contractor, landscaping, dental, medical, real_estate)
4. primaryColor: Hex color that matches this industry (e.g. #dc2626 for restaurants, #0891b2 for medical, #be185d for salons)
5. secondaryColor: Complementary accent color
6. layoutHint: "split" for visual businesses (restaurants, salons, real estate), "bento" for tech/saas, "standard" for service businesses
7. heroVariant: "split" for image-heavy, "centered" for text-focused, "glassmorphism" for modern tech
8. confidenceScore: 0-100 how confident you are in the classification

IMPORTANT: Be specific! Don't classify a "Miami fitness gym" as generic "service" - classify it as "gym" with fitness-appropriate colors.

Respond with ONLY valid JSON, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Use Gemini (Claude not available via gateway)
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Classify this business prompt:\n\n"${prompt}"` }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CLASSIFY:${requestId}] AI error:`, response.status, errorText);
      
      // Return fallback classification
      return new Response(JSON.stringify({
        industry: "service",
        businessModel: "SERVICE_BASED",
        businessIntent: "service_business",
        primaryColor: "#3b82f6",
        secondaryColor: "#8b5cf6",
        layoutHint: "standard",
        heroVariant: "centered",
        confidenceScore: 30,
        fallback: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    let classification;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classification = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error(`[CLASSIFY:${requestId}] Parse error:`, e);
      // Fallback
      classification = {
        industry: "service",
        businessModel: "SERVICE_BASED", 
        businessIntent: "service_business",
        primaryColor: "#3b82f6",
        secondaryColor: "#8b5cf6",
        layoutHint: "standard",
        heroVariant: "centered",
        confidenceScore: 30,
        fallback: true
      };
    }

    console.log(`[CLASSIFY:${requestId}] Result:`, JSON.stringify(classification));

    return new Response(JSON.stringify(classification), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[CLASSIFY:${requestId}] ERROR:`, errorMessage);
    
    // Return fallback on error
    return new Response(JSON.stringify({
      industry: "service",
      businessModel: "SERVICE_BASED",
      businessIntent: "service_business", 
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      layoutHint: "standard",
      heroVariant: "centered",
      confidenceScore: 0,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
