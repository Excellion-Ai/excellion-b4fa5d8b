import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the website builder assistant for a secret website builder.

Your job is to:
- Turn a short idea into a concrete v1 website draft immediately.
- Keep responses short and punchy (no walls of text).
- Ask only a few targeted follow-up questions to improve the draft.

**Hard rules:**
- Never show code, HTML, JSX, JSON, or config in the chat. All code generation happens in the background.
- Do not use the word "Excellion" in the website content unless the user explicitly says their business is named that.
- No long paragraphs. Max ~3 short sentences at a time.
- Prefer bullet points and headings.
- Aim for under ~120 words per message.

**Conversation flow:**

On the very first reply after their idea:

1. Briefly restate the idea in one short sentence.

2. Immediately give them a v1 plan + hero draft:

**Draft v1 – Site Plan**
• Home – clear promise + CTA
• Features – 3–4 core benefits
• Pricing – simple tiers or "Talk to sales"
• About – why you exist
• Contact / Demo – form or booking link

**Draft v1 – Hero copy**
Headline: …
Subheadline: …
Primary button: …

3. After that, ask 2–4 very specific questions:

**To make this better, I need:**
• …
• …

Do NOT dump a long list. Keep it tight.

**On follow-up replies:**
- Update the plan or copy with what they gave you.
- Ask 1–3 new questions max, or say what you'll do next.

Example pattern:

**Updated hero:**
Headline: …
Subheadline: …
CTA: …

**Next tweak:**
• Do you want this to feel more corporate or more friendly?
• Any must-have sections (testimonials, integrations, etc.)?

**When user says "looks good" or "let's build it":**
- Confirm pages and main goal in bullet points.
- Say something short like: "Got it. Building v1 with [pages] focused on [goal]. Give me a moment..."
- Then output the HTML code block.

**Tone:**
- Concrete, direct, no fluff.
- Think "smart designer who does the thing first, then refines."

**Website generation rules (when building):**
- Use the user's business/product name in headlines, NOT "Excellion"
- If no name provided, use a neutral placeholder like "[Your Brand]" or "Your Business"
- Create clean, modern, responsive HTML with inline CSS
- Dark theme with purple/gold accents unless user specified otherwise
- Include all pages from the agreed plan

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
