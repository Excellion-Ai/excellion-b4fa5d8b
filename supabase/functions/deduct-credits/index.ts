import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit costs for different actions
export const CREDIT_COSTS = {
  chat: 1,           // AI chat message
  generation: 5,     // Initial site generation
  edit: 3,           // Major site edit/regeneration
  image: 2,          // AI image generation
  export: 2,         // Code export
  publish: 0,        // Publishing (free)
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEDUCT-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const { 
      userId, 
      action, 
      amount: customAmount, 
      description, 
      projectId 
    } = await req.json();

    if (!userId || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "userId and action are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get cost for action (use custom amount if provided)
    const cost = customAmount ?? CREDIT_COSTS[action as keyof typeof CREDIT_COSTS] ?? 1;
    logStep("Deducting credits", { userId, action, cost });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Fetch current credits
    const { data: credits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      logStep("Error fetching credits", { error: fetchError.message });
      throw new Error(`Failed to fetch credits: ${fetchError.message}`);
    }

    if (!credits) {
      logStep("No credits record found");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No credits found for user",
        insufficient: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402,
      });
    }

    // Check if user has enough credits
    if (credits.balance < cost) {
      logStep("Insufficient credits", { balance: credits.balance, cost });
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Insufficient credits. Need ${cost}, have ${credits.balance}`,
        insufficient: true,
        balance: credits.balance,
        required: cost
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402,
      });
    }

    // Deduct credits atomically
    const newBalance = credits.balance - cost;
    
    // First get current total_spent to increment it
    const { data: currentData } = await supabase
      .from('user_credits')
      .select('total_spent')
      .eq('user_id', userId)
      .single();
    
    const currentTotalSpent = currentData?.total_spent ?? 0;
    
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance,
        total_spent: currentTotalSpent + cost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      logStep("Error updating credits", { error: updateError.message });
      throw new Error(`Failed to update credits: ${updateError.message}`);
    }

    // Log the transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -cost,
        type: 'usage',
        action_type: action,
        description: description || `Used ${cost} credits for ${action}`,
        project_id: projectId || null
      });

    if (txError) {
      logStep("Warning: Failed to log transaction", { error: txError.message });
      // Don't fail the whole operation, just log
    }

    logStep("Credits deducted successfully", { 
      previousBalance: credits.balance, 
      newBalance, 
      cost 
    });

    return new Response(JSON.stringify({ 
      success: true,
      previousBalance: credits.balance,
      newBalance,
      cost
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
