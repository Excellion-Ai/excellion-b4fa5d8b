const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, current_course, current_design } = await req.json();

    if (!command) {
      return new Response(
        JSON.stringify({ success: false, result: { understood: false, error_message: 'No command provided' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, result: { understood: false, error_message: 'AI service not configured' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const systemPrompt = `You are a course design assistant. You interpret natural language editing commands for an online course builder and return structured JSON changes.

The course has these editable properties:
- design_config: { colors: { primary, secondary, accent, background, text, textMuted, cardBackground }, fonts: { heading, body }, spacing: "compact"|"normal"|"spacious", borderRadius: "none"|"small"|"medium"|"large" }
- layout_template: "suspended"|"timeline"|"grid"
- section_order: array of section IDs like ["hero","outcomes","curriculum","faq","cta"]
- curriculum: { landing_page: { hero_headline, hero_subheadline, faqs }, learning_outcomes: [], modules: [], pages: { landing: { cta_text } }, tagline }

Given the user's command, return a JSON object with:
{
  "understood": true,
  "preview_message": "Brief description of what was changed",
  "changes": {
    // Only include properties that need changing
    "design_config": { ... },  // partial design updates
    "layout_template": "...",  // if layout change requested
    "section_order": [...],    // if section reorder requested
    "curriculum": { ... }      // if content change requested
  }
}

If you don't understand the command, return:
{ "understood": false, "error_message": "Helpful suggestion of what to try instead" }

IMPORTANT: Only return the JSON object, no markdown or explanation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Current course data:\n${JSON.stringify(current_course || {}, null, 2)}\n\nCurrent design:\n${JSON.stringify(current_design || {}, null, 2)}\n\nCommand: "${command}"`,
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, result: { understood: false, error_message: 'AI processing failed' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text || '';

    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { understood: false, error_message: 'Could not parse AI response' };
    } catch {
      result = { understood: false, error_message: 'Could not parse AI response' };
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, result: { understood: false, error_message: 'Internal error' } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
