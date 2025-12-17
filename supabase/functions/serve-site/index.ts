import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-original-host, x-forwarded-host',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the domain from headers (set by Caddy)
    const domain = req.headers.get('x-original-host') || 
                   req.headers.get('x-forwarded-host') || 
                   req.headers.get('host')

    if (!domain) {
      console.log('[serve-site] No domain header found')
      return new Response('Domain not specified', { status: 400 })
    }

    console.log(`[serve-site] Serving site for domain: ${domain}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Look up the domain to get the project_id
    const { data: domainData, error: domainError } = await supabase
      .from('custom_domains')
      .select('project_id')
      .eq('domain', domain)
      .eq('status', 'active')
      .maybeSingle()

    if (domainError || !domainData) {
      console.log(`[serve-site] Domain not found: ${domain}`)
      return new Response('Site not found', { status: 404 })
    }

    // Get the project's published HTML
    const { data: projectData, error: projectError } = await supabase
      .from('builder_projects')
      .select('name, published_url')
      .eq('id', domainData.project_id)
      .maybeSingle()

    if (projectError || !projectData || !projectData.published_url) {
      console.log(`[serve-site] Project not published: ${domainData.project_id}`)
      return new Response('Site not published', { status: 404 })
    }

    // Fetch the HTML from storage
    const htmlResponse = await fetch(projectData.published_url)
    
    if (!htmlResponse.ok) {
      console.error(`[serve-site] Failed to fetch HTML from storage`)
      return new Response('Failed to load site', { status: 500 })
    }

    const html = await htmlResponse.text()

    console.log(`[serve-site] Successfully serving: ${projectData.name} for ${domain}`)

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('[serve-site] Unexpected error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
