import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageviewData {
  projectId: string;
  pagePath?: string;
  referrer?: string;
  sessionId?: string;
}

function parseUserAgent(ua: string): { deviceType: string; browser: string } {
  let deviceType = 'desktop';
  let browser = 'unknown';

  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  else if (/msie|trident/i.test(ua)) browser = 'IE';

  return { deviceType, browser };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projectId, pagePath = '/', referrer, sessionId }: PageviewData = await req.json();

    if (!projectId) {
      console.error('Missing projectId');
      return new Response(
        JSON.stringify({ error: 'projectId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user agent and IP info
    const userAgent = req.headers.get('user-agent') || '';
    const { deviceType, browser } = parseUserAgent(userAgent);

    // Get country from Cloudflare header if available
    const country = req.headers.get('cf-ipcountry') || null;
    const city = req.headers.get('cf-ipcity') || null;

    console.log(`Tracking pageview for project ${projectId}: ${pagePath}`);

    const { data, error } = await supabase
      .from('site_analytics')
      .insert({
        project_id: projectId,
        page_path: pagePath,
        referrer: referrer || null,
        user_agent: userAgent,
        country,
        city,
        device_type: deviceType,
        browser,
        session_id: sessionId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert pageview:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pageview tracked successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Tracking error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
