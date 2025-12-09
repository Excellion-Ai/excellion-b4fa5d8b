import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert React/Tailwind code generator. You convert app specifications into clean, production-ready React components.

OUTPUT REQUIREMENTS:
1. Generate a SINGLE self-contained React component that renders the entire site
2. Use Tailwind CSS for all styling (no external CSS required)
3. The component must be named "GeneratedSite" and be the default export
4. Include ALL sections inline - no imports from other files
5. Use modern React patterns (hooks, functional components)
6. Make it responsive (mobile-first)
7. Use semantic HTML

STYLING RULES:
- Use Tailwind utility classes only
- Color palette should match the site's brand/purpose
- Include hover/focus states for interactive elements
- Add subtle animations with Tailwind (hover:scale, transition, etc.)
- Ensure good contrast and readability

STRUCTURE:
Return ONLY a JSON object with this exact format:
{
  "siteDefinition": {
    "name": "Site Name",
    "description": "Brief description",
    "sections": [
      {"id": "hero", "type": "hero", "label": "Hero", "description": "Main hero section"}
    ],
    "theme": {
      "primaryColor": "#hex",
      "secondaryColor": "#hex", 
      "accentColor": "#hex",
      "fontHeading": "font-family",
      "fontBody": "font-family",
      "darkMode": false
    },
    "navigation": [
      {"label": "Home", "href": "#hero"}
    ]
  },
  "reactCode": "const GeneratedSite = () => { ... }; export default GeneratedSite;"
}

IMPORTANT:
- The reactCode must be a complete, valid JavaScript string
- Escape all quotes and special characters properly
- The component should render without any external dependencies
- Include placeholder content that matches the site's purpose
- Do NOT use any import statements in reactCode - the component must be self-contained`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { spec, buildPrompt, previousCode, error: previousError } = await req.json();

    if (!spec && !buildPrompt) {
      return new Response(
        JSON.stringify({ error: 'Spec or buildPrompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let userPrompt = '';
    
    if (previousError && previousCode) {
      // Self-healing mode
      userPrompt = `The previous code generation failed with this error:
${previousError}

Previous code:
${previousCode}

Fix the code to resolve this error. Return the corrected JSON with siteDefinition and reactCode.`;
      console.log('Running in self-healing mode...');
    } else {
      // Normal generation mode
      userPrompt = `Generate a React component for this site:

Build Prompt:
${buildPrompt}

App Specification:
- Type: ${spec?.appType || 'Marketing site'}
- Pages: ${spec?.pages?.map((p: { name: string }) => p.name).join(', ') || 'Home'}
- Features: ${spec?.coreFeatures?.join(', ') || 'Basic landing page'}
- Summary: ${spec?.summary?.join('. ') || 'A professional website'}

Generate a complete, self-contained React component. Return ONLY valid JSON.`;
      console.log('Generating code for:', spec?.appType || 'site');
    }

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
          JSON.stringify({ error: 'Payment required. Please add credits.' }),
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

    console.log('Raw code-agent response length:', content.length);

    // Parse JSON from response
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const result = JSON.parse(jsonContent);

    console.log('Code generated successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Code agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
