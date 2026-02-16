import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for subscription plans
const PRICE_IDS = {
  starter: "price_1SmmvRPCTHzXvqDgcuiCxcqD",        // $19/mo
  pro: "price_1SmmvnPCTHzXvqDgbSE6wxMV",            // $39/mo
  agency: "price_1Smmy1PCTHzXvqDg1t7EjziF",         // $99/mo
  // Annual prices
  starter_annual: "price_1SmmyuPCTHzXvqDgr8k0y8s6", // $192/year ($16/mo)
  pro_annual: "price_1Smn0VPCTHzXvqDgXLwyNKJ3",     // $396/year ($33/mo)
  agency_annual: "price_1Smn33PCTHzXvqDgxuGNuQkT",  // $996/year ($83/mo)
  // Coach plan
  coach_monthly: "price_1T1YjKPCTHzXvqDggzAat1Q0",  // $19 first month, then $79/mo
  coach_annual: "price_1T1YjxPCTHzXvqDg3Plq3gtT",   // $790/year
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    // Authenticate the user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { priceId, planType } = await req.json();
    
    // Validate the price ID
    let selectedPriceId = priceId;
    if (!selectedPriceId && planType) {
      selectedPriceId = PRICE_IDS[planType as keyof typeof PRICE_IDS];
    }
    
    if (!selectedPriceId) {
      throw new Error("Invalid plan type or price ID");
    }
    logStep("Price ID selected", { selectedPriceId, planType });

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

    // Create checkout session
    const origin = req.headers.get("origin") || "https://excellionweb.com";
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
