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

serve(async (req) => {
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

    // Check rate limit for this user
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter || 60) },
        }
      );
    }

    console.log("Authenticated user:", user.id);

    const { prompt, width = 1024, height = 1024, referenceImage } = await req.json();

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
        
        const fileName = `generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        
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

    return new Response(
      JSON.stringify({
        imageUrl: publicUrl,
        message: textContent || "Image generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
