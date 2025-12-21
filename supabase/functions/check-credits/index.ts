import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-CREDITS] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No auth header - returning unauthenticated state");
      return new Response(JSON.stringify({ 
        authenticated: false,
        balance: 0,
        plan: 'free',
        canUseAI: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Auth error or no user", { error: userError?.message });
      return new Response(JSON.stringify({ 
        authenticated: false,
        balance: 0,
        plan: 'free',
        canUseAI: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Fetch user credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (creditsError) {
      logStep("Error fetching credits", { error: creditsError.message });
      throw new Error(`Failed to fetch credits: ${creditsError.message}`);
    }

    // If no credits record exists, the user might have signed up before we added the trigger
    // Create one for them with free credits
    if (!credits) {
      logStep("No credits found, creating initial credits");
      
      const { data: newCredits, error: insertError } = await supabaseClient
        .from('user_credits')
        .insert({
          user_id: userId,
          balance: 20,
          total_earned: 20,
          current_plan: 'free'
        })
        .select()
        .single();

      if (insertError) {
        logStep("Error creating credits", { error: insertError.message });
        // Return defaults if we can't create
        return new Response(JSON.stringify({ 
          authenticated: true,
          balance: 0,
          plan: 'free',
          canUseAI: false,
          total_earned: 0,
          total_spent: 0
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Log the bonus transaction
      await supabaseClient
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: 20,
          type: 'bonus',
          description: 'Welcome bonus - 20 free credits'
        });

      logStep("Created initial credits", { balance: 20 });
      
      return new Response(JSON.stringify({ 
        authenticated: true,
        balance: 20,
        plan: 'free',
        canUseAI: true,
        total_earned: 20,
        total_spent: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Credits found", { 
      balance: credits.balance, 
      plan: credits.current_plan 
    });

    return new Response(JSON.stringify({ 
      authenticated: true,
      balance: credits.balance,
      plan: credits.current_plan,
      canUseAI: credits.balance > 0,
      total_earned: credits.total_earned,
      total_spent: credits.total_spent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
