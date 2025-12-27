import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

interface MaintenanceRequest {
  name: string;
  email: string;
  websiteUrl?: string;
  description: string;
  priority: string;
  imageUrls?: string[];
  captchaToken?: string;
}

// Verify hCaptcha token server-side
const verifyCaptcha = async (token: string): Promise<boolean> => {
  const HCAPTCHA_SECRET_KEY = Deno.env.get("HCAPTCHA_SECRET_KEY");
  if (!HCAPTCHA_SECRET_KEY) {
    console.error("HCAPTCHA_SECRET_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${HCAPTCHA_SECRET_KEY}`,
    });
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("hCaptcha verification error:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, websiteUrl, description, priority, imageUrls, captchaToken }: MaintenanceRequest = await req.json();

    // Verify hCaptcha token
    if (!captchaToken) {
      console.log("Missing captcha token");
      return new Response(
        JSON.stringify({ error: "Captcha verification required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const isValidCaptcha = await verifyCaptcha(captchaToken);
    if (!isValidCaptcha) {
      console.log("Invalid captcha token");
      return new Response(
        JSON.stringify({ error: "Invalid captcha verification" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing maintenance request from:", email, "with", imageUrls?.length || 0, "images");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("Resend API key not configured");
    }

    // Priority label for display
    const priorityLabels: { [key: string]: string } = {
      urgent: "🔴 Urgent",
      high: "🟠 High",
      normal: "🟡 Normal",
      low: "🟢 Low"
    };

    const priorityLabel = priorityLabels[priority] || priority;

    // Format images HTML
    const imagesHtml = imageUrls && imageUrls.length > 0 
      ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">📸 Attached Screenshots (${imageUrls.length})</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
            ${imageUrls.map((url, index) => `
              <div>
                <a href="${url}" target="_blank" style="text-decoration: none;">
                  <img src="${url}" alt="Screenshot ${index + 1}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #d4af37;" />
                </a>
              </div>
            `).join('')}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">Click images to view full size</p>
        </div>
      `
      : '';

    // Send email to Excellion team
    const teamEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #581c87; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          New Maintenance Request
        </h1>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Request Details</h2>
          <p><strong>Priority:</strong> ${priorityLabel}</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a></p>
          ${websiteUrl ? `<p><strong>Website/Project:</strong> ${escapeHtml(websiteUrl)}</p>` : ''}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Description</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(description)}</p>
        </div>

        ${imagesHtml}

        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #581c87; border-radius: 4px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Action Required:</strong> Please respond to ${escapeHtml(email)} within 24 hours.
          </p>
        </div>
      </div>
    `;

    const teamEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Excellion Maintenance <noreply@excellionwebsites.com>",
        to: ["excellionai@gmail.com"],
        subject: `${priorityLabel} - Maintenance Request from ${escapeHtml(name)}`,
        html: teamEmailHtml,
      }),
    });

    if (!teamEmailResponse.ok) {
      const errorText = await teamEmailResponse.text();
      console.error("Failed to send team notification email:", errorText);
      throw new Error(`Failed to send team notification: ${errorText}`);
    }

    const teamResult = await teamEmailResponse.json();
    console.log("Team email sent successfully:", teamResult);

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #581c87; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          Maintenance Request Received
        </h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hi ${escapeHtml(name)},
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for submitting your maintenance request. We've received your ${escapeHtml(priority)} priority request and our team will review it shortly.
        </p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">What You Submitted</h2>
          <p><strong>Priority:</strong> ${priorityLabel}</p>
          ${websiteUrl ? `<p><strong>Website/Project:</strong> ${escapeHtml(websiteUrl)}</p>` : ''}
          <p><strong>Description:</strong></p>
          <p style="white-space: pre-wrap; line-height: 1.6; color: #555;">${escapeHtml(description)}</p>
          ${imageUrls && imageUrls.length > 0 ? `<p style="margin-top: 10px;"><strong>Attachments:</strong> ${imageUrls.length} image(s)</p>` : ''}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #581c87; margin-top: 0;">⏱️ What Happens Next?</h3>
          <ul style="line-height: 1.8; color: #333;">
            <li>Our team will review your request within 24 hours</li>
            <li>We'll send you an update via email</li>
            <li>For urgent issues, we'll prioritize your request</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Need immediate assistance? Join our Discord server or reply directly to this email.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #581c87;">The Excellion Team</strong>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            <a href="https://discord.gg/tmDTkwVY9u" style="color: #581c87; text-decoration: none;">Discord</a> • 
            <a href="mailto:excellionai@gmail.com" style="color: #581c87; text-decoration: none;">Email</a>
          </p>
        </div>
      </div>
    `;

    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Excellion Support <noreply@excellionwebsites.com>",
        to: [email],
        subject: "We received your maintenance request",
        html: customerEmailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const errorText = await customerEmailResponse.text();
      console.error("Failed to send customer confirmation email:", errorText);
      // Don't throw here, team email was successful
    } else {
      const customerResult = await customerEmailResponse.json();
      console.log("Customer confirmation email sent successfully:", customerResult);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        teamEmailSent: true,
        customerEmailSent: customerEmailResponse.ok
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
    console.error("Error in send-maintenance-request function:", error);
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
