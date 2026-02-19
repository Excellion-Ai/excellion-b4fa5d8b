import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-original-host, x-forwarded-host',
}

const EXCELLION_DOMAIN = 'excellion.app'

function generateCourseHTML(course: Record<string, unknown>): string {
  const title = (course.seo_title || course.title || 'Course') as string;
  const description = (course.seo_description || course.description || '') as string;
  const thumbnail = (course.thumbnail_url || '') as string;
  const subdomain = (course.subdomain || '') as string;
  const difficulty = (course.difficulty || 'beginner') as string;
  const durationWeeks = (course.duration_weeks || 6) as number;
  const priceCents = (course.price_cents || 0) as number;
  const instructorName = (course.instructor_name || 'Your Instructor') as string;
  const instructorBio = (course.instructor_bio || '') as string;

  const priceDisplay = priceCents === 0 ? 'Free' : `$${(priceCents / 100).toFixed(2)}`;
  
  // Extract modules/lessons from course data
  const modules = (course.modules || []) as Array<{title: string; description?: string; lessons?: Array<{title: string; estimated_minutes?: number; is_preview?: boolean}>}>;
  
  const modulesHTML = modules.map((mod, i) => `
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="color:#f59e0b;font-size:14px;font-weight:600;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Module ${i + 1}</h3>
      <h4 style="color:#ffffff;font-size:18px;font-weight:700;margin:0 0 12px;">${escapeHtml(mod.title)}</h4>
      ${mod.description ? `<p style="color:#999;font-size:14px;margin:0 0 16px;">${escapeHtml(mod.description)}</p>` : ''}
      ${(mod.lessons || []).map(lesson => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #2a2a2a;">
          <div style="width:28px;height:28px;background:#f59e0b20;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
          <span style="color:#e0e0e0;font-size:14px;flex:1;">${escapeHtml(lesson.title)}</span>
          ${lesson.estimated_minutes ? `<span style="color:#666;font-size:12px;">${lesson.estimated_minutes}min</span>` : ''}
          ${lesson.is_preview ? `<span style="color:#f59e0b;font-size:11px;border:1px solid #f59e0b40;padding:2px 8px;border-radius:4px;">Preview</span>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');

  const enrollUrl = `https://excellion.lovable.app/course/${subdomain}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${thumbnail ? `<meta property="og:image" content="${escapeHtml(thumbnail)}">` : ''}
  <meta property="og:type" content="website">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }
    a { color: #f59e0b; text-decoration: none; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
    .hero { padding: 80px 0 60px; text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b40; border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    .hero h1 { font-size: clamp(32px, 5vw, 56px); font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
    .hero p { font-size: 18px; color: #aaa; max-width: 600px; margin: 0 auto 36px; }
    .meta-row { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; margin-bottom: 40px; }
    .meta-item { display: flex; align-items: center; gap: 8px; color: #888; font-size: 14px; }
    .cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #f59e0b; color: #000; font-weight: 700; font-size: 18px; padding: 16px 40px; border-radius: 8px; border: none; cursor: pointer; transition: opacity 0.2s; }
    .cta-btn:hover { opacity: 0.9; }
    .section { padding: 60px 0; border-top: 1px solid #1a1a1a; }
    .section-label { color: #f59e0b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    .section h2 { font-size: 32px; font-weight: 800; margin-bottom: 32px; }
    .instructor-card { display: flex; gap: 20px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; }
    .instructor-avatar { width: 72px; height: 72px; background: #f59e0b20; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 28px; font-weight: 800; color: #f59e0b; }
    .footer { padding: 40px 0; text-align: center; border-top: 1px solid #1a1a1a; color: #555; font-size: 13px; }
    @media (max-width: 600px) { .meta-row { gap: 12px; } .instructor-card { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">✦ Online Course</div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <div class="meta-row">
        <div class="meta-item">📚 ${durationWeeks} weeks</div>
        <div class="meta-item">📊 ${escapeHtml(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))}</div>
        <div class="meta-item">💰 ${priceDisplay}</div>
        <div class="meta-item">📝 ${modules.length} modules</div>
      </div>
      <a href="${enrollUrl}" class="cta-btn">
        ${priceCents === 0 ? 'Enroll Free' : `Enroll for ${priceDisplay}`} →
      </a>
    </div>

    ${modules.length > 0 ? `
    <div class="section">
      <p class="section-label">Curriculum</p>
      <h2>What You'll Learn</h2>
      ${modulesHTML}
    </div>
    ` : ''}

    ${instructorName ? `
    <div class="section">
      <p class="section-label">Your Instructor</p>
      <div class="instructor-card">
        <div class="instructor-avatar">${escapeHtml(instructorName.charAt(0))}</div>
        <div>
          <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">${escapeHtml(instructorName)}</h3>
          ${instructorBio ? `<p style="color:#aaa;font-size:14px;">${escapeHtml(instructorBio)}</p>` : ''}
        </div>
      </div>
    </div>
    ` : ''}

    <div class="section" style="text-align:center;">
      <h2>Ready to get started?</h2>
      <p style="color:#aaa;margin-bottom:32px;">Join students learning ${escapeHtml(title)}</p>
      <a href="${enrollUrl}" class="cta-btn">
        ${priceCents === 0 ? 'Start Learning Free' : `Enroll Now — ${priceDisplay}`} →
      </a>
    </div>
  </div>
  <div class="footer">
    <p>Powered by <a href="https://excellion.app">Excellion</a></p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

    // Check if it's an Excellion subdomain (e.g., my-site.excellion.app)
    const excellionMatch = domain.match(/^([a-z0-9-]+)\.excellion\.app$/i)
    
    if (excellionMatch) {
      const slug = excellionMatch[1]
      console.log(`[serve-site] Excellion subdomain detected, slug: ${slug}`)
      
      // First check if it's a course subdomain
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, description, seo_title, seo_description, subdomain, status, published_at, modules, difficulty, duration_weeks, price_cents, currency, instructor_name, instructor_bio, thumbnail_url, social_image_url')
        .eq('subdomain', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (courseData) {
        console.log(`[serve-site] Serving course landing page for subdomain: ${slug}`)
        const html = generateCourseHTML(courseData as Record<string, unknown>)
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', ...corsHeaders }
        })
      }

      // Fall back to static site lookup
      const { data, error } = await supabase
        .from('builder_projects')
        .select('name, published_url')
        .ilike('published_url', `%/${slug}/index.html`)
        .maybeSingle()

      if (error || !data) {
        console.log(`[serve-site] Project not found for slug: ${slug}`)
        return new Response('Site not found', { status: 404 })
      }

      const htmlResponse = await fetch(data.published_url)
      if (!htmlResponse.ok) return new Response('Failed to load site', { status: 500 })
      const html = await htmlResponse.text()
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', ...corsHeaders }
      })
    }

    // Custom domain lookup
    const { data: domainData, error: domainError } = await supabase
      .from('custom_domains')
      .select('project_id, course_id')
      .eq('domain', domain)
      .or('status.eq.active,is_verified.eq.true')
      .maybeSingle()

    if (domainError || !domainData) {
      console.log(`[serve-site] Custom domain not found: ${domain}`)
      return new Response('Site not found', { status: 404 })
    }

    // If domain is linked directly to a course via course_id — SSR the course page
    if (domainData.course_id) {
      console.log(`[serve-site] Custom domain linked to course_id: ${domainData.course_id}`)
      const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('id, title, description, seo_title, seo_description, subdomain, status, published_at, modules, difficulty, duration_weeks, price_cents, currency, instructor_name, instructor_bio, thumbnail_url, social_image_url')
        .eq('id', domainData.course_id)
        .eq('status', 'published')
        .maybeSingle()

      if (courseErr || !course) {
        console.log(`[serve-site] Course not found or not published for course_id: ${domainData.course_id}`)
        return new Response('Course not found or not published', { status: 404 })
      }

      const html = generateCourseHTML(course as Record<string, unknown>)
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', ...corsHeaders }
      })
    }

    // Legacy: domain linked via builder_project_id — check if it maps to a course
    if (domainData.project_id) {
      const { data: linkedCourse } = await supabase
        .from('courses')
        .select('id, title, description, seo_title, seo_description, subdomain, status, published_at, modules, difficulty, duration_weeks, price_cents, currency, instructor_name, instructor_bio, thumbnail_url, social_image_url')
        .eq('builder_project_id', domainData.project_id)
        .eq('status', 'published')
        .maybeSingle()

      if (linkedCourse) {
        console.log(`[serve-site] Legacy: serving course via builder_project_id`)
        const html = generateCourseHTML(linkedCourse as Record<string, unknown>)
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', ...corsHeaders }
        })
      }

      // Serve static site builder project
      const { data, error } = await supabase
        .from('builder_projects')
        .select('name, published_url')
        .eq('id', domainData.project_id)
        .maybeSingle()

      if (error || !data || !data.published_url) {
        return new Response('Site not published', { status: 404 })
      }

      const htmlResponse = await fetch(data.published_url)
      if (!htmlResponse.ok) return new Response('Failed to load site', { status: 500 })
      const html = await htmlResponse.text()
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', ...corsHeaders }
      })
    }

    return new Response('Site not found', { status: 404 })

  } catch (error) {
    console.error('[serve-site] Unexpected error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
