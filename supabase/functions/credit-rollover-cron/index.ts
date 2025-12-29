import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const PLAN_CREDITS: Record<string, number> = {
  starter: 50,
  pro: 100,
  agency: 500,
};

const PRICE_TO_PLAN: Record<string, string> = {
  "price_1RY11AIoRCjttqsGnCkZYtxU": "starter",
  "price_1RY11AIoRCjttqsGjwsmBp1E": "pro",
  "price_1RY11AIoRCjttqsG87OIrPUB": "agency",
  "price_starter_annual": "starter",
  "price_pro_annual": "pro",
  "price_agency_annual": "agency",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREDIT-ROLLOVER] ${step}${detailsStr}`);
};

async function grantMonthlyCredits(userId: string, plan: string, email: string) {
  const credits = PLAN_CREDITS[plan];
  if (!credits) {
    logStep("Unknown plan, skipping", { userId, plan });
    return false;
  }

  const { data: currentCredits, error: fetchError } = await supabaseAdmin
    .from("user_credits")
    .select("balance, total_earned")
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    logStep("Error fetching credits", { userId, error: fetchError.message });
    return false;
  }

  const newBalance = (currentCredits?.balance || 0) + credits;
  const newTotalEarned = (currentCredits?.total_earned || 0) + credits;

  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update({ 
      balance: newBalance, 
      total_earned: newTotalEarned,
      current_plan: plan,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  if (updateError) {
    logStep("Error updating credits", { userId, error: updateError.message });
    return false;
  }

  const { error: txError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: credits,
      type: "earned",
      action_type: "monthly_allocation",
      description: `Monthly ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan credit allocation`,
    });

  if (txError) {
    logStep("Error logging transaction", { userId, error: txError.message });
  }

  logStep("Credits granted", { email, plan, credits, newBalance });
  return true;
}

async function checkAndExpireSprintPasses() {
  logStep("Checking for expired Sprint Passes");

  const now = new Date().toISOString();
  const { data: expiredSprints, error } = await supabaseAdmin
    .from("user_credits")
    .select("user_id")
    .eq("sprint_pass_used", true)
    .not("sprint_expires_at", "is", null)
    .lt("sprint_expires_at", now);

  if (error) {
    logStep("Error fetching expired sprints", { error: error.message });
    return 0;
  }

  let expiredCount = 0;
  for (const record of expiredSprints || []) {
    const { error: updateError } = await supabaseAdmin
      .from("user_credits")
      .update({ 
        current_plan: "free",
        sprint_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", record.user_id);

    if (updateError) {
      logStep("Error expiring sprint", { userId: record.user_id, error: updateError.message });
    } else {
      logStep("Sprint Pass expired, downgraded to free", { userId: record.user_id });
      expiredCount++;
    }
  }

  return expiredCount;
}

async function syncSubscriptionsAndGrantCredits() {
  logStep("Starting subscription sync and credit allocation");

  const { data: allUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    logStep("Error fetching users", { error: usersError.message });
    return { granted: 0, downgraded: 0, errors: 1 };
  }

  let granted = 0;
  let downgraded = 0;
  let errors = 0;

  for (const user of allUsers?.users || []) {
    if (!user.email) continue;

    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        continue;
      }

      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      const { data: userCredits } = await supabaseAdmin
        .from("user_credits")
        .select("current_plan, sprint_pass_used, sprint_expires_at")
        .eq("user_id", user.id)
        .single();

      if (subscriptions.data.length === 0) {
        if (userCredits?.current_plan && userCredits.current_plan !== "free") {
          if (userCredits.sprint_pass_used && userCredits.sprint_expires_at) {
            const sprintExpires = new Date(userCredits.sprint_expires_at);
            if (sprintExpires > new Date()) {
              continue;
            }
          }
          
          await supabaseAdmin
            .from("user_credits")
            .update({ current_plan: "free", updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
          
          logStep("No active subscription, downgraded to free", { email: user.email });
          downgraded++;
        }
        continue;
      }

      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0]?.price?.id;
      const plan = PRICE_TO_PLAN[priceId || ""] || null;

      if (!plan) {
        logStep("Unknown price ID", { email: user.email, priceId });
        continue;
      }

      const success = await grantMonthlyCredits(user.id, plan, user.email);
      if (success) {
        granted++;
      } else {
        errors++;
      }
    } catch (err) {
      logStep("Error processing user", { email: user.email, error: (err as Error).message });
      errors++;
    }
  }

  return { granted, downgraded, errors };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  logStep("Starting monthly credit rollover job");

  try {
    const expiredSprints = await checkAndExpireSprintPasses();
    logStep("Sprint Pass expiration check complete", { expired: expiredSprints });

    const { granted, downgraded, errors } = await syncSubscriptionsAndGrantCredits();

    const duration = Date.now() - startTime;
    logStep("Credit rollover complete", { 
      granted, 
      downgraded, 
      expiredSprints,
      errors,
      durationMs: duration 
    });

    return new Response(JSON.stringify({ 
      success: true,
      summary: {
        creditsGranted: granted,
        usersDowngraded: downgraded,
        sprintPassesExpired: expiredSprints,
        errors,
      },
      durationMs: duration,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    logStep("Fatal error in rollover job", { error: (err as Error).message });
    return new Response(JSON.stringify({ 
      success: false,
      error: (err as Error).message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
