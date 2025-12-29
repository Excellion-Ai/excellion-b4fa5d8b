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

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREDIT-ROLLOVER] ${step}${detailsStr}`);
};

async function grantMonthlyCredits(userId: string, plan: string) {
  const credits = PLAN_CREDITS[plan];
  if (!credits) {
    logStep("Unknown plan, skipping", { userId, plan });
    return;
  }

  const { data: currentCredits, error: fetchError } = await supabaseAdmin
    .from("user_credits")
    .select("balance, total_earned")
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    logStep("Error fetching credits", { userId, error: fetchError.message });
    return;
  }

  const newBalance = (currentCredits?.balance || 0) + credits;
  const newTotalEarned = (currentCredits?.total_earned || 0) + credits;

  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update({ 
      balance: newBalance, 
      total_earned: newTotalEarned,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  if (updateError) {
    logStep("Error updating credits", { userId, error: updateError.message });
    return;
  }

  const { error: txError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: credits,
      type: "earned",
      action_type: "monthly_rollover",
      description: `Monthly ${plan} plan credit allocation`,
    });

  if (txError) {
    logStep("Error logging transaction", { userId, error: txError.message });
  }

  logStep("Credits granted", { userId, plan, credits, newBalance });
}

async function checkAndExpireSprintPasses() {
  logStep("Checking for expired Sprint Passes");

  const { data: expiredSprints, error } = await supabaseAdmin
    .from("user_credits")
    .select("user_id")
    .eq("current_plan", "pro")
    .eq("sprint_pass_used", true)
    .lt("sprint_expires_at", new Date().toISOString());

  if (error) {
    logStep("Error fetching expired sprints", { error: error.message });
    return;
  }

  for (const record of expiredSprints || []) {
    const { error: updateError } = await supabaseAdmin
      .from("user_credits")
      .update({ 
        current_plan: "free",
        updated_at: new Date().toISOString()
      })
      .eq("user_id", record.user_id);

    if (updateError) {
      logStep("Error expiring sprint", { userId: record.user_id, error: updateError.message });
    } else {
      logStep("Sprint Pass expired", { userId: record.user_id });
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Starting credit rollover job");

  try {
    await checkAndExpireSprintPasses();

    const { data: paidUsers, error: fetchError } = await supabaseAdmin
      .from("user_credits")
      .select("user_id, current_plan")
      .in("current_plan", ["starter", "pro", "agency"]);

    if (fetchError) {
      logStep("Error fetching paid users", { error: fetchError.message });
      return new Response(JSON.stringify({ error: fetchError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Found paid users", { count: paidUsers?.length || 0 });

    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailToId = new Map(allUsers?.users.map(u => [u.email, u.id]) || []);

    let processed = 0;
    let skipped = 0;

    for (const userCredit of paidUsers || []) {
      const user = allUsers?.users.find(u => u.id === userCredit.user_id);
      if (!user?.email) {
        logStep("No email for user", { userId: userCredit.user_id });
        skipped++;
        continue;
      }

      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        logStep("No Stripe customer", { email: user.email });
        skipped++;
        continue;
      }

      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        logStep("No active subscription, downgrading", { email: user.email });
        await supabaseAdmin
          .from("user_credits")
          .update({ current_plan: "free", updated_at: new Date().toISOString() })
          .eq("user_id", userCredit.user_id);
        skipped++;
        continue;
      }

      processed++;
    }

    logStep("Credit rollover complete", { processed, skipped });

    return new Response(JSON.stringify({ 
      success: true, 
      processed, 
      skipped,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    logStep("Error in rollover job", { error: (err as Error).message });
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
