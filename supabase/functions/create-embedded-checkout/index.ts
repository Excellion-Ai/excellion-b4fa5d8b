import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Excellion Coach Plan — the only plan
const PRICE_IDS: Record<string, string> = {
  coach: "price_1T1YnuPCTHzXvqDgZwElpsRS",  // $79/mo (coupon makes first month $19)
};

const ANNUAL_PRICE_IDS: Record<string, string> = {
  coach: "price_1T1YjxPCTHzXvqDg3Plq3gtT",  // $790/year
};

// Coupon ID for $60 off first month (makes $79 → $19)
const FIRST_MONTH_COUPON = "bIX05TiJ";
const COUPON_ELIGIBLE_PRICES = new Set([PRICE_IDS.coach]);

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMBEDDED-CHECKOUT] ${step}${detailsStr}`);
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
    const { planType, isAnnual } = await req.json();
    
    // Validate the plan type and select correct price ID
    const priceMap = isAnnual ? ANNUAL_PRICE_IDS : PRICE_IDS;
    const selectedPriceId = priceMap[planType];
    if (!selectedPriceId) {
      throw new Error(`Invalid plan type: ${planType}`);
    }
    logStep("Price ID selected", { selectedPriceId, planType, isAnnual });

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

    // Create embedded checkout session
    const origin = req.headers.get("origin") || "https://excellionweb.com";
    const sessionOptions: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      ui_mode: "embedded",
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    };

    // Auto-apply first-month coupon for eligible prices
    if (COUPON_ELIGIBLE_PRICES.has(selectedPriceId)) {
      sessionOptions.discounts = [{ coupon: FIRST_MONTH_COUPON }];
      logStep("Applied first-month coupon", { coupon: FIRST_MONTH_COUPON });
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);
    logStep("Embedded checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ 
      clientSecret: session.client_secret,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-embedded-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
