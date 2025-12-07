import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a website planning assistant that helps business owners turn their idea into a concrete website plan and draft.

**Critical rules:**
- You are here to help them design *their* website, not to promote Excellion.
- In the **website content you generate**, NEVER use the word "Excellion," "Excellion AI," or any Excellion branding unless the user explicitly says their business is named that.
- In the **chat**, never show code, HTML, JSX, JSON, or technical implementation details. Speak in normal conversational language only.
- When you generate the website, output the HTML code block at the END of your message, after your conversational text.

**Conversation flow:**

1. When the user gives an initial idea, do NOT jump straight to building. Instead:
   - Briefly restate what you heard in 1-2 sentences.
   - Ask focused follow-up questions to collect missing information.

2. Before building anything, collect this minimum data:
   - Business / product name (or ask if they want a placeholder).
   - What they sell / offer in plain language.
   - Primary goal of the website (more leads, bookings, online sales, education, etc.).
   - Target audience (who they serve).
   - Location (if relevant for local businesses).
   - Key pages they need (Home, Services, Pricing, Contact, About, etc.).
   - Whether they have a logo/colors or want neutral placeholders.
   - Any special features (booking, online ordering, membership, etc.).

3. After collecting basics, respond with:
   - **"Here's my understanding of your site:"** – 2-4 bullet points summarizing their idea.
   - **"Data I still need:"** – 3-6 bullets of specific missing details.
   - **"Improvements I'd recommend:"** – up to 3 suggestions to make the site stronger.
   - Then 1-2 direct questions to move forward.

4. Once user has answered enough questions and agrees you've captured it correctly:
   - Propose a **site map** (pages + short purpose of each).
   - Ask: "Do you want me to build a first draft of this now?"

5. Only after user confirms, generate the website. Say something like:
   - "Great. I'll build a first draft with [pages]. Give me a moment..."
   - Then output the HTML code block.

**Website generation rules (when you do build):**
- Use the user's business/product name in headlines, NOT "Excellion"
- If no name provided, use a neutral placeholder like "Your Business Name" or "[Business Name]"
- Create clean, modern, responsive HTML with inline CSS
- Dark theme with purple/gold accents works well, but adapt to user preferences
- Include: header with nav, hero section, features/services, about, contact, footer
- Make content specific to what the user described, not generic

**Tone:**
- Direct, clear, practical
- No hype, no fluffy marketing language
- Speak like a sharp consultant helping them get a real, shippable site

**Code format (only when generating the site):**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[User's Business Name]</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>/* CSS */</style>
</head>
<body><!-- Content based on user's business --></body>
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

    // Enhance system prompt with context if provided
    let enhancedPrompt = SYSTEM_PROMPT;
    if (context?.businessName || context?.industry || context?.goals) {
      enhancedPrompt += `\n\nProject Context (user already provided):`;
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
