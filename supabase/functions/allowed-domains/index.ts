import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const domain = url.searchParams.get('domain')

    if (!domain) {
      console.log('[allowed-domains] Missing domain parameter')
      return new Response(
        JSON.stringify({ allowed: false, error: 'Missing domain parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[allowed-domains] Checking domain: ${domain}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if domain exists and is active in custom_domains table
    const { data, error } = await supabase
      .from('custom_domains')
      .select('id, project_id, status, ssl_provisioned')
      .eq('domain', domain)
      .eq('status', 'active')
      .maybeSingle()

    if (error) {
      console.error('[allowed-domains] Database error:', error)
      return new Response(
        JSON.stringify({ allowed: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data) {
      console.log(`[allowed-domains] Domain not found or not active: ${domain}`)
      return new Response(
        JSON.stringify({ allowed: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[allowed-domains] Domain allowed: ${domain}, project_id: ${data.project_id}`)
    
    // Update last_checked_at timestamp
    await supabase
      .from('custom_domains')
      .update({ last_checked_at: new Date().toISOString() })
      .eq('id', data.id)

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        project_id: data.project_id,
        ssl_provisioned: data.ssl_provisioned 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[allowed-domains] Unexpected error:', error)
    return new Response(
      JSON.stringify({ allowed: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
