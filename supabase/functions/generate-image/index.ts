import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting by user ID
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 image generations per minute per user
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let userId: string | null = null;

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace("Bearer ", "");
    console.log("Auth token received, length:", token.length);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role key to verify user token
    const authClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError) {
      console.error("Auth error:", authError.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication", details: authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      console.error("No user found for token");
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    userId = user.id;
    console.log("User authenticated:", userId);

    // Check rate limit for this user
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user: ${user.id}`);
      await logApiUsage(user.id, "generate-image", 429, Date.now() - startTime, "Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }

    console.log("Authenticated user:", user.id);

    const { prompt, width = 1024, height = 1024, referenceImage, type = 'image' } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating image with prompt:", prompt, "Has reference:", !!referenceImage);

    // Enhance prompt for website-appropriate images
    const enhancedPrompt = referenceImage 
      ? `Edit this image: ${prompt}. Maintain professional quality suitable for web use.`
      : `Professional website image: ${prompt}. High quality, modern design, suitable for web use. Clean composition, vibrant colors, professional photography style. ${width}x${height} resolution.`;

    // Build message content - text only or text + image for editing
    const messageContent = referenceImage
      ? [
          { type: "text", text: enhancedPrompt },
          { type: "image_url", image_url: { url: referenceImage } }
        ]
      : enhancedPrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract image from response
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data, null, 2));
      throw new Error("No image generated");
    }

    // Optionally upload to Supabase Storage for persistence
    let publicUrl = imageData;
    
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey && imageData.startsWith("data:image")) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Convert base64 to blob
        const base64Data = imageData.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Determine folder based on type parameter (logo vs image)
        const assetType = type === 'logo' ? 'logos' : 'images';
        const fileName = `${assetType}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("builder-images")
          .upload(fileName, byteArray, {
            contentType: "image/png",
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("builder-images")
            .getPublicUrl(fileName);
          
          if (urlData?.publicUrl) {
            publicUrl = urlData.publicUrl;
            console.log("Image uploaded to storage:", publicUrl);
          }
        } else {
          console.log("Storage upload failed, using base64:", uploadError);
        }
      }
    } catch (storageError) {
      console.error("Storage upload error:", storageError);
      // Continue with base64 image
    }

    // Log successful API usage
    if (userId) {
      await logApiUsage(userId, "generate-image", 200, Date.now() - startTime);
    }

    return new Response(
      JSON.stringify({
        imageUrl: publicUrl,
        message: textContent || "Image generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate image error:", error);
    // Log error API usage
    if (userId) {
      await logApiUsage(userId, "generate-image", 500, Date.now() - startTime, error instanceof Error ? error.message : "Unknown error");
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
