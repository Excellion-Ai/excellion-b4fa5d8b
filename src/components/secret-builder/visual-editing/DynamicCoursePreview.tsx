import { SectionWrapper } from './SectionWrapper';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DynamicCoursePreviewProps {
  course: any;
  isVisualEditMode: boolean;
  onEditSection: (section: string) => void;
  onMoveSection: (from: number, to: number) => void;
  onRemoveSection: (section: string) => void;
}

export function DynamicCoursePreview({
  course,
  isVisualEditMode,
  onEditSection,
  onMoveSection,
  onRemoveSection,
}: DynamicCoursePreviewProps) {
  const layout = course.layout_template || 'suspended';
  const design = course.design_config || {};
  const colors = design.colors || {};
  const sections: string[] = course.section_order || ['hero', 'outcomes', 'curriculum', 'faq', 'cta'];
  const curriculum = course.curriculum || course;

  const cssVars: Record<string, string> = {
    '--color-primary': colors.primary || '#d4a853',
    '--color-secondary': colors.secondary || '#1a1a1a',
    '--color-accent': colors.accent || '#f59e0b',
    '--color-background': colors.background || '#0a0a0a',
    '--color-card': colors.cardBackground || '#111111',
    '--color-text': colors.text || '#ffffff',
    '--color-muted': colors.textMuted || '#9ca3af',
    '--spacing': design.spacing === 'compact' ? '24px' : design.spacing === 'spacious' ? '64px' : '40px',
    '--radius': design.borderRadius === 'none' ? '0px' : design.borderRadius === 'small' ? '4px' : design.borderRadius === 'large' ? '16px' : '8px',
  };

  return (
    <ScrollArea className="h-full">
      <div style={cssVars as any} className="min-h-full" >
        {sections.map((sectionType, index) => (
          <SectionWrapper
            key={`${sectionType}-${index}`}
            type={sectionType}
            isEditMode={isVisualEditMode}
            onEdit={() => onEditSection(sectionType)}
            onMoveUp={() => index > 0 && onMoveSection(index, index - 1)}
            onMoveDown={() => index < sections.length - 1 && onMoveSection(index, index + 1)}
            onRemove={() => onRemoveSection(sectionType)}
          >
            {renderSection(sectionType, layout, curriculum, colors)}
          </SectionWrapper>
        ))}
      </div>
    </ScrollArea>
  );
}

function renderSection(type: string, layout: string, curriculum: any, colors: any) {
  const bg = colors.background || '#0a0a0a';
  const cardBg = colors.cardBackground || '#111111';
  const primary = colors.primary || '#d4a853';
  const text = colors.text || '#ffffff';
  const muted = colors.textMuted || '#9ca3af';
  const secondary = colors.secondary || '#1a1a1a';
  const accent = colors.accent || '#f59e0b';

  if (type === 'hero') {
    if (layout === 'suspended') {
      return (
        <div style={{ background: `linear-gradient(135deg, ${secondary}, ${bg})`, padding: 'var(--spacing)' }}>
          <div style={{ background: cardBg, borderRadius: 'var(--radius)', border: `1px solid ${primary}33`, padding: '48px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <span style={{ background: primary, color: '#000', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
              {curriculum?.difficulty || 'Beginner'} Level
            </span>
            <h1 style={{ color: text, fontSize: '2.5rem', margin: '16px 0', lineHeight: 1.2 }}>
              {curriculum?.landing_page?.hero_headline || curriculum?.title || 'Course Title'}
            </h1>
            <p style={{ color: muted, marginBottom: '24px', fontSize: '1.1rem' }}>
              {curriculum?.landing_page?.hero_subheadline || curriculum?.description || 'Course description'}
            </p>
            <button style={{ background: primary, color: '#000', padding: '12px 24px', borderRadius: 'var(--radius)', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '16px' }}>
              {curriculum?.pages?.landing?.cta_text || 'Enroll Now'}
            </button>
          </div>
        </div>
      );
    }
    if (layout === 'timeline') {
      return (
        <div style={{ background: bg, padding: 'var(--spacing)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ width: '4px', height: '80px', background: primary, marginBottom: '24px' }} />
            <h1 style={{ color: text, fontSize: '2.5rem', marginBottom: '16px', lineHeight: 1.2 }}>
              {curriculum?.landing_page?.hero_headline || curriculum?.title || 'Course Title'}
            </h1>
            <p style={{ color: muted, marginBottom: '24px' }}>
              {curriculum?.landing_page?.hero_subheadline || curriculum?.description || ''}
            </p>
            <button style={{ background: primary, color: '#000', padding: '12px 24px', borderRadius: 'var(--radius)', fontWeight: 600, border: 'none' }}>
              Start Your Journey
            </button>
          </div>
          <div style={{ background: `linear-gradient(45deg, ${primary}, ${accent})`, borderRadius: 'var(--radius)', height: '300px' }} />
        </div>
      );
    }
    if (layout === 'grid') {
      return (
        <div style={{ background: bg, padding: 'var(--spacing)' }}>
          <div style={{ width: '100%', height: '300px', background: `linear-gradient(135deg, ${secondary}, ${primary})`, borderRadius: 'var(--radius)', marginBottom: '32px' }} />
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: text, fontSize: '3rem', marginBottom: '16px', lineHeight: 1.1 }}>
              {curriculum?.landing_page?.hero_headline || curriculum?.title || 'Course Title'}
            </h1>
            <p style={{ color: muted, fontSize: '1.1rem' }}>
              {curriculum?.landing_page?.hero_subheadline || curriculum?.description || ''}
            </p>
          </div>
        </div>
      );
    }
  }

  if (type === 'outcomes') {
    const outcomes = curriculum?.learning_outcomes || curriculum?.learningOutcomes || [];
    return (
      <div style={{ background: cardBg, padding: 'var(--spacing)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: text, marginBottom: '24px', textAlign: 'center', fontSize: '1.8rem' }}>What You'll Learn</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {outcomes.map((outcome: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: bg, borderRadius: 'var(--radius)' }}>
                <span style={{ color: primary, fontSize: '18px' }}>✓</span>
                <span style={{ color: text, fontSize: '14px' }}>{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'curriculum') {
    const modules = curriculum?.modules || [];
    return (
      <div style={{ background: bg, padding: 'var(--spacing)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: text, marginBottom: '24px', textAlign: 'center', fontSize: '1.8rem' }}>Course Curriculum</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modules.map((mod: any, i: number) => (
              <div key={i} style={{ background: cardBg, borderRadius: 'var(--radius)', border: `1px solid ${secondary}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderLeft: `4px solid ${primary}`, fontWeight: 600, color: text, fontSize: '15px' }}>
                  {mod.title}
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                  {(mod.lessons || []).map((lesson: any, j: number) => (
                    <div key={j} style={{ padding: '8px 0', color: muted, fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{lesson.title}</span>
                      <span>{lesson.duration || lesson.estimated_minutes ? `${lesson.estimated_minutes || ''} min` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'faq') {
    const faqs = curriculum?.landing_page?.faqs || [];
    return (
      <div style={{ background: cardBg, padding: 'var(--spacing)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: text, marginBottom: '24px', textAlign: 'center', fontSize: '1.8rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq: any, i: number) => (
              <div key={i} style={{ background: bg, padding: '20px', borderRadius: 'var(--radius)' }}>
                <div style={{ fontWeight: 600, color: text, marginBottom: '8px', fontSize: '15px' }}>{faq.question}</div>
                <div style={{ color: muted, fontSize: '14px' }}>{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'cta') {
    return (
      <div style={{ background: `linear-gradient(135deg, ${secondary}, ${bg})`, padding: 'var(--spacing)', textAlign: 'center' }}>
        <h2 style={{ color: text, marginBottom: '16px', fontSize: '2rem' }}>Ready to Get Started?</h2>
        <p style={{ color: muted, marginBottom: '24px' }}>{curriculum?.tagline || 'Begin your learning journey today'}</p>
        <button style={{ background: primary, color: '#000', padding: '16px 32px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '18px', border: 'none', cursor: 'pointer' }}>
          {curriculum?.pages?.landing?.cta_text || 'Enroll Now'}
        </button>
      </div>
    );
  }

  return null;
}
