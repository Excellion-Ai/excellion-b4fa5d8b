import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

// Correct Price IDs from Stripe
const PRICE_IDS = {
  // Monthly
  starter_monthly: "price_1Sfw4OPCTHzXvqDgdFp9vMUR",
  pro_monthly: "price_1Sfw4iPCTHzXvqDgFQqJmiAW",
  agency_monthly: "price_1Sfw4yPCTHzXvqDgtGCn2iWD",
  // Annual
  starter_annual: "price_1SgKPjPCTHzXvqDgQP63Wygw",
  pro_annual: "price_1SgKQHPCTHzXvqDgNxuBVF8D",
  agency_annual: "price_1SgKQdPCTHzXvqDgCsz1sXw5",
  // Sprint Pass (one-time fee)
  sprint_fee: "price_1SgsMOPCTHzXvqDg7Q23a28h",
};

const PLAN_CREDITS: Record<string, number> = {
  starter: 200,
  pro: 500,
  agency: 3000,
};

const SPRINT_PASS_CREDITS = 150;

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    logStep("Error listing users", { error: error.message });
    return null;
  }
  const user = data.users.find(u => u.email === email);
  return user?.id || null;
}

async function grantCredits(userId: string, amount: number, description: string, actionType: string) {
  logStep("Granting credits", { userId, amount, description });
  
  const { data: currentCredits, error: fetchError } = await supabaseAdmin
    .from("user_credits")
    .select("balance, total_earned")
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    logStep("Error fetching current credits", { error: fetchError.message });
    return;
  }

  const newBalance = (currentCredits?.balance || 0) + amount;
  const newTotalEarned = (currentCredits?.total_earned || 0) + amount;

  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update({ 
      balance: newBalance, 
      total_earned: newTotalEarned,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  if (updateError) {
    logStep("Error updating credits", { error: updateError.message });
    return;
  }

  const { error: txError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount,
      type: "earned",
      action_type: actionType,
      description,
    });

  if (txError) {
    logStep("Error logging transaction", { error: txError.message });
  }

  logStep("Credits granted successfully", { newBalance });
}

async function updateUserPlan(userId: string, plan: string, sprintExpiresAt?: string) {
  logStep("Updating user plan", { userId, plan, sprintExpiresAt });
  
  const updateData: Record<string, unknown> = {
    current_plan: plan,
    updated_at: new Date().toISOString(),
  };

  if (sprintExpiresAt) {
    updateData.sprint_expires_at = sprintExpiresAt;
    updateData.sprint_pass_used = true;
  }

  const { error } = await supabaseAdmin
    .from("user_credits")
    .update(updateData)
    .eq("user_id", userId);

  if (error) {
    logStep("Error updating plan", { error: error.message });
  }
}

function getPlanFromPriceId(priceId: string): string {
  switch (priceId) {
    case PRICE_IDS.starter_monthly:
    case PRICE_IDS.starter_annual:
      return "starter";
    case PRICE_IDS.pro_monthly:
    case PRICE_IDS.pro_annual:
      return "pro";
    case PRICE_IDS.agency_monthly:
    case PRICE_IDS.agency_annual:
      return "agency";
    default:
      return "free";
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logStep("Handling checkout.session.completed", { sessionId: session.id });

  const customerEmail = session.customer_email || 
    (session.customer_details?.email);
  
  if (!customerEmail) {
    logStep("No customer email found");
    return;
  }

  const userId = await getUserIdByEmail(customerEmail);
  if (!userId) {
    logStep("No user found for email", { email: customerEmail });
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  logStep("Line items", { items: lineItems.data.map((i: Stripe.LineItem) => i.price?.id) });

  for (const item of lineItems.data) {
    const priceId = item.price?.id;
    
    // Check for Sprint Pass one-time fee
    if (priceId === PRICE_IDS.sprint_fee) {
      await grantCredits(userId, SPRINT_PASS_CREDITS, "Sprint Pass bonus credits", "sprint_pass");
      const sprintExpires = new Date();
      sprintExpires.setDate(sprintExpires.getDate() + 30);
      await updateUserPlan(userId, "pro", sprintExpires.toISOString());
      logStep("Sprint Pass processed");
    }
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdate(subscription);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  logStep("Handling subscription update", { 
    subscriptionId: subscription.id, 
    status: subscription.status 
  });

  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    logStep("Customer was deleted");
    return;
  }

  const email = (customer as Stripe.Customer).email;
  if (!email) {
    logStep("No email on customer");
    return;
  }

  const userId = await getUserIdByEmail(email);
  if (!userId) {
    logStep("No user found for email", { email });
    return;
  }

  if (subscription.status !== "active") {
    logStep("Subscription not active, skipping credit grant");
    if (subscription.status === "canceled") {
      await updateUserPlan(userId, "free");
    }
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = getPlanFromPriceId(priceId || "");

  await updateUserPlan(userId, plan);
  logStep("Plan updated", { plan, priceId });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  logStep("Handling invoice.payment_succeeded", { invoiceId: invoice.id });

  if (!invoice.subscription) {
    logStep("Not a subscription invoice, skipping");
    return;
  }

  const customerId = invoice.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) return;

  const email = (customer as Stripe.Customer).email;
  if (!email) return;

  const userId = await getUserIdByEmail(email);
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const priceId = subscription.items.data[0]?.price?.id;
  
  const plan = getPlanFromPriceId(priceId || "");
  const credits = PLAN_CREDITS[plan] || 0;

  if (credits > 0) {
    await grantCredits(userId, credits, `Monthly ${plan} plan credits`, "subscription_renewal");
  }
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    logStep("Webhook signature verification failed", { error: (err as Error).message });
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        const deletedSub = event.data.object as Stripe.Subscription;
        const customerId = deletedSub.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && (customer as Stripe.Customer).email) {
          const userId = await getUserIdByEmail((customer as Stripe.Customer).email!);
          if (userId) {
            await updateUserPlan(userId, "free");
            logStep("User downgraded to free");
          }
        }
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    logStep("Error processing event", { error: (err as Error).message });
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
