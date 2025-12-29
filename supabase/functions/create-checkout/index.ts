import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for subscription plans
const PRICE_IDS = {
  starter: "price_1Sfw4OPCTHzXvqDgdFp9vMUR",  // $15/mo - 50 credits
  pro: "price_1Sfw4iPCTHzXvqDgFQqJmiAW",       // $29/mo - 100 credits
  agency: "price_1Sfw4yPCTHzXvqDgtGCn2iWD",   // $129/mo - 500 credits
  // Annual prices
  starter_annual: "price_1SgKPjPCTHzXvqDgQP63Wygw",  // $156/year
  pro_annual: "price_1SgKQHPCTHzXvqDgNxuBVF8D",       // $288/year
  agency_annual: "price_1SgKQdPCTHzXvqDgCsz1sXw5",   // $1,296/year
  // Sprint Pass - one-time $9 fee
  sprint_fee: "price_1SgsMOPCTHzXvqDg7Q23a28h",      // $9 one-time
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create Supabase client with anon key for auth
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    // Authenticate the user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { priceId, planType } = await req.json();
    logStep("Request body parsed", { priceId, planType });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create during checkout");
    }

    const origin = req.headers.get("origin") || "https://excellionweb.com";

    // Handle Sprint Pass checkout specially
    if (planType === "sprint") {
      logStep("Processing Sprint Pass checkout");

      // Check if user has already used Sprint Pass
      const { data: userCredits, error: creditsError } = await supabaseClient
        .from("user_credits")
        .select("sprint_pass_used")
        .eq("user_id", user.id)
        .single();

      if (creditsError && creditsError.code !== "PGRST116") {
        logStep("Error checking sprint pass status", { error: creditsError.message });
        throw new Error("Failed to check Sprint Pass eligibility");
      }

      if (userCredits?.sprint_pass_used) {
        logStep("User has already used Sprint Pass");
        throw new Error("Sprint Pass can only be used once per account");
      }

      // Create Sprint Pass checkout session
      // Pro subscription with 7-day trial + $9 one-time Sprint fee
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            // Pro subscription with 7-day trial
            price: PRICE_IDS.pro,
            quantity: 1,
          },
          {
            // One-time Sprint Pass fee ($9)
            price: PRICE_IDS.sprint_fee,
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            is_sprint: "true",
            user_id: user.id,
          },
        },
        success_url: `${origin}/pricing?success=true&sprint=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_type: "sprint",
        },
      });
      logStep("Sprint Pass checkout session created", { sessionId: session.id, url: session.url });

      // Mark Sprint Pass as used and grant +50 credits
      const sprintExpiresAt = new Date();
      sprintExpiresAt.setDate(sprintExpiresAt.getDate() + 7);

      // Update user_credits to mark sprint as used and set expiry
      const { error: updateError } = await supabaseClient
        .from("user_credits")
        .update({
          sprint_pass_used: true,
          sprint_expires_at: sprintExpiresAt.toISOString(),
          current_plan: "sprint",
        })
        .eq("user_id", user.id);

      if (updateError) {
        logStep("Warning: Failed to mark sprint as used", { error: updateError.message });
        // Don't throw - let checkout proceed, we'll handle this on webhook/success
      }

      // Grant +50 credits for Sprint Pass
      const { data: currentCredits } = await supabaseClient
        .from("user_credits")
        .select("balance, total_earned")
        .eq("user_id", user.id)
        .single();

      if (currentCredits) {
        await supabaseClient
          .from("user_credits")
          .update({
            balance: currentCredits.balance + 50,
            total_earned: currentCredits.total_earned + 50,
          })
          .eq("user_id", user.id);

        // Log the transaction
        await supabaseClient.from("credit_transactions").insert({
          user_id: user.id,
          amount: 50,
          type: "bonus",
          action_type: "sprint_pass",
          description: "Sprint Pass bonus - 50 credits",
        });

        logStep("Sprint Pass credits granted", { credits: 50 });
      }

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Standard subscription checkout
    let selectedPriceId = priceId;
    if (!selectedPriceId && planType) {
      selectedPriceId = PRICE_IDS[planType as keyof typeof PRICE_IDS];
    }

    if (!selectedPriceId) {
      throw new Error("Invalid plan type or price ID");
    }
    logStep("Price ID selected", { selectedPriceId, planType });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType || "unknown",
      },
    });
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
