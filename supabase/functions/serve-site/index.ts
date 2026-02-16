import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-original-host, x-forwarded-host',
}

const EXCELLION_DOMAIN = 'excellion.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    let projectData: { name: string; published_url: string } | null = null

    // Check if it's an Excellion subdomain (e.g., my-site.excellion.app)
    const excellionMatch = domain.match(/^([a-z0-9-]+)\.excellion\.app$/i)
    
    if (excellionMatch) {
      const slug = excellionMatch[1]
      console.log(`[serve-site] Excellion subdomain detected, slug: ${slug}`)
      
      // Look up project by slug in published_url
      const { data, error } = await supabase
        .from('builder_projects')
        .select('name, published_url')
        .ilike('published_url', `%/${slug}/index.html`)
        .maybeSingle()

      if (error || !data) {
        console.log(`[serve-site] Project not found for slug: ${slug}`)
        return new Response('Site not found', { status: 404 })
      }
      
      projectData = data
    } else {
      // Custom domain lookup via custom_domains table
      const { data: domainData, error: domainError } = await supabase
        .from('custom_domains')
        .select('project_id')
        .eq('domain', domain)
        .or('status.eq.active,is_verified.eq.true')
        .maybeSingle()

      if (domainError || !domainData) {
        console.log(`[serve-site] Custom domain not found: ${domain}`)
        return new Response('Site not found', { status: 404 })
      }

      // Check if this domain is linked to a course via builder_project_id
      const { data: courseData } = await supabase
        .from('courses')
        .select('subdomain, status')
        .eq('builder_project_id', domainData.project_id)
        .eq('status', 'published')
        .maybeSingle()

      if (courseData?.subdomain) {
        // Redirect to the course page on the main app
        const redirectUrl = `https://excellion.lovable.app/course/${courseData.subdomain}`
        console.log(`[serve-site] Course domain redirect: ${domain} -> ${redirectUrl}`)
        return new Response(null, {
          status: 302,
          headers: {
            'Location': redirectUrl,
            ...corsHeaders
          }
        })
      }

      // Otherwise serve the site builder project
      const { data, error } = await supabase
        .from('builder_projects')
        .select('name, published_url')
        .eq('id', domainData.project_id)
        .maybeSingle()

      if (error || !data || !data.published_url) {
        console.log(`[serve-site] Project not published: ${domainData.project_id}`)
        return new Response('Site not published', { status: 404 })
      }
      
      projectData = data
    }

    if (!projectData?.published_url) {
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
