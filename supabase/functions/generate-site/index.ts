import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ============= STEP 1: THE ARCHITECT =============
const ARCHITECT_PROMPT = `You are a Senior UX Architect. Create a detailed website plan as JSON.

OUTPUT (JSON only):
{
  "siteName": "Business Name",
  "tagline": "One compelling tagline",
  "pages": [{
    "path": "/",
    "sections": [
      { "type": "hero", "headline": "...", "subheadline": "...", "cta": "..." },
      { "type": "features", "title": "...", "items": [{"icon": "...", "title": "...", "desc": "..."}] },
      { "type": "testimonials", "items": [{"quote": "...", "author": "...", "role": "..."}] },
      { "type": "cta", "headline": "...", "cta": "..." },
      { "type": "contact", "fields": ["name", "email", "message"] }
    ]
  }],
  "theme": { "primary": "#2563eb", "bg": "#0a0a0a", "style": "modern" },
  "nav": [{ "label": "Home", "href": "/" }, { "label": "Contact", "href": "#contact" }]
}

RULES:
- 3-5 sections per page
- Benefit-driven, persuasive headlines (not generic)
- Match industry tone and terminology
- Headlines answer "What's in it for me?" not "What do we do?"
- CTAs match the business type (e.g., "View Menu" for restaurants, "Get Quote" for services)
- OUTPUT ONLY JSON`

// ============= STEP 2: THE SENIOR DESIGNER =============
const DESIGNER_PROMPT = `You are a Senior Frontend Developer. Convert the UX plan into production-ready Tailwind CSS HTML.

REQUIREMENTS:
1. Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
2. Lucide Icons via CDN: <script src="https://unpkg.com/lucide@latest"></script>
3. Mobile-first responsive (sm:, md:, lg:)
4. Smooth scroll: scroll-behavior: smooth
5. Hover states and transitions
6. Form with validation attributes
7. Accessibility: headings, alt, aria-labels

STRUCTURE:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Site Name]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>html { scroll-behavior: smooth; }</style>
</head>
<body class="bg-gray-950 text-white">
  <nav>...</nav>
  <main>...</main>
  <footer>...</footer>
  <script>lucide.createIcons();</script>
</body>
</html>

STYLE RULES:
- Use theme colors from plan
- Generous spacing (py-16, py-24)
- Glass effects (backdrop-blur-md bg-white/5)
- Subtle shadows (shadow-xl)
- Gradient accents (bg-gradient-to-r)
- Rounded corners (rounded-2xl)

OUTPUT ONLY THE COMPLETE HTML. No markdown, no explanation.`

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  const requestId = crypto.randomUUID().slice(0, 8)

  try {
    const { prompt, row_id } = await req.json()
    
    if (!prompt || !row_id) {
      return new Response(
        JSON.stringify({ error: "prompt and row_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log(`[GENERATE:${requestId}] Starting for row: ${row_id}`)
    console.log(`[GENERATE:${requestId}] Prompt: ${prompt.slice(0, 80)}...`)

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Update status to processing
    await supabase
      .from('generated_sites')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', row_id)

    // ============= STEP 1: THE ARCHITECT =============
    console.log(`[GENERATE:${requestId}] STEP 1: Architect planning...`)
    
    const planResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: ARCHITECT_PROMPT },
            { role: 'user', content: `Create a website plan for: ${prompt}` }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      }
    )

    if (!planResponse.ok) {
      const errorText = await planResponse.text()
      console.error(`[GENERATE:${requestId}] Architect API error:`, errorText)
      throw new Error(`Architect failed: ${planResponse.status}`)
    }

    const planData = await planResponse.json()
    let uxPlan = planData.choices?.[0]?.message?.content || ""
    
    // Extract JSON from markdown if needed
    const jsonMatch = uxPlan.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) uxPlan = jsonMatch[1].trim()
    
    // Also try to extract raw JSON
    if (!uxPlan.startsWith('{')) {
      const firstBrace = uxPlan.indexOf('{')
      const lastBrace = uxPlan.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        uxPlan = uxPlan.substring(firstBrace, lastBrace + 1)
      }
    }

    const architectTime = Date.now() - startTime
    console.log(`[GENERATE:${requestId}] Architect done in ${architectTime}ms (${uxPlan.length} chars)`)

    // ============= STEP 2: THE SENIOR DESIGNER =============
    console.log(`[GENERATE:${requestId}] STEP 2: Designer coding...`)
    
    const designResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: DESIGNER_PROMPT },
            { role: 'user', content: `Convert this UX plan into HTML:\n\n${uxPlan}` }
          ],
          max_tokens: 16000,
          temperature: 0.3
        })
      }
    )

    if (!designResponse.ok) {
      const errorText = await designResponse.text()
      console.error(`[GENERATE:${requestId}] Designer API error:`, errorText)
      throw new Error(`Designer failed: ${designResponse.status}`)
    }

    const designData = await designResponse.json()
    let finalCode = designData.choices?.[0]?.message?.content || ""
    
    // Extract HTML from markdown if needed
    const htmlMatch = finalCode.match(/```(?:html)?\s*([\s\S]*?)```/)
    if (htmlMatch) finalCode = htmlMatch[1].trim()

    // Ensure DOCTYPE
    if (!finalCode.toLowerCase().startsWith("<!doctype")) {
      const doctypeIndex = finalCode.toLowerCase().indexOf("<!doctype")
      if (doctypeIndex > 0) finalCode = finalCode.slice(doctypeIndex)
    }

    const designerTime = Date.now() - startTime - architectTime
    console.log(`[GENERATE:${requestId}] Designer done in ${designerTime}ms (${finalCode.length} chars)`)

    // ============= STEP 3: UPDATE SUPABASE =============
    const { error: updateError } = await supabase
      .from('generated_sites')
      .update({
        code: finalCode,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', row_id)

    if (updateError) {
      console.error(`[GENERATE:${requestId}] DB update error:`, updateError)
      throw new Error('Failed to save code')
    }

    const totalTime = Date.now() - startTime
    console.log(`[GENERATE:${requestId}] SUCCESS - Total: ${totalTime}ms`)

    return new Response(
      JSON.stringify({ 
        success: true,
        row_id,
        stats: { totalTime, architectTime, designerTime, htmlSize: finalCode.length }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`[GENERATE:${requestId}] ERROR:`, errorMessage)

    // Try to mark as failed
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      const body = await req.clone().json().catch(() => ({}))
      if (body.row_id) {
        await supabase.from('generated_sites').update({ status: 'failed' }).eq('id', body.row_id)
      }
    } catch { /* ignore */ }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
