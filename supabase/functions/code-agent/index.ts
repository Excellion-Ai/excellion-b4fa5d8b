import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting by user ID
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 code generations per minute per user
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) rateLimitStore.delete(userId);
  }
}, 60000);

// API Usage logging
async function logApiUsage(
  userId: string,
  functionName: string,
  statusCode: number,
  responseTimeMs: number,
  errorMessage?: string
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    
    await supabase.from("api_usage_logs").insert({
      user_id: userId,
      function_name: functionName,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      error_message: errorMessage || null,
    });
  } catch (err) {
    console.error("Failed to log API usage:", err);
  }
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let userId: string | null = null;

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    userId = user.id;

    // Check rate limit for this user
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user: ${user.id}`);
      await logApiUsage(user.id, "code-agent", 429, Date.now() - startTime, "Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }

    console.log("Authenticated user:", user.id);

    const { spec, buildPrompt, previousCode, error: previousError } = await req.json();

    if (!spec && !buildPrompt) {
      return new Response(
        JSON.stringify({ error: 'Spec or buildPrompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    let userPrompt = '';
    
    if (previousError && previousCode) {
      userPrompt = `The previous code generation failed with this error:
${previousError}

Previous code:
${previousCode}

Fix the code to resolve this error. Return the corrected JSON with siteDefinition and reactCode.`;
      console.log('Running in self-healing mode...');
    } else {
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      
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
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

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

    let result;
    try {
      result = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error, attempting to fix:', parseError);
      
      // Try to extract reactCode and siteDefinition separately using regex
      const reactCodeMatch = jsonContent.match(/"reactCode"\s*:\s*"([\s\S]*?)"\s*[,}]/);
      const siteDefMatch = jsonContent.match(/"siteDefinition"\s*:\s*(\{[\s\S]*?\})\s*,\s*"reactCode"/);
      
      if (reactCodeMatch || siteDefMatch) {
        // Build a minimal valid response
        const fallbackCode = `const GeneratedSite = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Your Website</h1>
          <p className="text-xl mb-8 opacity-90">We generated your site but encountered a formatting issue. Click Rebuild to try again.</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">Get Started</button>
        </div>
      </div>
    </div>
  );
};
export default GeneratedSite;`;

        result = {
          siteDefinition: {
            name: "Generated Site",
            description: "Site generated with fallback due to parsing issue",
            sections: [{ id: "hero", type: "hero", label: "Hero", description: "Main hero section" }],
            theme: { primaryColor: "#3b82f6", secondaryColor: "#8b5cf6", accentColor: "#f59e0b", fontHeading: "Inter", fontBody: "Inter", darkMode: false },
            navigation: [{ label: "Home", href: "#" }]
          },
          reactCode: fallbackCode
        };
        console.log('Used fallback response due to parse error');
      } else {
        throw parseError;
      }
    }

    console.log('Code generated successfully');

    // Log successful API usage
    if (userId) {
      await logApiUsage(userId, "code-agent", 200, Date.now() - startTime);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Code agent error:', error);
    // Log error API usage
    if (userId) {
      await logApiUsage(userId, "code-agent", 500, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
