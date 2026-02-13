import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-COURSE-CHECKOUT] ${step}${detailsStr}`);
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

    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const { course_id, success_url, cancel_url } = await req.json();
    
    if (!course_id) {
      throw new Error("course_id is required");
    }
    logStep("Request parsed", { course_id });

    // Fetch course details
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("id, title, price_cents, currency, subdomain, user_id")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }
    logStep("Course fetched", { courseId: course.id, price_cents: course.price_cents });

    // Check if course is free
    if (!course.price_cents || course.price_cents <= 0) {
      throw new Error("This course is free. No payment required.");
    }

    // Check if user already purchased
    const { data: existingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPurchase) {
      throw new Error("You have already purchased this course");
    }
    logStep("No existing purchase found");

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

    // Build success/cancel URLs
    const origin = req.headers.get("origin") || "https://excellion.lovable.app";
    const courseSlug = course.subdomain || course.id;
    const finalSuccessUrl = success_url || `${origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}&course=${courseSlug}`;
    const finalCancelUrl = cancel_url || `${origin}/course/${courseSlug}`;

    // Create checkout session with price_data for dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: (course.currency || "USD").toLowerCase(),
            product_data: {
              name: course.title,
              description: `Full access to ${course.title}`,
            },
            unit_amount: course.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        user_id: user.id,
        course_id: course.id,
        course_title: course.title,
      },
    });
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create pending purchase record
    const { error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: user.id,
        course_id: course.id,
        stripe_checkout_session_id: session.id,
        amount_cents: course.price_cents,
        currency: course.currency || "USD",
        status: "pending",
      });

    if (purchaseError) {
      logStep("Warning: Failed to create pending purchase", { error: purchaseError.message });
    } else {
      logStep("Pending purchase created");
    }

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-course-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
