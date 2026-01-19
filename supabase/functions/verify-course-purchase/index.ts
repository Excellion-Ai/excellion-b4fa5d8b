import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-COURSE-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse request
    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");
    logStep("Verifying session", { session_id });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { status: session.payment_status, customerId: session.customer });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        verified: false, 
        status: "pending",
        message: "Payment not yet completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get course info from metadata
    const courseId = session.metadata?.course_id;
    const courseTitle = session.metadata?.course_title;

    if (!courseId) {
      throw new Error("Course information not found in session");
    }

    // Update purchase status to completed
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .update({ 
        status: "completed",
        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        purchased_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session_id)
      .eq("user_id", user.id)
      .select("id, course_id")
      .maybeSingle();

    if (purchaseError) {
      logStep("Error updating purchase", { error: purchaseError.message });
    } else if (purchase) {
      logStep("Purchase updated to completed", { purchaseId: purchase.id });
    } else {
      // Purchase record doesn't exist - create it
      const { error: insertError } = await supabaseAdmin
        .from("purchases")
        .insert({
          user_id: user.id,
          course_id: courseId,
          stripe_checkout_session_id: session_id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amount_cents: session.amount_total || 0,
          currency: session.currency?.toUpperCase() || "USD",
          status: "completed",
        });
      
      if (insertError) {
        logStep("Error creating purchase record", { error: insertError.message });
      } else {
        logStep("Purchase record created");
      }
    }

    // Auto-enroll user in the course
    const { data: existingEnrollment } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!existingEnrollment) {
      const { error: enrollError } = await supabaseAdmin
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress_percent: 0,
        });
      
      if (enrollError) {
        logStep("Error auto-enrolling user", { error: enrollError.message });
      } else {
        logStep("User auto-enrolled in course");
      }
    }

    // Fetch course details for response
    const { data: course } = await supabaseAdmin
      .from("courses")
      .select("id, title, subdomain")
      .eq("id", courseId)
      .single();

    return new Response(JSON.stringify({ 
      verified: true, 
      status: "completed",
      course: {
        id: course?.id || courseId,
        title: course?.title || courseTitle,
        slug: course?.subdomain || courseId,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-course-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
