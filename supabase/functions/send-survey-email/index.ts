import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // 3 requests per minute per phone

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
};

// Verify hCaptcha token
const verifyCaptcha = async (token: string): Promise<boolean> => {
  const HCAPTCHA_SECRET_KEY = Deno.env.get("HCAPTCHA_SECRET_KEY");
  
  if (!HCAPTCHA_SECRET_KEY) {
    console.error("hCaptcha secret key not configured");
    return false;
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `response=${token}&secret=${HCAPTCHA_SECRET_KEY}`,
    });

    const data = await response.json();
    console.log("hCaptcha verification result:", data);
    return data.success === true;
  } catch (error) {
    console.error("Error verifying hCaptcha:", error);
    return false;
  }
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
  captchaToken?: string;
}

// Helper function to get first name
const getFirstName = (name: string): string => {
  if (!name || name.trim() === "") return "there";
  const parts = name.trim().split(/\s+/);
  return parts[0];
};

// Helper function to format main outcome
const formatMainOutcome = (mainOutcome: string): string => {
  const outcomeMap: { [key: string]: string } = {
    "sell-online": "selling online",
    "professional": "looking more professional",
    "leads": "getting more leads",
    "convert-better": "getting better conversions",
    "bookings": "getting more bookings"
  };
  
  return outcomeMap[mainOutcome] || mainOutcome || "achieving your goals";
};

// Helper function to format features
const formatFeatures = (featuresNeeded: string[]): string => {
  if (!featuresNeeded || featuresNeeded.length === 0) {
    return "the features we discussed";
  }
  
  // Map feature codes to readable names
  const featureMap: { [key: string]: string } = {
    "contact": "contact form",
    "booking": "booking",
    "payments": "payments",
    "online-ordering": "online ordering",
    "automations": "automations",
    "other": "custom features"
  };
  
  const readableFeatures = featuresNeeded.map(f => featureMap[f] || f);
  
  if (readableFeatures.length === 1) {
    return readableFeatures[0];
  }
  
  if (readableFeatures.length === 2) {
    return `${readableFeatures[0]} and ${readableFeatures[1]}`;
  }
  
  // Three or more features
  const allButLast = readableFeatures.slice(0, -1).join(", ");
  const last = readableFeatures[readableFeatures.length - 1];
  return `${allButLast}, and ${last}`;
};

// Helper function to format timeline
const formatTimeline = (timeline: string): string => {
  const timelineMap: { [key: string]: string } = {
    "2-3-days": "2–3 days",
    "4-7-days": "4–7 days",
    "exploring": "flexible timing"
  };
  
  return timelineMap[timeline] || timeline || "your preferred timeline";
};

// Helper function to get price line based on qualified plan
const getPriceLine = (qualifiedPlan: string): string => {
  if (qualifiedPlan === "Essential") {
    return "Most Essential builds land in the $600–$1,000 range depending on pages and features, and I'll narrow that in once I have a bit more detail from you.";
  }
  
  return "Once I have a bit more detail from you, I'll narrow in an exact range for your build.";
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SurveyEmailRequest = await req.json();
    console.log("Received survey data for email:", data);

    // Verify hCaptcha token
    if (!data.captchaToken) {
      console.log("Missing captcha token");
      return new Response(
        JSON.stringify({ error: "Captcha verification required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const captchaValid = await verifyCaptcha(data.captchaToken);
    if (!captchaValid) {
      console.log("Invalid captcha token");
      return new Response(
        JSON.stringify({ error: "Captcha verification failed. Please try again." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(data.phone)) {
      console.log("Rate limit exceeded for phone:", data.phone);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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
    
    // Generate personalized content using helper functions
    const firstName = getFirstName(name);
    const outcomeText = formatMainOutcome(mainOutcome || "");
    const featuresText = formatFeatures(featuresNeeded || []);
    const priceLine = getPriceLine(qualifiedPlan);
    const timelineText = formatTimeline(timeline || "");
    const brand = brandName || "your business";
    
    // Build personalized email body
    const personalizedEmailBody = `Hi ${firstName}, this is John from Excellion Websites.

Thanks for filling out the estimate form for ${brand}. I see you're looking at a ${qualifiedPlan} build focused on ${outcomeText} with ${featuresText}. ${priceLine}

You mentioned a turnaround of about ${timelineText}, so I'm putting together your mockup and exact estimate now and just need a few quick details so I can nail the layout:

1) What do you sell, and how do people currently buy or book with you?
2) Do you have any existing logo/colors, or should I propose a fresh look?
3) Roughly how many services or packages should be listed on the site?
4) Any must-have pages (e.g. Home, Services, Pricing, Contact, FAQs)?

You can reply directly to this email with your answers. Once I have them, I'll send over your first homepage draft and a tighter price estimate to review.`;
    
    // Send confirmation email to user (if email provided)
    let userEmailSent = false;
    if (email) {
      const userEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="white-space: pre-wrap;">${personalizedEmailBody}</div>
        </div>
      `;

      const emailSubject = brandName 
        ? `Quick details for your ${brandName} website estimate`
        : `Quick details for your website estimate`;

      const userEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "John at Excellion Websites <noreply@excellionwebsites.com>",
          to: [email],
          subject: emailSubject,
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
        from: "Excellion Notifications <noreply@excellionwebsites.com>",
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
