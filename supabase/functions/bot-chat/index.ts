import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  URL_REGEX,
  extractFromUrl,
  formatExtractionForPrompt,
  checkRateLimit,
  SYSTEM_PROMPT,
} from "./system-prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();
  
  console.log(`[BOT-CHAT:${requestId}] ========== REQUEST START ==========`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    
    const authClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BOT-CHAT:${requestId}] User authenticated: ${user.id}`);

    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || "unknown";
    
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }

    const body = await req.json();
    const { messages, context, modelMode, projectId, scaffold } = body;
    
    console.log(`[BOT-CHAT:${requestId}] Messages: ${messages?.length || 0}, Project: ${projectId || 'none'}`);

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Fetch knowledge base entries
    let knowledgeContext = "";
    let globalInstructions = "";
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      // Fetch global instructions
      try {
        const globalResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/user_knowledge?name=eq.__global_instructions__&select=content`,
          {
            headers: {
              "apikey": SUPABASE_SERVICE_ROLE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }
        );
        
        if (globalResponse.ok) {
          const globalEntries = await globalResponse.json();
          if (globalEntries?.[0]?.content) {
            globalInstructions = `\n## GLOBAL USER INSTRUCTIONS\n${globalEntries[0].content}\n`;
          }
        }
      } catch (e) {
        console.error(`[BOT-CHAT:${requestId}] Error fetching global instructions:`, e);
      }

      // Fetch project-specific knowledge
      if (projectId) {
        try {
          const kbResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/knowledge_base?project_id=eq.${projectId}&select=name,content`,
            {
              headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
            }
          );
          
          if (kbResponse.ok) {
            const kbEntries = await kbResponse.json();
            if (kbEntries?.length > 0) {
              knowledgeContext = `\n## PROJECT KNOWLEDGE BASE\n${kbEntries.map((e: { name: string; content: string }) => `### ${e.name}\n${e.content}`).join('\n---\n')}\n`;
            }
          }
        } catch (e) {
          console.error(`[BOT-CHAT:${requestId}] Error fetching knowledge:`, e);
        }
      }
    }

    // Check for URLs in the most recent user message
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    let urlContext = "";
    
    if (lastUserMessage?.content) {
      let textContent = typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : Array.isArray(lastUserMessage.content)
          ? (lastUserMessage.content.find((p: any) => p.type === "text")?.text || "")
          : "";
      
      const urls = textContent.match(URL_REGEX);
      if (urls?.length) {
        const extraction = await extractFromUrl(urls[0]);
        if (extraction.success && extraction.data) {
          urlContext = formatExtractionForPrompt(extraction.data);
        }
      }
    }

    let enhancedPrompt = SYSTEM_PROMPT;
    if (globalInstructions) enhancedPrompt += globalInstructions;
    if (knowledgeContext) enhancedPrompt += knowledgeContext;
    if (urlContext) enhancedPrompt += `\n${urlContext}`;
    
    if (context?.businessName || context?.industry) {
      enhancedPrompt += `\n\nProject Context:`;
      if (context.businessName) enhancedPrompt += `\n- Business Name: ${context.businessName}`;
      if (context.industry) enhancedPrompt += `\n- Industry: ${context.industry}`;
    }

    // Scaffold enforcement
    if (scaffold) {
      let scaffoldPrompt = `\n\n## GENERATION SCAFFOLD - MANDATORY\n**CATEGORY:** ${scaffold.category}\n**GOAL:** ${scaffold.goal}\n**ARCHETYPE:** ${scaffold.archetypeId}\n`;
      
      if (scaffold.requiredPages?.length) {
        scaffoldPrompt += `\n### REQUIRED PAGES:\n`;
        scaffold.requiredPages.forEach((page: { path: string; title: string; requiredSections?: string[] }) => {
          scaffoldPrompt += `- "${page.path}" (${page.title})${page.requiredSections?.length ? ` [Sections: ${page.requiredSections.join(', ')}]` : ''}\n`;
        });
      }

      if (scaffold.ctaRules) {
        scaffoldPrompt += `\n### CTA RULES:\n- Primary: "${scaffold.ctaRules.primaryLabel || 'Get Started'}" → ${scaffold.ctaRules.primaryAction || 'contact'}\n`;
      }

      if (scaffold.forbiddenPhrases?.length) {
        scaffoldPrompt += `\n### FORBIDDEN PHRASES:\n${scaffold.forbiddenPhrases.map((p: string) => `- "${p}"`).join('\n')}\n`;
      }

      if (scaffold.integrations?.length) {
        scaffoldPrompt += `\n### REQUIRED INTEGRATIONS:\n${scaffold.integrations.map((i: string) => `- ${i}`).join('\n')}\n`;
      }
      
      enhancedPrompt += scaffoldPrompt;
    }

    console.log(`[BOT-CHAT:${requestId}] Calling Anthropic API (claude-haiku-4-5-20251001)...`);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: enhancedPrompt,
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error(`[BOT-CHAT:${requestId}] Anthropic error ${response.status}:`, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[BOT-CHAT:${requestId}] Streaming response started (${Date.now() - startTime}ms)`);

    // Transform Anthropic SSE stream to OpenAI-compatible format
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;
                try {
                  const event = JSON.parse(jsonStr);
                  if (event.type === "content_block_delta" && event.delta?.text) {
                    const openAIEvent = {
                      choices: [{ delta: { content: event.delta.text } }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIEvent)}\n\n`));
                  } else if (event.type === "message_stop") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                    return;
                  }
                } catch {
                  // skip unparseable lines
                }
              }
            }
          }
        } catch (err) {
          console.error(`[BOT-CHAT:${requestId}] Stream error:`, err);
          controller.error(err);
        }
      },
    });

    return new Response(transformedStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[BOT-CHAT] ERROR:`, errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
