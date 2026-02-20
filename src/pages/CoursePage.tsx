import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function CoursePage() {
  const { slug } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourse() {
      // Try by subdomain first, then by id
      let data: any = null

      const bySubdomain = await supabase
        .from('courses')
        .select('*, builder_project_id')
        .eq('subdomain', slug as string)
        .maybeSingle()

      if (bySubdomain.data) {
        data = bySubdomain.data
      } else if (slug?.match(/^[0-9a-f-]{36}$/i)) {
        const byId = await supabase
          .from('courses')
          .select('*, builder_project_id')
          .eq('id', slug as string)
          .maybeSingle()
        data = byId.data
      }

      if (data) {
        // Fallback: if design_config is empty, pull from linked builder_projects
        const designCfg = data.design_config as any
        const isEmptyDesign = !designCfg || Object.keys(designCfg).length === 0
        if (isEmptyDesign && data.builder_project_id) {
          const { data: proj } = await supabase
            .from('builder_projects')
            .select('spec')
            .eq('id', data.builder_project_id)
            .maybeSingle()
          const courseSpec = (proj?.spec as any)?.courseSpec
          if (courseSpec) {
            data.design_config = courseSpec.design_config || {}
            data._fallback_curriculum = courseSpec.curriculum || courseSpec
          }
        }

        setCourse(data)
        console.log('Course loaded:', data)
        console.log('Design config:', data.design_config)
        console.log('Modules:', data.modules)
        console.log('Page sections:', data.page_sections)
      }
      setLoading(false)
    }

    if (slug) loadCourse()
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading...
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Course not found
      </div>
    )
  }

  // Extract design settings
  const design = (course.design_config as any) || {}
  const colors = design.colors || {}
  const fonts = design.fonts || {}

  // Modules live directly in courses.modules (JSONB array), NOT in curriculum
  const modules: any[] = Array.isArray(course.modules) ? course.modules : []

  // Landing page data: page_sections.landing → fallback curriculum → bare fields
  const pageSections = (course.page_sections as any) || {}
  const fallbackCurriculum = (course._fallback_curriculum as any) || {}
  const landingPage = pageSections.landing || fallbackCurriculum.landing_page || {}
  const heroImage = landingPage.hero_image || design.hero_image || null

  const heroHeadline = landingPage.hero_headline || fallbackCurriculum.hero_headline || course.title
  const heroSubheadline = landingPage.hero_subheadline || fallbackCurriculum.description || course.description
  const tagline = landingPage.tagline || fallbackCurriculum.tagline || ''
  const difficulty = course.difficulty || 'Beginner'
  const durationWeeks = course.duration_weeks || 6
  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)

  // Colors with fallbacks
  const primaryColor = colors.primary || '#d4a853'
  const backgroundColor = colors.background || '#0a0a0a'
  const cardBgColor = colors.cardBackground || '#111111'
  const textColor = colors.text || '#ffffff'
  const mutedColor = colors.textMuted || '#9ca3af'
  const headingFont = fonts.heading || 'Inter'
  const bodyFont = fonts.body || 'Inter'

  return (
    <div style={{ minHeight: '100vh', backgroundColor, color: textColor, fontFamily: `'${bodyFont}', sans-serif` }}>

      {/* HERO SECTION */}
      <div style={{
        position: 'relative',
        minHeight: '500px',
        backgroundImage: heroImage ? `url(${heroImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 24px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: heroImage
            ? 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5))'
            : `linear-gradient(135deg, ${colors.secondary || '#1a1a1a'}, ${backgroundColor})`,
        }} />

        {/* Hero Content */}
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <span style={{
            backgroundColor: primaryColor,
            color: '#000',
            padding: '6px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {difficulty} Level
          </span>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginTop: '24px',
            marginBottom: '16px',
            fontFamily: `'${headingFont}', sans-serif`,
            color: textColor,
            lineHeight: 1.2,
          }}>
            {heroHeadline}
          </h1>

          {tagline && (
            <p style={{ fontSize: '1.25rem', color: primaryColor, marginBottom: '16px', fontWeight: '500' }}>
              {tagline}
            </p>
          )}

          <p style={{ fontSize: '1.125rem', color: mutedColor, marginBottom: '24px', lineHeight: '1.7' }}>
            {heroSubheadline}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', color: mutedColor, fontSize: '14px', flexWrap: 'wrap' }}>
            <span>📚 {modules.length} modules</span>
            <span>📝 {totalLessons} lessons</span>
            <span>⏱️ {durationWeeks} weeks</span>
          </div>

          <button style={{
            backgroundColor: primaryColor,
            color: '#000',
            padding: '16px 32px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
          }}>
            {course.price_cents && course.price_cents > 0
              ? `Enroll Now — $${(course.price_cents / 100).toFixed(2)}`
              : 'Enroll for Free'}
          </button>
        </div>
      </div>

      {/* CURRICULUM SECTION */}
      <div style={{ backgroundColor: cardBgColor, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '32px', color: textColor }}>
            Course Curriculum
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {modules.map((module: any, i: number) => (
              <div key={i} style={{
                backgroundColor,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: primaryColor,
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  flexShrink: 0,
                  fontSize: '14px',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '600', color: textColor, marginBottom: '4px', fontSize: '1rem' }}>
                    {module.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: mutedColor }}>
                    {module.lessons?.length || 0} lessons{module.description ? ` • ${module.description}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '32px', color: mutedColor, fontSize: '14px' }}>
        Powered by Excellion
      </div>

    </div>
  )
}
