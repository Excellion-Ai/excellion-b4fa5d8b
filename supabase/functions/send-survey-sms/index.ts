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

interface SurveyData {
  name: string;
  phone: string;
  brandName: string;
  mainOutcome: string;
  featuresNeeded: string[];
  brandContentStatus: string;
  timeline: string;
  qualifiedPlan: string;
  additionalNotes?: string;
  otherFeatureDetails?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const surveyData: SurveyData = await req.json();
    
    // Rate limiting check
    if (!checkRateLimit(surveyData.phone)) {
      console.log("Rate limit exceeded for phone:", surveyData.phone);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
    const TO_PHONE_NUMBER = "970-234-0640";

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio credentials not configured");
    }

    // Format features list
    const featuresList = surveyData.featuresNeeded.join(", ");
    
    // Create SMS message
    const message = `New Survey Submission - Done For You\n\n` +
      `Name: ${surveyData.name}\n` +
      `Phone: ${surveyData.phone}\n` +
      `Brand: ${surveyData.brandName}\n` +
      `Plan: ${surveyData.qualifiedPlan}\n` +
      `Main Goal: ${surveyData.mainOutcome}\n` +
      `Features: ${featuresList}\n` +
      `Branding: ${surveyData.brandContentStatus}\n` +
      `Timeline: ${surveyData.timeline}` +
      (surveyData.otherFeatureDetails ? `\nOther Details: ${surveyData.otherFeatureDetails}` : "") +
      (surveyData.additionalNotes ? `\nNotes: ${surveyData.additionalNotes}` : "");

    console.log("Sending SMS to:", TO_PHONE_NUMBER);

    // Send SMS using Twilio API
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: TO_PHONE_NUMBER,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      }
    );

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error("Twilio API error:", errorText);
      throw new Error(`Twilio API error: ${errorText}`);
    }

    const result = await twilioResponse.json();
    console.log("SMS sent successfully:", result.sid);

    // Send confirmation SMS to business number
    const confirmationMessage = `Survey confirmation: ${surveyData.name} (${surveyData.phone}) submitted. Qualified for ${surveyData.qualifiedPlan} plan.`;
    
    const confirmationResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: TO_PHONE_NUMBER,
          From: TWILIO_PHONE_NUMBER,
          Body: confirmationMessage,
        }),
      }
    );

    if (confirmationResponse.ok) {
      const confirmationResult = await confirmationResponse.json();
      console.log("Confirmation SMS sent to user:", confirmationResult.sid);
    } else {
      console.error("Failed to send confirmation SMS to user");
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-survey-sms function:", error);
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
