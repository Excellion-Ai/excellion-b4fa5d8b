import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting by user ID
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per user
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
      await logApiUsage(user.id, "database-ai", 429, Date.now() - startTime, "Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }

    console.log("Authenticated user:", user.id);

    const { query, schema } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Database AI query:', query);
    console.log('Schema provided:', !!schema);

    const systemPrompt = `You are a database expert assistant. You help users understand their database schema, write queries, and optimize their data structure.

Current database schema:
${schema || 'No schema provided'}

When answering:
- Be concise and practical
- If the user asks about queries, provide SQL examples
- If they ask about optimization, give specific recommendations
- If they ask about relationships, explain the foreign keys and how tables connect
- Format SQL code in code blocks`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: "user", content: query }
        ],
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
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "No response generated";

    console.log('AI response generated successfully');

    // Log successful API usage
    if (userId) {
      await logApiUsage(userId, "database-ai", 200, Date.now() - startTime);
    }

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database AI error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Log error API usage
    if (userId) {
      await logApiUsage(userId, "database-ai", 500, Date.now() - startTime, message);
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
