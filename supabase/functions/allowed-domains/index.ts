import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXCELLION_DOMAIN = 'excellion.app'

Deno.serve(async (req) => {
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

    // Auto-allow all *.excellion.app subdomains
    if (domain.endsWith(`.${EXCELLION_DOMAIN}`)) {
      const slug = domain.replace(`.${EXCELLION_DOMAIN}`, '')
      console.log(`[allowed-domains] Auto-allowing Excellion subdomain: ${slug}.${EXCELLION_DOMAIN}`)
      return new Response(
        JSON.stringify({ allowed: true, excellion_subdomain: true, slug }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if domain exists and is verified in custom_domains table
    // Supports both project_id (site builder) and course_id (course) linked domains
    const { data, error } = await supabase
      .from('custom_domains')
      .select('id, project_id, course_id, status, ssl_provisioned, is_verified')
      .eq('domain', domain)
      .maybeSingle()

    if (error) {
      console.error('[allowed-domains] Database error:', error)
      return new Response(
        JSON.stringify({ allowed: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data) {
      console.log(`[allowed-domains] Domain not found: ${domain}`)
      return new Response(
        JSON.stringify({ allowed: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if domain is verified (using new is_verified column or legacy status='active')
    const isAllowed = data.is_verified || data.status === 'active'
    
    if (!isAllowed) {
      console.log(`[allowed-domains] Domain not verified: ${domain}`)
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
