import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
  siteName?: string;
  recipientEmail?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { name, email, message, siteName, recipientEmail }: ContactFormRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default recipient if not specified
    const toEmail = recipientEmail || 'excellionai@gmail.com';
    const fromSite = siteName || 'Website';

    console.log(`Sending contact form email from ${email} to ${toEmail}`);

    // Send notification email to site owner
    const { error: notifyError } = await resend.emails.send({
      from: `${fromSite} Contact <onboarding@resend.dev>`,
      to: [toEmail],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This message was sent via the contact form on ${fromSite}.</p>
        </div>
      `,
    });

    if (notifyError) {
      console.error('Failed to send notification email:', notifyError);
      throw notifyError;
    }

    // Send confirmation email to the person who submitted
    const { error: confirmError } = await resend.emails.send({
      from: `${fromSite} <onboarding@resend.dev>`,
      to: [email],
      subject: `We received your message - ${fromSite}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Best regards,<br>The ${fromSite} Team</p>
        </div>
      `,
    });

    if (confirmError) {
      console.error('Failed to send confirmation email:', confirmError);
      // Don't fail the request if confirmation email fails
    }

    console.log('Contact form emails sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to send message', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
