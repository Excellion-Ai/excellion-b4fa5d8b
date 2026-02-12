import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate a password reset link via admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.supabase.co')}/auth/v1/verify`,
      },
    });

    if (linkError) {
      console.error("Generate link error:", linkError.message);
      // Return success anyway to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The action_link from generateLink contains the full verification URL
    const resetLink = linkData?.properties?.action_link;

    if (!resetLink) {
      console.error("No action_link returned");
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rewrite the redirect so after verification the user lands on our Auth page
    const siteUrl = req.headers.get("origin") || "https://excellion.lovable.app";
    const finalLink = resetLink.replace(
      /redirect_to=[^&]*/,
      `redirect_to=${encodeURIComponent(siteUrl + "/auth?type=recovery")}`
    );

    // Send branded email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Excellion <onboarding@resend.dev>",
        to: [email.trim().toLowerCase()],
        subject: "Reset Your Excellion Password",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;border:1px solid #222;overflow:hidden;">
        <tr><td style="padding:40px 40px 20px;text-align:center;">
          <h1 style="color:#f59e0b;font-size:28px;margin:0 0 8px;">Excellion</h1>
          <p style="color:#888;font-size:14px;margin:0;">Password Reset Request</p>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 24px;">
            We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${finalLink}" style="display:inline-block;background:#f59e0b;color:#000;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Reset Password
              </a>
            </td></tr>
          </table>
          <p style="color:#666;font-size:13px;line-height:1.5;margin:0;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #222;">
          <p style="color:#555;font-size:12px;margin:0;text-align:center;">
            &copy; ${new Date().getFullYear()} Excellion. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
