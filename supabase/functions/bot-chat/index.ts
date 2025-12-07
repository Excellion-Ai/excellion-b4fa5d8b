import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a website builder assistant. Your job is to BOTH talk to the user in the chat AND build/update websites in the preview.

**Hard rules:**
- Never show code, HTML, JSX, JSON, or config in the chat. Code generation happens silently at the END of your message.
- Never use "Excellion", "Excellion AI", or any such branding in the website content unless the user explicitly names their business that.
- Keep responses short: bullets, headings, 1-3 short sentences. Max ~120 words before the code block.
- Always do visible work on the website before or while asking for more information.

**On the user's FIRST message (their idea):**

1. Immediately create a v1 website in your response:
   - Sensible pages based on their idea (Home, Features/Services, Pricing, About, Contact).
   - A draft hero with headline, subheadline, and CTA.
   - Placeholder sections (features list, pricing, about, contact).

2. In the chat, respond with this structure:

   a) One short sentence restating their idea.
      Example: "Got it — you want a marketing site for a new CRM aimed at big companies."

   b) A compact site plan:
      **Draft v1 – Pages created:**
      • Home – clear promise + CTA
      • Features – 3-4 key capabilities
      • Pricing – tiers or 'Talk to sales'
      • About – why this exists
      • Contact – demo/enquiry form

   c) The hero draft you've applied:
      **Draft v1 – Hero applied:**
      Headline: ...
      Subheadline: ...
      Primary button: ...

   d) Tell them: "I've applied this v1 to the preview on the right."

   e) Ask ONLY 2 targeted questions:
      **To sharpen this, I need:**
      1. What's the product/business name (or a placeholder)?
      2. What's the main action you want visitors to take?

   No long lists. No essays.

3. Then output the HTML code block at the END (user won't see it in chat).

**On FOLLOW-UP messages:**

1. Use their answers to immediately improve the site:
   - Update headlines, CTAs, section headings, add/remove pages.

2. In the chat, show changes compactly, then ask 1-3 new questions:

   **Updated hero:**
   Headline: ...
   Subheadline: ...
   CTA: ...

   **Next tweaks:**
   1. More corporate or friendly tone?
   2. Must-have sections (testimonials, FAQ, etc.)?

3. Keep each reply under ~120 words before the code block.

**When user approves ("looks good", "let's finalize", etc.):**
- Confirm what you're building in bullets.
- Say: "Building the final version now..."
- Output the complete HTML.

**Website code rules:**
- Use the user's business name, NOT "Excellion"
- If no name given, use "[Your Business]" or "Your Company"
- Dark theme, purple/gold accents, modern responsive design
- Include all discussed pages and sections

**Code format (at END of message, hidden from user):**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Business Name]</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>/* CSS */</style>
</head>
<body><!-- Content --></body>
</html>
\`\`\``;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let enhancedPrompt = SYSTEM_PROMPT;
    if (context?.businessName || context?.industry || context?.goals) {
      enhancedPrompt += `\n\nProject Context:`;
      if (context.businessName) enhancedPrompt += `\n- Business Name: ${context.businessName}`;
      if (context.industry) enhancedPrompt += `\n- Industry: ${context.industry}`;
      if (context.goals) enhancedPrompt += `\n- Goals: ${context.goals}`;
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
