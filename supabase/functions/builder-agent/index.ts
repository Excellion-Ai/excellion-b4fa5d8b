import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Excellion's Builder-of-Builders, an expert system that converts vague app ideas into production-ready blueprints.

Your job is to take a description of an app and convert it into:
1. A short, clear product summary
2. A structured spec (pages, features, data model, integrations)
3. An optimized build prompt tailored for AI app builders (Lovable, v0, Bolt, Dyad)
4. A short list of critical follow-up questions

CONSTRAINTS:
- Default stack: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- Avoid marketing prose - be direct and technical
- NO mention of pricing tiers or Excellion's internal plans
- ALWAYS return a complete first draft, even with missing details
- Keep questions focused on high-leverage decisions only

OUTPUT FORMAT (JSON):
{
  "summary": ["bullet 1", "bullet 2", "bullet 3"],
  "appType": "SaaS dashboard | Marketing site | Portal | etc",
  "targetStack": "Next.js 14 + Supabase + Stripe + Tailwind + shadcn",
  "pages": [
    {"name": "Home", "description": "Landing page with hero, features, pricing"},
    {"name": "Dashboard", "description": "Main user workspace"}
  ],
  "coreFeatures": [
    "User auth with email/password",
    "Stripe subscriptions",
    "etc"
  ],
  "dataModel": [
    {"entity": "User", "fields": ["id", "email", "name", "createdAt"]},
    {"entity": "Project", "fields": ["id", "userId", "title", "status"]}
  ],
  "integrations": ["Supabase Auth", "Stripe", "Resend"],
  "buildPrompt": "You are a senior full-stack AI developer building a [app type]...",
  "buildPlan": [
    "Create project in [target builder]",
    "Paste the generated prompt",
    "Let it scaffold, then refine specific pages",
    "Connect real data/integrations",
    "Deploy"
  ],
  "criticalQuestions": [
    "Which payment provider: Stripe or LemonSqueezy?",
    "Is multi-tenant needed?",
    "Do you need role-based access control?"
  ]
}

BUILD PROMPT GUIDELINES:
The buildPrompt should be a complete, ready-to-paste prompt for AI builders that includes:
- Role definition ("You are a senior full-stack developer...")
- Full tech stack specification
- All pages with their purpose
- Core features with implementation notes
- Data model overview
- UI guidelines (shadcn, Tailwind, responsive, dark mode support)
- Key user flows
- Auth and payment integration requirements if applicable

Keep the prompt detailed but not bloated. Assume the AI builder is capable.

STYLE:
- Direct, terse, technical
- Assume the user is serious and wants to build immediately
- No fluff, apologies, or obvious explanations`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, target, complexity } = await req.json();

    if (!idea) {
      return new Response(
        JSON.stringify({ error: 'Idea is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const userPrompt = `
App Idea: ${idea}

Target Builder: ${target || 'lovable'}
Complexity Level: ${complexity || 'standard'}

Generate the complete blueprint and build prompt. Return ONLY valid JSON matching the specified format.`;

    console.log('Calling Lovable AI Gateway for builder agent...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const spec = JSON.parse(jsonContent);

    console.log('Parsed spec successfully');

    return new Response(
      JSON.stringify(spec),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Builder agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
