import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SurveyEmailRequest {
  name: string;
  phone: string;
  email?: string;
  brandName?: string;
  mainOutcome?: string;
  featuresNeeded?: string[];
  brandContentStatus?: string;
  timeline?: string;
  qualifiedPlan: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SurveyEmailRequest = await req.json();
    console.log("Received survey data for email:", data);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("Resend API key not configured");
    }

    const {
      name,
      phone,
      email,
      brandName,
      mainOutcome,
      featuresNeeded,
      brandContentStatus,
      timeline,
      qualifiedPlan,
    } = data;

    // Prepare email content
    const featuresList = featuresNeeded?.join(", ") || "None specified";
    
    // Send confirmation email to user (if email provided)
    let userEmailSent = false;
    if (email) {
      const userEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #581c87;">Thank You for Your Estimate Request!</h1>
          <p>Hi ${name},</p>
          <p>We've received your website estimate request and are excited to help bring your vision to life!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #581c87; margin-top: 0;">Your Qualified Plan: ${qualifiedPlan}</h2>
            <p><strong>Brand Name:</strong> ${brandName || "Not specified"}</p>
            <p><strong>Main Goal:</strong> ${mainOutcome || "Not specified"}</p>
            <p><strong>Timeline:</strong> ${timeline || "Not specified"}</p>
            <p><strong>Features Needed:</strong> ${featuresList}</p>
          </div>

          <p>Our team will review your requirements and get back to you shortly to discuss next steps.</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The Excellion Team</strong></p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </div>
      `;

      const userEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Excellion <onboarding@resend.dev>",
          to: [email],
          subject: "Your Free Website Estimate - Excellion",
          html: userEmailHtml,
        }),
      });

      if (userEmailResponse.ok) {
        const result = await userEmailResponse.json();
        console.log("Confirmation email sent to user:", result);
        userEmailSent = true;
      } else {
        const errorText = await userEmailResponse.text();
        console.error("Failed to send confirmation email to user:", errorText);
      }
    }

    // Send notification email to business
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #581c87;">New Estimate Request Received</h1>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #581c87; margin-top: 0;">Contact Information</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email || "Not provided"}</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #581c87; margin-top: 0;">Project Details</h2>
          <p><strong>Qualified Plan:</strong> ${qualifiedPlan}</p>
          <p><strong>Brand Name:</strong> ${brandName || "Not specified"}</p>
          <p><strong>Main Outcome:</strong> ${mainOutcome || "Not specified"}</p>
          <p><strong>Timeline:</strong> ${timeline || "Not specified"}</p>
          <p><strong>Brand Content Status:</strong> ${brandContentStatus || "Not specified"}</p>
          <p><strong>Features Needed:</strong> ${featuresList}</p>
        </div>
        
        <p style="margin-top: 30px;">Follow up with this lead as soon as possible!</p>
      </div>
    `;

    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Excellion Notifications <onboarding@resend.dev>",
        to: ["excellionai@gmail.com"],
        subject: `New Website Estimate Request - ${qualifiedPlan}`,
        html: businessEmailHtml,
      }),
    });

    if (!businessEmailResponse.ok) {
      const errorText = await businessEmailResponse.text();
      console.error("Failed to send notification email to business:", errorText);
      throw new Error(`Failed to send business notification: ${errorText}`);
    }

    const businessResult = await businessEmailResponse.json();
    console.log("Notification email sent to business:", businessResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        userEmailSent,
        businessEmailSent: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-survey-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
